export class TurnoOcupadoError extends Error {
    constructor(message) {
        super(message);
        this.name = "TurnoOcupadoError";
    }
}
