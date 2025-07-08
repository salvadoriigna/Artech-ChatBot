$(function () {
    // Función para formatear la hora
    function getCurrentTime() {
        const d = new Date();
        const h = d.getHours().toString().padStart(2, "0");
        const t = d.getMinutes().toString().padStart(2, "0");
        return h > 12 ? `${h - 12}:${t} pm` : `${h}:${t} am`;
    }

    // Mensaje de bienvenida inicial
    const welcomeMessage = "¡Hola! ¿en qué te ayudo?";
    $("#ap").append(`
        <div class='message received'>${welcomeMessage}<span class='metadata'><span class='time'>${getCurrentTime()}</span></span></div>
    `);

    // Función para llamar al endpoint de IA
    async function sendMessageToAI(message) {
        try {
            const response = await fetch("http://localhost:8000/ask?collection_name=archivo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ question: message })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error desconocido del servidor");
            }

            return await response.json();
        } catch (error) {
            console.error("Error en sendMessageToAI:", error);
            return { answer: `⚠️ Error: ${error.message}` };
        }
    }

    // Modifica el manejador del click para usar la nueva respuesta
    $("#msend").click(async function (e) {
        e.preventDefault();
        const userMessage = $("#val").val().trim();
        if (!userMessage) return;

        // Mostrar mensaje del usuario
        const userTime = getCurrentTime();
        $("#ap").append(`
        <div class='message sent'>${userMessage}<span class='metadata'><span class='time'>${userTime}</span></span></div>
    `);
        $("#val").val("");
        $(".conversation-container").scrollTop($(".conversation-container")[0].scrollHeight);
        $(".status").html("escribiendo...");

        // Obtener respuesta
        const { answer } = await sendMessageToAI(userMessage);
        const aiTime = getCurrentTime();

        // Mostrar respuesta
        $("#ap").append(`
        <div class='message received'>${answer}<span class='metadata'><span class='time'>${aiTime}</span></span></div>
    `);
        $(".status").html("online");
        $(".conversation-container").scrollTop($(".conversation-container")[0].scrollHeight);
    });

    // Permitir enviar con la tecla "Enter"
    $("#val").keypress(function (e) {
        if (e.which === 13) {
            $("#msend").click();
            return false;
        }
    });
    if (window.location.pathname.includes('subirArchivos.html')) {
        let selectedFiles = [];

        // Elementos del DOM
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        const filesContainer = document.getElementById('files-container');

        // Eventos para arrastrar y soltar
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, unhighlight, false);
        });

        function highlight() {
            dropZone.classList.add('highlight');
        }

        function unhighlight() {
            dropZone.classList.remove('highlight');
        }

        // Manejar archivos soltados
        dropZone.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFiles(files);
        }

        // Manejar selección de archivos
        fileInput.addEventListener('change', function (e) {
            handleFiles(e.target.files);
        });

        // Procesar archivos
        function handleFiles(newFiles) {
            selectedFiles = [...selectedFiles, ...newFiles];
            updateFileList();
        }

        // Actualizar lista de archivos
        function updateFileList() {
            filesContainer.innerHTML = '';
            selectedFiles.forEach((file, index) => {
                const fileElement = document.createElement('div');
                fileElement.className = 'file-item';
                fileElement.innerHTML = `
                    <div class="file-info">
                        <div class="file-icon">${getFileIcon(file)}</div>
                        <div>
                            <div class="file-name">${file.name}</div>
                            <div class="file-size">${formatFileSize(file.size)}</div>
                        </div>
                    </div>
                    <button onclick="removeFile(${index})">×</button>
                `;
                filesContainer.appendChild(fileElement);
            });
        }

        // Función para eliminar archivos
        window.removeFile = function (index) {
            selectedFiles.splice(index, 1);
            updateFileList();
        };

        // Formatear tamaño de archivo
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        // Obtener icono según tipo de archivo
        function getFileIcon(file) {
            const extension = file.name.split('.').pop().toLowerCase();
            const extensionIcons = {
                pdf: '📕', doc: '📘', docx: '📘', xls: '📊', xlsx: '📊',
                ppt: '📑', pptx: '📑', zip: '🗜️', rar: '🗜️',
                jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️',
                mp3: '🎵', wav: '🎵', mp4: '🎬', avi: '🎬',
                txt: '📝', csv: '📊', js: '📜', html: '🌐', css: '🎨'
            };
            return extensionIcons[extension] || '📁';
        }

        // Función para subir archivos CORREGIDA
        window.uploadFiles = async function () {
            if (selectedFiles.length === 0) {
                alert('Por favor, selecciona al menos un archivo');
                return;
            }

            try {
                // Leer el contenido de cada archivo como texto
                const fileContents = await Promise.all(
                    selectedFiles.map(file => readFileAsText(file))
                );

                // Crear el mensaje combinando los nombres y contenidos de los archivos
                const message = selectedFiles.map((file, index) => {
                    return `Archivo: ${file.name}\nContenido:\n${fileContents[index]}`;
                }).join('\n\n');

                // Enviar el contenido como texto a Gemini
                const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDgqC5W--Mx4CUpieHj5r2hb3vwGn9V9us', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: message
                            }]
                        }]
                    })
                });

                if (!response.ok) {
                    throw new Error(`Error al procesar archivos: ${response.status}`);
                }

                const result = await response.json();
                const aiResponse = result.candidates[0].content.parts[0].text;

                alert('Archivos procesados con éxito!\nRespuesta de la IA:\n' + aiResponse);
                selectedFiles = [];
                updateFileList();
            } catch (error) {
                console.error('Error al procesar archivos:', error);
                alert('Error al procesar archivos: ' + error.message);
            }
        };

        // Función auxiliar para leer archivos como texto
        function readFileAsText(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = event => resolve(event.target.result);
                reader.onerror = error => reject(error);
                reader.readAsText(file);
            });
        }
    }
});