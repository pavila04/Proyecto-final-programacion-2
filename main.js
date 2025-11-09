import { Medico } from "./src/models/Medico.js";
import { Paciente } from "./src/models/Paciente.js";
import { Servicio } from "./src/models/Servicio.js";
import { LocalStorageRepository } from "./src/storage/LocalStorageRepository.js";
import { TurnoService } from "./src/services/TurnoService.js";
import { TurnoOcupadoError } from "./src/errors/TurnoOcupadoError.js";
import { HorarioInvalidoError } from "./src/errors/HorarioInvalidoError.js";

// Usuarios de ejemplo para login
const USERS = [
    { username: "admin", password: "1234", nombre: "Administrador" },
    { username: "recepcion", password: "1234", nombre: "Recepción" }
];

// Repositorios (localStorage)
const medicoRepo = new LocalStorageRepository("medicos");
const pacienteRepo = new LocalStorageRepository("pacientes");
const servicioRepo = new LocalStorageRepository("servicios");
const turnoRepo = new LocalStorageRepository("turnos");

// Servicio de turnos
const turnoService = new TurnoService(turnoRepo, medicoRepo, pacienteRepo, servicioRepo);

// ======================= LOGIN =======================

function inicializarLogin() {
    const formLogin = document.getElementById("formLogin");
    if (!formLogin) return;

    formLogin.addEventListener("submit", (event) => {
        event.preventDefault();
        const usuarioInput = document.getElementById("usuario");
        const contrasenaInput = document.getElementById("contrasena");
        const errorLabel = document.getElementById("loginError");

        const usuario = usuarioInput.value.trim();
        const contrasena = contrasenaInput.value.trim();

        const user = USERS.find(
            u => u.username === usuario && u.password === contrasena
        );

        if (!user) {
            errorLabel.textContent = "Usuario o contraseña incorrectos.";
            return;
        }

        sessionStorage.setItem("usuario", user.username);
        sessionStorage.setItem("usuarioNombre", user.nombre);
        mostrarApp(user.nombre);
    });
}

function mostrarLogin() {
    const loginContainer = document.getElementById("loginContainer");
    const appContainer = document.getElementById("appContainer");
    if (loginContainer) loginContainer.classList.remove("oculto");
    if (appContainer) appContainer.classList.add("oculto");
}

function mostrarApp(nombreUsuario) {
    const loginContainer = document.getElementById("loginContainer");
    const appContainer = document.getElementById("appContainer");
    const usuarioNombre = document.getElementById("usuarioNombre");

    if (loginContainer) loginContainer.classList.add("oculto");
    if (appContainer) appContainer.classList.remove("oculto");
    if (usuarioNombre) usuarioNombre.textContent = nombreUsuario;

    inicializarDatos();
    cargarCombos();
    inicializarEventos();
    mostrarSeccion("turnos");
}

function manejarLogout() {
    sessionStorage.removeItem("usuario");
    sessionStorage.removeItem("usuarioNombre");
    window.location.reload();
}

// ======================= DATOS INICIALES =======================

function inicializarDatos() {
    if (medicoRepo.getAll().length === 0) {
        const medicos = [
            new Medico(1, "Ana", "González", "123", "5555-1111", "ana@clinica.com", "Medicina General", "08:00", "16:00"),
            new Medico(2, "Luis", "Pérez", "456", "5555-2222", "luis@clinica.com", "Pediatría", "09:00", "17:00")
        ];
        medicoRepo.saveAll(medicos);
    }

    if (pacienteRepo.getAll().length === 0) {
        const pacientes = [
            new Paciente(1, "Carlos", "López", "1111", "5555-3333", "carlos@mail.com", "1990-05-10", "Sala 1"),
            new Paciente(2, "María", "Ramírez", "2222", "5555-4444", "maria@mail.com", "1985-07-20", "Sala 2")
        ];
        pacienteRepo.saveAll(pacientes);
    }

    if (servicioRepo.getAll().length === 0) {
        const servicios = [
            new Servicio(1, "Consulta general", "Consulta de medicina general", 200, 30),
            new Servicio(2, "Pediatría", "Consulta para niños", 250, 30)
        ];
        servicioRepo.saveAll(servicios);
    }
}

// ======================= COMBOS =======================

