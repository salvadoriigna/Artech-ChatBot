
let idLoggeado = -1;

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
                            text: message  // 👈 Estructura que espera Gemini
                        }]
                    }]
                }),
            });
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;  // Extrae la respuesta de Gemini
        } catch (error) {
            console.error("Error:", error);
            return "⚠️ Error al conectar con la IA.";
        }
    }

    // Manejar solo el clic del botón (#msend) - Elimina el evento submit del formulario
    $("#msend").click(async function (e) {
        e.preventDefault(); // Evita cualquier comportamiento por defecto
        const userMessage = $("#val").val().trim();
        if (!userMessage) return;

        // Mostrar mensaje del usuario
        const userTime = getCurrentTime();
        $("#ap").append(`
            <div class='message sent'>${userMessage}<span class='metadata'><span class='time'>${userTime}</span></span></div>
        `);
        $("#val").val(""); // Limpiar el input

        // Scroll al final
        $(".conversation-container").scrollTop($(".conversation-container")[0].scrollHeight);


        // Obtener respuesta de la IA
        const aiResponse = await sendMessageToAI(userMessage);
        const aiTime = getCurrentTime();

        // Mostrar respuesta de la IA
        $("#ap").append(`
            <div class='message received'>${aiResponse}<span class='metadata'><span class='time'>${aiTime}</span></span></div>
        `);

        // Scroll al final nuevamente
        $(".conversation-container").scrollTop($(".conversation-container")[0].scrollHeight);
    });

    // Opcional: Permitir enviar con la tecla "Enter"
    $("#val").keypress(function (e) {
        if (e.which === 13) { // 13 = tecla Enter
            $("#msend").click(); // Simula clic en el botón
            return false; // Evita el salto de línea
        }
    });
});


const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const filesContainer = document.getElementById('files-container');
let files = [];

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
function removeFile(index) {
    files.splice(index, 1);
    updateFileList();
}

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

// Función para simular la subida de archivos (puedes reemplazar con tu lógica real)
function uploadFiles() {
    files.forEach((file, index) => {
        // Simular progreso de subida
        let progress = 0;
        const progressBar = document.getElementById(`progress-${index}`);

        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }
            progressBar.style.width = `${progress}%`;
        }, 200);
    });
}

// Inicializar lista vacía
updateFileList();


// 6)
function checkLogged(email, password) {

    for (let i = 0; i < users.length; i++) {
        if ((users[i].email == email) && (users[i].password == password)) {
            return users[i].id;
        } else if ((users[i].email == email) && (users[i].password != password)) {
            return 0;
        }
    }

    return -1;

}

//7)
function ingresar() {

    idLoggeado = checkLogged(ui.getEmail(), ui.getPassword());
    if (idLoggeado >= 1) {
        ui.showModal("Éxito", "Has ingresado correctamente");
        ui.changeScreen()
        mostrar(idLoggeado)
    }
    else {
        ui.showModal("usuario y/o contraseña incorrecta. Tambien puede ser que la cuenta no exista, en ese caso, registrate")
    }

}

//8)
function registrar(usuario, email, contraseña) {
    for (let i = 0; i < users.length; i++) {
        if (users[i].email == email) {
            return -1;
        }
    }

    users.push(new User(usuario, email, contraseña))
    return users.length

}

//9)
function registrarse() {
    if (registrar(ui.getUser(), ui.getEmail(), ui.getPassword()) > 0) {
        ingresar();
    } else {
        ui.showModal("ha ocurrido un error :< ;<")
    }
}

// 10)
function mostrar(id) {
    ui.clearSelect();
    for (let i = 0; i < notes.length; i++) {
        for (let j = 0; j < notes[i].usuarios_ver_editar.length; j++) {
            if (notes[i].usuarios_ver_editar[j] == id) {
                ui.createNote(notes[i].id, notes[i].titulo, notes[i].contenido, notes[i].categoria);
                ui.addNoteToSelect(notes[i].id, notes[i].titulo);
            }
        }
    }
}


// 12)
function cerrarSesion() {
    const confirmacion = confirm("¿Realmente deseas cerrar sesión?");

    if (confirmacion) {
        console.log("Cerrando sesión...");
        idLoggeado = 0;
        ui.clearLoginInputs();
        ui.changeScreen();

    } else {
        console.log("Cancelado por el usuario.");
    }
}

// 13)

function crearNota(titulo, contenido, categoria, id) {
    if (titulo != "" && contenido != "" && categoria != "") {
        notes.push(new Note(titulo, contenido, categoria, id));
        return notes.length
    } else {
        return -1
    }
}

