import { TurnoOcupadoError } from "../errors/TurnoOcupadoError.js";
import { HorarioInvalidoError } from "../errors/HorarioInvalidoError.js";
import { Turno } from "../models/Turno.js";

export class TurnoService {
    constructor(turnoRepo, medicoRepo, pacienteRepo, servicioRepo) {
        this.turnoRepo = turnoRepo;
        this.medicoRepo = medicoRepo;
        this.pacienteRepo = pacienteRepo;
        this.servicioRepo = servicioRepo;
    }

    crearTurno(medicoId, pacienteId, servicioId, fecha, hora) {
        const medicos = this.medicoRepo.getAll();
        const pacientes = this.pacienteRepo.getAll();
        const servicios = this.servicioRepo.getAll();
        const turnos = this.turnoRepo.getAll();

        const medico = medicos.find(m => m.id === medicoId);
        const paciente = pacientes.find(p => p.id === pacienteId);
        const servicio = servicios.find(s => s.id === servicioId);

        if (!medico || !paciente || !servicio) {
            throw new Error("Datos inválidos para crear el turno.");
        }

       // Validar horario del médico usando las propiedades directamente
        if (!(hora >= medico.horaInicio && hora <= medico.horaFin)) {
            throw new HorarioInvalidoError("La hora seleccionada está fuera del horario del médico.");
}
 

        // Construir fecha y hora completa
        const fechaHora = new Date(`${fecha}T${hora}:00`);

        // Verificar si ya existe un turno programado para ese médico en esa fecha/hora
        const existeChoque = turnos.some(t => {
            const inicio = new Date(t.fechaHoraInicio);
            return t.medicoId === medicoId &&
                   inicio.getTime() === fechaHora.getTime() &&
                   t.estado === "PROGRAMADO";
        });

        if (existeChoque) {
            throw new TurnoOcupadoError("El médico ya tiene un turno programado en esa fecha y hora.");
        }

        // Generar ID nuevo
        const nuevoId = turnos.length > 0 ? Math.max(...turnos.map(t => t.id)) + 1 : 1;

        const turno = new Turno(
            nuevoId,
            medicoId,
            pacienteId,
            servicioId,
            fechaHora.toISOString(),
            "PROGRAMADO"
        );

        this.turnoRepo.add(turno);
        return turno;
    }

    listarTurnosPorFecha(fecha) {
        const turnos = this.turnoRepo.getAll();
        const fechaFiltro = new Date(fecha);

        return turnos.filter(t => {
            const f = new Date(t.fechaHoraInicio);
            // Comparar solo la parte de fecha (YYYY-MM-DD)
            return f.toISOString().slice(0, 10) === fechaFiltro.toISOString().slice(0, 10);
        });
    }
}
