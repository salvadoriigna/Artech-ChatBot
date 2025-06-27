let notesId = 1;

class Note {
    constructor(titulo, contenido, categoria, userId) {
        this.id = notesId++;
        this.titulo = titulo;
        this.contenido = contenido;
        this.categoria = categoria;
        this.userId = userId;
        this.usuarios_ver_editar = [userId];
        this.modificaciones = [
            new Modificacion(userId, titulo, contenido, categoria)
        ];
    }

    agregarModificacion(idUsuario) {
        if (this.usuarios_ver_editar.includes(idUsuario)) {
            this.modificaciones.push(new Modificacion(
                idUsuario,
                this.titulo,
                this.contenido,
                this.categoria
            ));
            return true;
        }
        return false;
    }

    modificarNota(idUsuario, nuevoTitulo, nuevoContenido, nuevaCategoria) {
        if (this.agregarModificacion(idUsuario)) {
            this.titulo = nuevoTitulo;
            this.contenido = nuevoContenido;
            this.categoria = nuevaCategoria;
            return this;
        }
        return -1;
    }


    agregarUsuario(userId) {
        if (!this.usuarios_ver_editar.includes(userId)) {
            this.usuarios_ver_editar.push(userId);
            return true;
        }
        return false;
    }

    eliminarUsuario(userId) {
        const index = this.usuarios_ver_editar.indexOf(userId);
        if (index !== -1) {
            this.usuarios_ver_editar.splice(index, 1);
            return true;
        }
        return false;
    }


}



