let modificacionId = 1;

class Modificacion {
    constructor(idUsuario, titulo, contenido, categoria) {
        this.id = modificacionId++;
        this.idUsuario = idUsuario;
        this.titulo = titulo;
        this.contenido = contenido;
        this.categoria = categoria;
        this.date = new Date();
    }
}