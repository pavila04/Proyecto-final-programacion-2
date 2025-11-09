export class Persona {
    constructor(id, nombre, apellido, dpi, telefono, email) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.dpi = dpi;
        this.telefono = telefono;
        this.email = email;
    }

    getNombreCompleto() {
        return `${this.nombre} ${this.apellido}`;
    }
}