function cargarCombos() {
    const selectMedico = document.getElementById("medicoId");
    const selectPaciente = document.getElementById("pacienteId");
    const selectServicio = document.getElementById("servicioId");
    const selectMedicoFiltro = document.getElementById("medicoFiltroId");

    if (!selectMedico || !selectPaciente || !selectServicio) return;

    selectMedico.innerHTML = "";
    selectPaciente.innerHTML = "";
    selectServicio.innerHTML = "";

    if (selectMedicoFiltro) {
        selectMedicoFiltro.innerHTML = "";
        const optTodos = document.createElement("option");
        optTodos.value = "";
        optTodos.textContent = "Todos";
        selectMedicoFiltro.appendChild(optTodos);
    }

    const medicos = medicoRepo.getAll();
    const pacientes = pacienteRepo.getAll();
    const servicios = servicioRepo.getAll();

    medicos.forEach(m => {
        const texto = `${m.nombre} ${m.apellido} (${m.especialidad})`;

        const optForm = document.createElement("option");
        optForm.value = m.id;
        optForm.textContent = texto;
        selectMedico.appendChild(optForm);

        if (selectMedicoFiltro) {
            const optFiltro = document.createElement("option");
            optFiltro.value = m.id;
            optFiltro.textContent = texto;
            selectMedicoFiltro.appendChild(optFiltro);
        }
    });

    pacientes.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = `${p.nombre} ${p.apellido}`;
        selectPaciente.appendChild(opt);
    });

    servicios.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s.id;
        opt.textContent = s.nombre;
        selectServicio.appendChild(opt);
    });
}

// ======================= TURNOS =======================

function manejarCrearTurno(event) {
    event.preventDefault();
    const medicoId = parseInt(document.getElementById("medicoId").value, 10);
    const pacienteId = parseInt(document.getElementById("pacienteId").value, 10);
    const servicioId = parseInt(document.getElementById("servicioId").value, 10);
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;

    const mensajeError = document.getElementById("mensajeError");
    const mensajeExito = document.getElementById("mensajeExito");
    mensajeError.textContent = "";
    mensajeExito.textContent = "";

    try {
        const turno = turnoService.crearTurno(medicoId, pacienteId, servicioId, fecha, hora);
        mensajeExito.textContent = `Turno creado con ID ${turno.id}.`;
    } catch (error) {
        if (error instanceof TurnoOcupadoError || error instanceof HorarioInvalidoError) {
            mensajeError.textContent = error.message;
        } else {
            mensajeError.textContent = "Ocurrió un error al crear el turno.";
            console.error(error);
        }
    }
}

