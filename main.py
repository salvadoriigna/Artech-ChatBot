import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from pypdf import PdfReader
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.prompts import PromptTemplate
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.retrieval import create_retrieval_chain
import chromadb 
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError("La variable de entorno GOOGLE_API_KEY no está configurada.")


llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=GOOGLE_API_KEY, temperature=0)
embeddings_model = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=GOOGLE_API_KEY)

CHROMA_BASE_DB_DIR = "./db"

vector_stores_cache = {}

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=100,
    length_function=len,
    is_separator_regex=False,
)

prompt_template = PromptTemplate(
    template=""" Eres un asistente virtual llamado MindMentor. Eres útil y amable. No saludes. Respondes siempre en el contexto del pdf y Argentina, si hay algo que no sabes simplemente deci Solo se que no se nada. Usa emojis


Contexto:
{context}

Pregunta:
{input}

Respuesta:""",
    input_variables=["context", "input"]
)

def get_chroma_client_and_collection(collection_name: str):
    """
    Obtiene un cliente ChromaDB y la colección especificada.
    Crea el cliente y la colección si no existen.
    """
    collection_dir = os.path.join(CHROMA_BASE_DB_DIR, collection_name)
    os.makedirs(collection_dir, exist_ok=True) 

    client = chromadb.PersistentClient(path=collection_dir)
    
    try:
        collection = client.get_or_create_collection(
            name=collection_name,
            embedding_function=embeddings_model 
        )
    except Exception as e:
        print(f"Error al obtener/crear colección '{collection_name}': {e}. Intentando borrar y recrear.")
        try:
            client.delete_collection(name=collection_name)
            collection = client.get_or_create_collection(
                name=collection_name,
                embedding_function=embeddings_model
            )
        except Exception as retry_e:
            raise RuntimeError(f"Fallo al obtener/recrear colección '{collection_name}': {retry_e}") from retry_e

    return client, collection

def get_or_create_vector_store(collection_name: str) -> Chroma:
    """
    Obtiene o crea una instancia de LangChain Chroma para la colección especificada.
    Usa un caché en memoria para mejorar el rendimiento.
    """
    if collection_name in vector_stores_cache:
        return vector_stores_cache[collection_name]

    collection_dir = os.path.join(CHROMA_BASE_DB_DIR, collection_name)
    os.makedirs(collection_dir, exist_ok=True)

    vector_store = Chroma(
        persist_directory=collection_dir,
        embedding_function=embeddings_model,
        collection_name=collection_name
    )
    vector_stores_cache[collection_name] = vector_store
    return vector_store

@app.route("/embed", methods=["POST"])
def embed_pdf():
    """
    Sube un archivo PDF, extrae su texto, lo divide en chunks,
    genera embeddings y los guarda en una colección específica de ChromaDB.
    """
    if 'file' not in request.files:
        return jsonify({"error": "No se encontró el archivo 'file' en la solicitud."}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No se seleccionó ningún archivo."}), 400
    
    if not file.filename.endswith(".pdf"):
        return jsonify({"error": "Solo se permiten archivos PDF."}), 400

    collection_name = request.args.get("collection_name")
    final_collection_name = collection_name if collection_name else os.path.splitext(file.filename)[0]

    try:
        pdf_reader = PdfReader(file.stream)
        text_content = ""
        for page in pdf_reader.pages:
            text_content += page.extract_text() or ""

        if not text_content:
            return jsonify({"error": "No se pudo extraer texto del PDF o el PDF está vacío."}), 400

        documents = text_splitter.create_documents([text_content])
        if not documents:
            return jsonify({"error": "No se pudieron crear chunks del texto."}), 500

        vector_store = get_or_create_vector_store(final_collection_name)

        client, chroma_collection = get_chroma_client_and_collection(final_collection_name)
        if chroma_collection.count() > 0:
            chroma_collection.delete(ids=chroma_collection.get()['ids']) # Borra todos los documentos en la colección

        vector_store.add_documents(documents)
        
        return jsonify({
            "message": f"PDF '{file.filename}' procesado y embeddings guardados exitosamente en la colección '{final_collection_name}'."
        }), 200

    except Exception as e:
        print(f"Error detallado en /embed para '{final_collection_name}': {e}")
        return jsonify({"error": f"Error al procesar el PDF: {str(e)}"}), 500

@app.route("/ask", methods=["POST"])
def ask_question():
    """
    Haz una pregunta sobre el contenido de una colección específica.
    La pregunta se convierte en un embedding, se buscan chunks relevantes en ChromaDB,
    y se usan para generar una respuesta con Gemini.
    """
    data = request.get_json()
    question = data.get("question")
    collection_name = request.args.get("collection_name")

    if not question:
        return jsonify({"error": "La pregunta no puede estar vacía."}), 400
    if not collection_name:
        return jsonify({"error": "El nombre de la colección es requerido."}), 400

    try:
        collection_dir = os.path.join(CHROMA_BASE_DB_DIR, collection_name)
        if not os.path.exists(collection_dir) or not os.listdir(collection_dir):
            return jsonify({
                "error": f"La colección '{collection_name}' no existe o está vacía. Por favor, suba un PDF a esta colección primero."
            }), 404
        
        vector_store = get_or_create_vector_store(collection_name)
        
        document_chain = create_stuff_documents_chain(llm, prompt_template)
        retriever = vector_store.as_retriever(search_kwargs={"k": 5})
        retrieval_chain = create_retrieval_chain(retriever, document_chain)

        response = retrieval_chain.invoke({"input": question})

        return jsonify({
            "question": question,
            "answer": response["answer"],
            "collection": collection_name
        }), 200

    except Exception as e:
        print(f"Error detallado en /ask para '{collection_name}': {e}")
        return jsonify({"error": f"Error al procesar la pregunta: {str(e)}"}), 500

@app.route("/collections", methods=["GET"])
def list_collections():
    """
    Lista las subcarpetas dentro del directorio de persistencia de ChromaDB,
    que representan las colecciones disponibles.
    """
    if not os.path.exists(CHROMA_BASE_DB_DIR):
        return jsonify({"collections": []}), 200

    collections = [
        name for name in os.listdir(CHROMA_BASE_DB_DIR)
        if os.path.isdir(os.path.join(CHROMA_BASE_DB_DIR, name))
    ]
    return jsonify({"collections": collections}), 200

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8000)