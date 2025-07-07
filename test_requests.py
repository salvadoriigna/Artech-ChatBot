import requests
import os
import json
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "http://localhost:8000"

def upload_pdf():
    pdf_path = "archivo.pdf"
    print(f"Usando el archivo PDF predeterminado: '{pdf_path}'")
    
    if not os.path.exists(pdf_path):
        print(f"Error: El archivo '{pdf_path}' no se encontró en la carpeta del proyecto.")
        return

    collection_name_input = "archivo"
    print(f"Usando el nombre de colección predeterminado: '{collection_name_input}'")
    
    files = {"file": (os.path.basename(pdf_path), open(pdf_path, "rb"), "application/pdf")}
    params = {}
    if collection_name_input:
        params["collection_name"] = collection_name_input

    response = None
    try:
        print(f"\nSubiendo '{os.path.basename(pdf_path)}' a la colección '{params.get('collection_name', os.path.splitext(os.path.basename(pdf_path))[0])}'...")
        response = requests.post(f"{BASE_URL}/embed", files=files, params=params)
        response.raise_for_status() 
        
        print("Respuesta del servidor:")
        print(json.dumps(response.json(), indent=2))
        print("PDF subido y procesado exitosamente.")

    except requests.exceptions.ConnectionError:
        print("\nError: No se pudo conectar con el servidor. Asegúrese de que su API de Flask esté corriendo en http://localhost:8000.")
    except requests.exceptions.RequestException as e:
        print(f"\nError al subir el PDF: {e}")
        if response is not None:
            print(f"Código de estado HTTP: {response.status_code}")
            try:
                print(f"Detalles del error del servidor: {response.json()}")
            except json.JSONDecodeError:
                print(f"Respuesta del servidor (no JSON): {response.text}")
    finally:
        if 'file' in files and hasattr(files['file'][1], 'close'):
            files['file'][1].close()


def ask_question():
    collection_name = "archivo"
    print(f"\nListo para hacer preguntas a la colección '{collection_name}'. Escribe 'salir' para terminar.")
    while True:
        question = input("Ingrese su pregunta (o 'salir' para terminar): ")
        if question.lower() == 'salir':
            print("Saliendo del modo de preguntas.")
            break

        response = None
        try:
            print(f"\nHaciendo pregunta a la colección '{collection_name}'...")
            response = requests.post(
                f"{BASE_URL}/ask",
                json={"question": question},
                params={"collection_name": collection_name}
            )
            response.raise_for_status()
            
            print("\nRespuesta de Gemini:")
            response_data = response.json()
            if "answer" in response_data:
                print(response_data["answer"])
            else:
                print("Respuesta inesperada del servidor:", response_data)

        except requests.exceptions.ConnectionError:
            print("\nError: No se pudo conectar con el servidor. Asegúrese de que su API de Flask esté corriendo en http://localhost:8000.")
        except requests.exceptions.RequestException as e:
            print(f"\nError al hacer la pregunta: {e}")
            if response is not None:
                print(f"Código de estado HTTP: {response.status_code}")
                try:
                    print(f"Detalles del error del servidor: {response.json()}")
                except json.JSONDecodeError:
                    print(f"Respuesta del servidor (no JSON): {response.text}")


def list_collections():
    response = None
    try:
        print("\nListando colecciones disponibles...")
        response = requests.get(f"{BASE_URL}/collections")
        response.raise_for_status() 
        
        data = response.json()
        if data and "collections" in data and data["collections"]:
            print("Colecciones disponibles:")
            for col in data["collections"]:
                print(f"- {col}")
        else:
            print("No se encontraron colecciones. Suba un PDF primero.")

    except requests.exceptions.ConnectionError:
        print("\nError: No se pudo conectar con el servidor. Asegúrese de que su API de Flask esté corriendo en http://localhost:8000.")
    except requests.exceptions.RequestException as e:
        print(f"\nError al listar colecciones: {e}")
        if response is not None:
            print(f"Código de estado HTTP: {response.status_code}")
            try:
                print(f"Detalles del error del servidor: {response.json()}")
            except json.JSONDecodeError:
                print(f"Respuesta del servidor (no JSON): {response.text}")


def main_cli():
    print("--- Bienvenido al Interfaz CLI de su RAG con Gemini ---")
    while True:
        print("\nOpciones:")
        print("1. Subir PDF (archivo.pdf)")
        print("2. Hacer pregunta (a la colección 'archivo')")
        print("3. Listar colecciones")
        print("4. Salir")
        
        choice = input("Seleccione una opción: ")
        
        if choice == "1":
            upload_pdf()
        elif choice == "2":
            ask_question()
        elif choice == "3":
            list_collections()
        elif choice == "4":
            print("Saliendo del programa. ¡Hasta pronto!")
            break
        else:
            print("Opción no válida. Por favor, intente de nuevo.")

if __name__ == "__main__":
    main_cli()