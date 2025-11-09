import { Persona } from "./Persona.js";

export class Medico extends Persona {
    constructor(id, nombre, apellido, dpi, telefono, email, especialidad, horaInicio, horaFin) {
        super(id, nombre, apellido, dpi, telefono, email);
        this.especialidad = especialidad;
        this.horaInicio = horaInicio; // "08:00"
        this.horaFin = horaFin;       // "16:00"
    }

    estaEnHorario(hora) {
        // hora en formato "HH:MM"
        return hora >= this.horaInicio && hora <= this.horaFin;
    }
}
