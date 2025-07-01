from flask import Flask, request, jsonify
import requests
import os
import re
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader
import glob

app = Flask(__name__)

# Configuración
API_KEY = "AIzaSyDgqC5W--Mx4CUpieHj5r2hb3vwGn9V9us"
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={API_KEY}"
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
MAX_FILES_TO_KEEP = 5  # Mantener solo los últimos 5 archivos

def clean_old_files():
    """Elimina archivos viejos, manteniendo solo los últimos MAX_FILES_TO_KEEP"""
    try:
        # Obtener todos los archivos ordenados por fecha de creación (más reciente primero)
        list_of_files = sorted(glob.glob(os.path.join(UPLOAD_FOLDER, '*.pdf')), 
                             key=os.path.getctime, 
                             reverse=True)
        
        # Eliminar archivos excedentes
        for old_file in list_of_files[MAX_FILES_TO_KEEP:]:
            try:
                os.remove(old_file)
                print(f"Archivo eliminado: {old_file}")
            except Exception as e:
                print(f"Error eliminando {old_file}: {str(e)}")
    except Exception as e:
        print(f"Error limpiando archivos viejos: {str(e)}")

def get_all_pdf_files():
    """Obtiene todos los archivos PDF en la carpeta uploads ordenados por fecha (más reciente primero)"""
    pdf_files = sorted(glob.glob(os.path.join(UPLOAD_FOLDER, '*.pdf')), 
                      key=os.path.getctime, 
                      reverse=True)
    return pdf_files if pdf_files else []

# ... (resto de funciones igual que antes) ...

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No se encontró el archivo"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Nombre de archivo vacío"}), 400
    
    if file and file.filename.lower().endswith('.pdf'):
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        
        # Limpiar archivos viejos después de subir uno nuevo
        clean_old_files()
        
        # Reprocesar todos los PDFs
        global pdf_text, chunked_text
        pdf_text, chunked_text = initialize_pdf_processing()
        
        return jsonify({"message": f"Archivo {filename} subido correctamente"}), 200
    else:
        return jsonify({"error": "Solo se permiten archivos PDF"}), 400

def download_file(url, save_path=None):
    """Descarga un archivo desde una URL con reintentos"""
    try:
        filename = secure_filename(os.path.basename(url)) or "downloaded_file.pdf"
        save_path = save_path or os.path.join(UPLOAD_FOLDER, filename)
        
        # Limpiar archivos viejos antes de descargar uno nuevo
        clean_old_files()
        
        for attempt in range(3):  # 3 intentos
            try:
                response = requests.get(url, timeout=10)
                response.raise_for_status()
                with open(save_path, 'wb') as f:
                    f.write(response.content)
                return save_path
            except requests.exceptions.RequestException as e:
                if attempt == 2:  # Último intento
                    raise
                print(f"Intento {attempt + 1} fallido, reintentando...")
    except Exception as e:
        print(f"Error al descargar {url}: {str(e)}")
        raise

def load_pdf(file_path):
    """Extrae texto de un PDF con mejor manejo de formato"""
    try:
        with open(file_path, 'rb') as f:
            reader = PdfReader(f)
            text = []
            for i, page in enumerate(reader.pages):
                try:
                    page_text = page.extract_text()
                    if page_text:
                        # Limpieza avanzada de texto
                        page_text = re.sub(r'\s+', ' ', page_text).strip()
                        text.append(f"DOCUMENTO: {os.path.basename(file_path)} - PÁGINA {i+1}: {page_text}")
                except Exception as page_error:
                    print(f"Error en página {i+1}: {page_error}")
            return '\n\n'.join(text) if text else ""
    except Exception as e:
        print(f"Error al procesar PDF {file_path}: {str(e)}")
        raise

