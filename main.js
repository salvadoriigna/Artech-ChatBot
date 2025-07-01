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
            const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDgqC5W--Mx4CUpieHj5r2hb3vwGn9V9us", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: message
                        }]
                    }]
                }),
            });
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error("Error:", error);
            return "⚠️ Error al conectar con la IA.";
        }
    }

    // Manejar solo el clic del botón (#msend)
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

        // Scroll al final
        $(".conversation-container").scrollTop($(".conversation-container")[0].scrollHeight);

        // Mostrar "escribiendo..."
        $(".status").html("escribiendo...");

        // Obtener respuesta de la IA
        const aiResponse = await sendMessageToAI(userMessage);
        const aiTime = getCurrentTime();

        // Mostrar respuesta de la IA
        $("#ap").append(`
            <div class='message received'>${aiResponse}<span class='metadata'><span class='time'>${aiTime}</span></span></div>
        `);
        $(".status").html("online");

        // Scroll al final nuevamente
        $(".conversation-container").scrollTop($(".conversation-container")[0].scrollHeight);
    });

    // Permitir enviar con la tecla "Enter"
    $("#val").keypress(function (e) {
        if (e.which === 13) {
            $("#msend").click();
            return false;
        }
    });

    // File upload functionality
    const dropZone = $('#drop-zone')[0];
    const fileInput = $('#file-input')[0];
    const filesContainer = $('#files-container')[0];
    let files = [];

    if (dropZone && fileInput && filesContainer) {
        // Manejar eventos de arrastrar y soltar
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
            handleFiles(dt.files);
        }

        // Manejar archivos seleccionados
        fileInput.addEventListener('change', function () {
            handleFiles(this.files);
        });

        // Procesar archivos
        function handleFiles(newFiles) {
            files = [...files, ...newFiles];
            updateFileList();
        }

        // Actualizar la lista de archivos
        function updateFileList() {
            filesContainer.innerHTML = '';

            if (files.length === 0) {
                filesContainer.innerHTML = '<p>No hay archivos seleccionados</p>';
                return;
            }

            files.forEach((file, index) => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';

                // Obtener icono según el tipo de archivo
                const fileIcon = getFileIcon(file);

                fileItem.innerHTML = `
                    <div class="file-info">
                        <div class="file-icon">${fileIcon}</div>
                        <div>
                            <div class="file-name">${file.name}</div>
                            <div class="file-size">${formatBytes(file.size)}</div>
                            <div class="upload-progress">
                                <div class="progress-bar" id="progress-${index}"></div>
                            </div>
                        </div>
                    </div>
                    <button onclick="removeFile(${index})">×</button>
                `;

                filesContainer.appendChild(fileItem);
            });
        }

        // Función para eliminar un archivo de la lista
        window.removeFile = function(index) {
            files.splice(index, 1);
            updateFileList();
        };

        // Función para formatear el tamaño del archivo
        function formatBytes(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        // Función para obtener icono según el tipo de archivo
        function getFileIcon(file) {
            const type = file.type.split('/')[0];
            const extension = file.name.split('.').pop().toLowerCase();

            const icons = {
                image: '🖼️',
                audio: '🎵',
                video: '🎬',
                text: '📄',
                application: '📁'
            };

            // Iconos específicos para extensiones conocidas
            const extensionIcons = {
                pdf: '📕',
                doc: '📘',
                docx: '📘',
                xls: '📊',
                xlsx: '📊',
                ppt: '📑',
                pptx: '📑',
                zip: '🗜️',
                rar: '🗜️',
                exe: '⚙️',
                mp3: '🎵',
                wav: '🎵',
                mp4: '🎬',
                avi: '🎬',
                mov: '🎬',
                jpg: '🖼️',
                jpeg: '🖼️',
                png: '🖼️',
                gif: '🖼️',
                txt: '📝',
                csv: '📊',
                js: '📜',
                html: '🌐',
                css: '🎨'
            };

            return extensionIcons[extension] || icons[type] || '📁';
        }

        // Función para subir archivos
        window.uploadFiles = async function() {
            if (files.length === 0) {
                alert("No hay archivos seleccionados");
                return;
            }

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append('file', file);

                try {
                    const response = await fetch('"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDgqC5W--Mx4CUpieHj5r2hb3vwGn9V9us', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const result = await response.json();
                    console.log('Upload successful:', result);
                    
                    // Update progress bar
                    const progressBar = document.getElementById(`progress-${i}`);
                    if (progressBar) {
                        progressBar.style.width = '100%';
                        progressBar.style.backgroundColor = '#4CAF50';
                    }
                } catch (error) {
                    console.error('Upload failed:', error);
                    const progressBar = document.getElementById(`progress-${i}`);
                    if (progressBar) {
                        progressBar.style.backgroundColor = '#f44336';
                    }
                }
            }
        };
    }
});