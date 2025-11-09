export class Turno {
    constructor(id, medicoId, pacienteId, servicioId, fechaHoraInicio, estado = "PROGRAMADO") {
        this.id = id;
        this.medicoId = medicoId;
        this.pacienteId = pacienteId;
        this.servicioId = servicioId;
        this.fechaHoraInicio = fechaHoraInicio; // en formato ISO
        this.estado = estado;
    }
}
