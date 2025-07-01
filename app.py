from flask import Flask, request, jsonify
import requests
import os
import re
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader

app = Flask(__name__)

# Configuración
API_KEY = "AIzaSyDgqC5W--Mx4CUpieHj5r2hb3vwGn9V9us"
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={API_KEY}"
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def download_file(url, save_path=None):
    """Descarga un archivo desde una URL con reintentos"""
    try:
        filename = secure_filename(os.path.basename(url)) or "downloaded_file"
        save_path = save_path or os.path.join(UPLOAD_FOLDER, filename)
        
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
                        text.append(f"PÁGINA {i+1}: {page_text}")
                except Exception as page_error:
                    print(f"Error en página {i+1}: {page_error}")
            return '\n\n'.join(text) if text else ""
    except Exception as e:
        print(f"Error al procesar PDF: {str(e)}")
        raise

def split_text(text, max_words=200):
    """Divide el texto en chunks inteligentes con contexto preservado"""
    if not text:
        return []
    
    # Primero dividir por paginas
    chunks = re.split(r'(?<=\n\n)PÁGINA \d+: ', text)
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
    """Inicializa el procesamiento del PDF al iniciar la app"""
    pdf_url = "https://services.google.com/fh/files/misc/ai_adoption_framework_whitepaper.pdf"
    pdf_path = os.path.join(UPLOAD_FOLDER, "ai_adoption_framework_whitepaper.pdf")
    
    try:
        if not os.path.exists(pdf_path):
            print("Descargando PDF...")
            download_file(pdf_url, pdf_path)
        
        if os.path.exists(pdf_path):
            pdf_text = load_pdf(pdf_path)
            chunks = split_text(pdf_text)
            return pdf_text, chunks
    except Exception as e:
        print(f"Error inicializando PDF: {str(e)}")
    
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
                pdf_path = os.path.join(UPLOAD_FOLDER, "ai_adoption_framework_whitepaper.pdf")
                if os.path.exists(pdf_path):
                    current_pdf_text = load_pdf(pdf_path)
                    chunks = split_text(current_pdf_text)
            except Exception as e:
                print(f"Error procesando PDF: {str(e)}")

        # Agregar contexto si hay chunks disponibles
        if chunks:
            safe_chunks = chunks[:3] if len(chunks) >= 3 else chunks
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
    print(f"PDF cargado: {'Sí' if pdf_text else 'No'}")
    print(f"Total chunks generados: {len(chunked_text)}")
    
    if chunked_text:
        print("\nEjemplo de chunks:")
        for i, chunk in enumerate(chunked_text[:len(chunked_text)]):  # Mostrar primeros 3 chunks
            print(f"\nChunk {i+1} ({len(chunk.split())} palabras):")
            print(chunk)
    
    app.run(host='0.0.0.0', port=5000, debug=True)