function manejarListarTurnos() {
    const fecha = document.getElementById("fechaListado").value;
    const tbody = document.querySelector("#tablaTurnos tbody");
    const selectMedicoFiltro = document.getElementById("medicoFiltroId");

    if (!tbody || !fecha) return;
    tbody.innerHTML = "";

    let turnos = turnoService.listarTurnosPorFecha(fecha);

    if (selectMedicoFiltro && selectMedicoFiltro.value !== "") {
        const medicoFiltroId = parseInt(selectMedicoFiltro.value, 10);
        turnos = turnos.filter(t => t.medicoId === medicoFiltroId);
    }

    const medicos = medicoRepo.getAll();
    const pacientes = pacienteRepo.getAll();
    const servicios = servicioRepo.getAll();

    turnos.forEach(t => {
        const tr = document.createElement("tr");

        const medico = medicos.find(m => m.id === t.medicoId);
        const paciente = pacientes.find(p => p.id === t.pacienteId);
        const servicio = servicios.find(s => s.id === t.servicioId);
        const fechaHora = new Date(t.fechaHoraInicio);

        const medicoTexto = medico
            ? `${medico.nombre} ${medico.apellido} (${medico.especialidad || ""})`
            : "";

        const pacienteTexto = paciente
            ? `${paciente.nombre} ${paciente.apellido}` +
              (paciente.sala ? ` - ${paciente.sala}` : "")
            : "";

        tr.innerHTML = `
            <td>${t.id}</td>
            <td>${medicoTexto}</td>
            <td>${pacienteTexto}</td>
            <td>${servicio ? servicio.nombre : ""}</td>
            <td>${fechaHora.toLocaleString()}</td>
            <td>${t.estado}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ======================= MÉDICOS =======================

function manejarCrearMedico(event) {
    event.preventDefault();

    const nombre = document.getElementById("medicoNombre").value.trim();
    const apellido = document.getElementById("medicoApellido").value.trim();
    const dpi = document.getElementById("medicoDpi").value.trim();
    const telefono = document.getElementById("medicoTelefono").value.trim();
    const email = document.getElementById("medicoEmail").value.trim();
    const especialidad = document.getElementById("medicoEspecialidad").value.trim();
    const horaInicio = document.getElementById("medicoHoraInicio").value || "08:00";
    const horaFin = document.getElementById("medicoHoraFin").value || "16:00";

    if (!nombre || !apellido || !especialidad) {
        alert("Nombre, apellido y especialidad son obligatorios.");
        return;
    }

    const medicos = medicoRepo.getAll();
    const nuevoId = medicos.length > 0 ? Math.max(...medicos.map(m => m.id)) + 1 : 1;

    const nuevoMedico = new Medico(
        nuevoId,
        nombre,
        apellido,
        dpi,
        telefono,
        email,
        especialidad,
        horaInicio,
        horaFin
    );

    medicoRepo.add(nuevoMedico);
    event.target.reset();
    cargarCombos();
    alert("Médico registrado correctamente.");
}

// ======================= PACIENTES =======================

function manejarCrearPaciente(event) {
    event.preventDefault();

    const nombre = document.getElementById("pacienteNombre").value.trim();
    const apellido = document.getElementById("pacienteApellido").value.trim();
    const dpi = document.getElementById("pacienteDpi").value.trim();
    const telefono = document.getElementById("pacienteTelefono").value.trim();
    const email = document.getElementById("pacienteEmail").value.trim();
    const fechaNacimiento = document.getElementById("pacienteFechaNacimiento").value;
    const sala = document.getElementById("pacienteSala").value.trim();

    if (!nombre || !apellido) {
        alert("Nombre y apellido son obligatorios.");
        return;
    }

    const pacientes = pacienteRepo.getAll();
    const nuevoId = pacientes.length > 0 ? Math.max(...pacientes.map(p => p.id)) + 1 : 1;

    const nuevoPaciente = new Paciente(
        nuevoId,
        nombre,
        apellido,
        dpi,
        telefono,
        email,
        fechaNacimiento || null,
        sala || ""
    );

    pacienteRepo.add(nuevoPaciente);
    event.target.reset();
    cargarCombos();
    alert("Paciente registrado correctamente.");
}

// ======================= MENÚ Y EVENTOS =======================

function mostrarSeccion(nombre) {
    const secciones = document.querySelectorAll("[data-section]");
    secciones.forEach(sec => {
        if (sec.getAttribute("data-section") === nombre) {
            sec.classList.remove("oculto");
        } else {
            sec.classList.add("oculto");
        }
    });
}

function inicializarEventos() {
    const formTurno = document.getElementById("formCrearTurno");
    if (formTurno) {
        formTurno.addEventListener("submit", manejarCrearTurno);
    }

    const btnListar = document.getElementById("btnListarTurnos");
    if (btnListar) {
        btnListar.addEventListener("click", manejarListarTurnos);
    }

    const formMedico = document.getElementById("formCrearMedico");
    if (formMedico) {
        formMedico.addEventListener("submit", manejarCrearMedico);
    }

    const formPaciente = document.getElementById("formCrearPaciente");
    if (formPaciente) {
        formPaciente.addEventListener("submit", manejarCrearPaciente);
    }

    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", manejarLogout);
    }

    const botonesMenu = document.querySelectorAll("[data-section-target]");
    botonesMenu.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.getAttribute("data-section-target");
            mostrarSeccion(target);
        });
    });

    const hoy = new Date().toISOString().slice(0, 10);
    const fechaTurno = document.getElementById("fecha");
    const fechaListado = document.getElementById("fechaListado");
    if (fechaTurno) fechaTurno.value = hoy;
    if (fechaListado) fechaListado.value = hoy;
}

// ======================= INICIO =======================

document.addEventListener("DOMContentLoaded", () => {
    inicializarLogin();

    const usuarioGuardado = sessionStorage.getItem("usuario");
    const nombreGuardado = sessionStorage.getItem("usuarioNombre");
    if (usuarioGuardado && nombreGuardado) {
        mostrarApp(nombreGuardado);
    } else {
        mostrarLogin();
    }
});
