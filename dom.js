//Código de DOM implementado por los docentes.

class UserInterface {
    constructor() {

    }

    /**
     * Obtiene el texto ingresado en el input "Correo electrónico", sección "Login".
     * @returns String que contiene el correo electrónico ingresado por el usuario.
     */
    getEmail() {
        return document.getElementById("email").value;
    }

    /**
     * Obtiene el texto ingresado en el input "Usuario", sección "Login".
     * @returns String que contiene el nombre de usuario.
     */
    getUser() {
        return document.getElementById("username").value;
    }

    /**
     * Modifica el nombre de usuario logueado presentado en pantalla.
     * @param {String} username Nombre del usuario logueado.
     */
    setUser(username) {
        document.getElementById("loggedUsername").textContent = `¡Bienvenido ${username}!`;
    }

    /**
     * Obtiene el texto ingresado en el input "Contraseña", sección "Login".
     * @returns String que contiene la contraseña ingresada por el usuario.
     */
    getPassword() {
        return document.getElementById("password").value;
    }

    /**
     * Vacía el contenido de los inputs del login / registro.
     */
    clearLoginInputs() {
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";
        document.getElementById("username").value = "";
    }

    clearNoteInputs() {
        document.getElementById("title").value = "";
        document.getElementById("content").value = "";
        document.getElementById("category").value = "";
    }


    /**
     * Si se está mostrando la pantalla de login la oculta y muestra la de notas. Y viceversa.
     */
    changeScreen() {
        const notepad = document.getElementById("notepad");
        const loginForm = document.getElementById("loginForm");
        if (notepad.style.display !== "none") {
            notepad.style.display = "none";
            loginForm.style.display = "";
            this.clearAllNotes();
            this.clearSelect();
        }
        else {
            notepad.style.display = "";
            loginForm.style.display = "none";
        }
    }

    /**
     * Obtiene el texto ingresado en el input "Título de la nota", sección "Ingreso de nueva nota".
     * @returns String que contiene el título de la nota.
     */
    getNoteTitle() {
        return document.getElementById("title").value;
    }

    /**
     * Obtiene el texto ingresado en el input "Contenido", sección "Ingreso de nueva nota".
     * @returns String que contiene el contenido de la nota.
     */
    getNoteContent() {
        return document.getElementById("content").value;
    }

    /**
     * Obtiene el texto ingresado en el input "Categoría", sección "Ingreso de nueva nota".
     * @returns String que contiene la categoría de la nota.
     */
    getNoteCategory() {
        return document.getElementById("category").value;
    }

    /**
     * Obtiene el ID de la nota seleccionada en el select, sección "Búsquedas".
     * @returns Número entero con el ID de la nota que se solicita.
     */
    getSelectedNote() {
        return parseInt(document.getElementById("selectNote").value);
    }

    getSelectedUser() {
        return parseInt(document.getElementById("selectUser").value);
    }

    /**
     * Agrega una opción al select de notas, sección "Búsquedas".
     * @param {Number} id ID de la nueva nota.
     * @param {String} title Título de la nueva nota.
     */
    addNoteToSelect(id, title) {
        document.getElementById("selectNote").innerHTML += `
            <option value="${id}" id="optionNote${id}">ID ${id} - ${title}</option>
        `;
    }

    addUserToSelect(userId, email) {
        for (let i = 0; i < nota.usuarios_ver_editar.length; i++) {
            document.getElementById("selectUser").innerHTML += `
                <option value="${userId[i]}" id="optionUsers${userId[i]}">ID ${userId[i]} - ${email.userId[i]}</option>
            `;
        }
    }

    /**
     * Vacía el select de notas, sección "Búsquedas".
     */
    clearSelect() {
        document.getElementById("selectNote").innerHTML = "";
    }

    /**
     * Obtiene el texto ingresado en el input "Buscar por contenido", sección "Búsquedas y modificaciones".
     * @returns String que contiene el pedazo de texto que se busca esté contenido en la nota.
     */
    getSearchContent() {
        return document.getElementById("searchByContent").value;
    }

    /**
     * Dibuja una nueva nota en la parte inferior de la pantalla con DOM a partir de los datos ingresados.
     * @param {Number} id ID de la nueva nota.
     * @param {String} title Título de la nueva nota.
     * @param {String} content Contenido de la nueva nota.
     * @param {String} category Categoría de la nueva nota.
     */
    createNote(id, title, content, category) {
        document.getElementById("allNotes").innerHTML += `
            <div id="note${id}" class="card shadow-sm m-3">
                <div class="card-header">
                    <h5 class="card-title" id="noteTitle${id}">${title}</h5>
                    <h6 class="card-subtitle mb-0 text-muted">ID: ${id}</h6>
                </div>
                <div class="card-body">
                    <p class="card-text" id="noteContent${id}">${content}</p>
                    <div class="row">
                        <div class="col d-flex align-items-center">
                            <h5 class="mb-0"><span class="badge bg-secondary" id="noteCategory${id}">${category}</span></h5>
                        </div>
                        <div class="col d-flex justify-content-end">
                            <button onclick="editNote(${id})" class="btn btn-outline-primary btn-sm me-2"
                                type="button" data-bs-toggle="tooltip" data-bs-placement="top"
                                title="Editar Nota">Editar Nota
                            </button>
                            <button onclick="eraseNote(${id})" class="btn btn-outline-danger btn-sm" type="button"
                                data-bs-toggle="tooltip" data-bs-placement="top" title="Eliminar Nota">Eliminar Nota
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            `;
    }

    /**
     * Elimina mediante DOM la nota que corresponda al ID ingresado.
     * @param {Number} id ID de la nota a eliminar.
     */
    removeNote(id) {
        document.getElementById(`note${id}`).remove();
        document.getElementById(`optionNote${id}`).remove();
    }

    /**
     * Elimina todas las notas que se están mostrando en pantalla.
     */
    clearAllNotes() {
        document.getElementById("allNotes").innerHTML = "";
    }

    /**
     * Modifica los datos de una nota ya dibujada mediante DOM a partir de los datos ingresados.
     * @param {Number} id ID de la nota a modificar.
     * @param {String} title Nuevo título de la nota.
     * @param {String} content Nuevo contenido de la nota.
     * @param {String} category Nueva categoría de la nota.
     */
    editNote(id, title, content, category) {
        document.getElementById(`noteTitle${id}`).textContent = title;
        document.getElementById(`noteContent${id}`).textContent = content;
        document.getElementById(`noteCategory${id}`).textContent = category;
        document.getElementById(`optionNote${id}`).innerHTML = `ID ${id} - ${title}`;
    }


}

/**
 * Objeto para manejar la UI en este TP, provisto por los docentes Nico Facón y Mati Marchesi.
 */
const ui = new UserInterface();