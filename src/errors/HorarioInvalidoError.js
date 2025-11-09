export class HorarioInvalidoError extends Error {
    constructor(message) {
        super(message);
        this.name = "HorarioInvalidoError";
    }
}