def split_text(text, max_words=200):
    """Divide el texto en chunks inteligentes con contexto preservado"""
    if not text:
        return []
    
    # Primero dividir por documentos y páginas
    chunks = re.split(r'(?<=\n\n)DOCUMENTO: .*? - PÁGINA \d+: ', text)
    chunks = [chunk for chunk in chunks if chunk.strip()]
    
    # Procesamiento de chunks
    processed_chunks = []
    for chunk in chunks:
        sentences = re.split(r'(?<=[.!?])\s+', chunk)  # Dividir por oraciones
        current_chunk = []
        word_count = 0
        
        for sentence in sentences:
            words = sentence.split()
            if word_count + len(words) > max_words and current_chunk:
                processed_chunks.append(' '.join(current_chunk))
                current_chunk = []
                word_count = 0
            current_chunk.append(sentence)
            word_count += len(words)
        
        if current_chunk:
            processed_chunks.append(' '.join(current_chunk))
    
    return processed_chunks

def initialize_pdf_processing():
    """Inicializa el procesamiento de todos los PDFs al iniciar la app"""
    try:
        pdf_files = get_all_pdf_files()
        if not pdf_files:
            print("No se encontraron archivos PDF en la carpeta uploads")
            return "", []
        
        all_text = []
        for pdf_file in pdf_files:
            print(f"Procesando archivo: {pdf_file}")
            pdf_text = load_pdf(pdf_file)
            if pdf_text:
                all_text.append(pdf_text)
        
        combined_text = '\n\n'.join(all_text)
        chunks = split_text(combined_text)
        return combined_text, chunks
    except Exception as e:
        print(f"Error inicializando PDFs: {str(e)}")
        return "", []

# Inicialización
pdf_text, chunked_text = initialize_pdf_processing()

@app.route('/generate-text', methods=['POST'])
def generate_text():
    try:
        data = request.get_json()
        prompt = data.get("prompt")
        
        if not prompt:
            return jsonify({"error": "Se requiere el campo 'prompt'"}), 400

        # Usar chunks existentes o cargarlos si no están
        chunks = chunked_text if chunked_text else []
        if not chunks:
            try:
                pdf_files = get_all_pdf_files()
                if pdf_files:
                    all_text = []
                    for pdf_file in pdf_files:
                        current_pdf_text = load_pdf(pdf_file)
                        if current_pdf_text:
                            all_text.append(current_pdf_text)
                    
                    combined_text = '\n\n'.join(all_text)
                    chunks = split_text(combined_text)
            except Exception as e:
                print(f"Error procesando PDFs: {str(e)}")

        # Agregar contexto si hay chunks disponibles
        if chunks:
            safe_chunks = chunks if len(chunks) >= 3 else chunks
            prompt += "\n\nContexto del documento:\n" + "\n".join(safe_chunks)

        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }

        response = requests.post(GEMINI_API_URL, json=payload, timeout=30)
        response.raise_for_status()
        response_data = response.json()
        
        if "candidates" in response_data and response_data["candidates"]:
            generated_text = response_data["candidates"][0]["content"]["parts"][0]["text"]
            return jsonify({"response": generated_text}), 200
        else:
            return jsonify({"error": "Respuesta inesperada de la API"}), 500

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Error de conexión: {str(e)}"}), 503
    except Exception as e:
        return jsonify({"error": f"Error interno: {str(e)}"}), 500

if __name__ == '__main__':
    # Testeo 
    print("\n=== INICIALIZACIÓN ===")
    print(f"PDFs cargados: {'Sí' if pdf_text else 'No'}")
    print(f"Total chunks generados: {len(chunked_text)}")
    
    if chunked_text:
        print("\nEjemplo de chunks:")
        for i, chunk in enumerate(chunked_text):  
            print(f"\nChunk {i+1} ({len(chunk.split())} palabras):")
            print(chunk)
    
    clean_old_files()  # Limpiar archivos viejos al iniciar
    pdf_text, chunked_text = initialize_pdf_processing()

    if __name__ == '__main__':
        app.run(host='0.0.0.0', port=5000, debug=True)