// 14)
function agregarNota() {

    const titulo = ui.getNoteTitle();
    const contenido = ui.getNoteContent();
    const categoria = ui.getNoteCategory();
    const notaId = crearNota(titulo, contenido, categoria, idLoggeado);

    if (notaId == -1) {
        ui.showModal("Por favor completa todos los campos.");
        return -1;
    } else {
        ui.createNote(notaId, titulo, contenido, categoria)
        ui.addNoteToSelect(notaId, titulo);
        ui.showModal("nota creada");
    }

    ui.clearNoteInputs();

}

// 15
function ver_nota() {
    nota = ui.getSelectedNote();
    console.log(nota);
}


function editNote(idNote) {
    const confirmacion = confirm("¿Quieres editar esta nota?");

    if (confirmacion) {

        const nuevoTitulo = ui.getNoteTitle();
        const nuevoContenido = ui.getNoteContent();
        const nuevaCategoria = ui.getNoteCategory();

        if (nuevoTitulo === "" || nuevoContenido === "" || nuevaCategoria === "") {
            ui.showModal("Error", "Por favor, completá todos los campos para editar la nota.");
            return;
        }

        let notaEncontrada = null;
        for (let i = 0; i < notes.length; i++) {
            if (notes[i].id === idNote) {
                notaEncontrada = notes[i];
                break;
            }
        }

        if (!notaEncontrada) {
            ui.showModal("Error", "No se encontró la nota a modificar.");
            return;
        }

        const resultado = notaEncontrada.modificarNota(idLoggeado, nuevoTitulo, nuevoContenido, nuevaCategoria);

        if (resultado !== -1) {
            ui.editNote(idNote, nuevoTitulo, nuevoContenido, nuevaCategoria);
            ui.clearNoteInputs();
            ui.showModal("Éxito", "La nota fue modificada correctamente.");
        } else {
            ui.showModal("Error", "No tenés permisos para editar esta nota.");
        }

    } else {
        console.log("Edición cancelada por el usuario.");
    }
}

function eliminarNota(id) {
    for (let i = 0; i < notes.length; i++) {
        if (notes[i].id === id) {
            notes.splice(i, 1);
            return true;
        }
    }
    return false;
}

function eraseNote(id) {
    const confirmacion = confirm("¿Estás seguro de que querés eliminar esta nota?");

    if (confirmacion) {
        const eliminado = eliminarNota(id);
        if (eliminado) {
            ui.removeNote(id);
            ui.showModal("Nota eliminada", "La nota fue eliminada correctamente.");
        } else {
            ui.showModal("Error", "No se encontró la nota a eliminar.");
        }
    } else {
        console.log("Eliminación cancelada por el usuario.");
    }
}

function buscarPorContenido() {
    const texto = ui.getSearchContent().toLowerCase();

    if (texto.length < 4) {
        console.log("Ingresá al menos 4 caracteres para buscar.");
        return;
    }

    for (let i = 0; i < notes.length; i++) {
        const titulo = notes[i].titulo.toLowerCase();
        const contenido = notes[i].contenido.toLowerCase();

        if (titulo.includes(texto) || contenido.includes(texto)) {
            console.log("Resultado encontrado:");
            console.log(notes[i]);
            return;
        }
    }

    console.log("No hay coincidencias.");
}

function verHistorialNota() {
    const idNota = ui.getSelectedNote();
    const nota = notes.find(n => n.id === idNota);

    if (!nota) {
        ui.showModal("Error", "No se encontró la nota seleccionada.");
        return;
    }

    document.getElementById("title").value = nota.titulo;
    document.getElementById("content").value = nota.contenido;
    document.getElementById("category").value = nota.categoria;

    if (nota.modificaciones.length === 0) {
        ui.showModal("Historial vacío", "Esta nota no tiene modificaciones.");
        return;
    }
    
    let textoHistorial = "";
    

    for (let i = 1; i < nota.modificaciones.length; i++) {
        const mod = nota.modificaciones[i];
        const fecha = new Date(mod.date);

        textoHistorial += `🕒 ${fecha.toLocaleString()} — por Usuario ID ${mod.idUsuario}\n`;
        textoHistorial += `• Título: ${mod.titulo}\n`;
        textoHistorial += `• Contenido: ${mod.contenido}\n`;
        textoHistorial += `• Categoría: ${mod.categoria}\n\n`;
    }

    let fecha2 = new Date;

    textoHistorial += `🕒 ${fecha2.toLocaleString()} — por Usuario ID ${nota.userId}\n`;
    textoHistorial += `• Título: ${nota.titulo}\n`;
    textoHistorial += `• Contenido: ${nota.contenido}\n`;
    textoHistorial += `• Categoría: ${nota.categoria}\n\n`;

    ui.showModal("Historial de la nota", textoHistorial);
}
