import { Persona } from "./Persona.js";

export class Paciente extends Persona {
    constructor(id, nombre, apellido, dpi, telefono, email, fechaNacimiento, sala) {
        super(id, nombre, apellido, dpi, telefono, email);
        this.fechaNacimiento = fechaNacimiento;
        this.sala = sala; // nueva propiedad
    }

    calcularEdad() {
        const hoy = new Date();
        const nacimiento = new Date(this.fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    }
}
