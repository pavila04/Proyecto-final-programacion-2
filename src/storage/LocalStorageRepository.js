export class LocalStorageRepository {
    constructor(key) {
        this.key = key;
    }

    // Obtener todos los registros guardados en el almacenamiento local
    getAll() {
        const data = localStorage.getItem(this.key);
        return data ? JSON.parse(data) : [];
    }

    // Guardar toda la lista (sobrescribe los datos anteriores)
    saveAll(lista) {
        localStorage.setItem(this.key, JSON.stringify(lista));
    }

    // Agregar un nuevo registro y guardar la lista completa
    add(item) {
        const lista = this.getAll();
        lista.push(item);
        this.saveAll(lista);
    }
}
