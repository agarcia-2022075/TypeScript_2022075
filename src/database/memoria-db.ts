import type { Incidente, EstadoIncidente } from '../interfaces/incidente.interface.js';
import type { CreateIncidenteDto } from '../dtos/create-incidente.dto.js';

export class MemoriaDb {
  private incidentes: Incidente[] = [];
  private contador = 1;

  /**
   * Crea un nuevo incidente y lo almacena en memoria.
   * Genera el ID de forma incremental (ej: "1", "2", "3"), setea la fecha actual y establece el estado inicial en 'abierto'.
   */
  public crearIncidente(dto: CreateIncidenteDto): Incidente {
    const nuevoIncidente: Incidente = {
      id: this.contador.toString(),
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      reportadoPor: dto.reportadoPor,
      prioridad: dto.prioridad,
      estado: 'abierto',
      fechaCreacion: new Date()
    };

    this.contador++;
    this.incidentes.push(nuevoIncidente);
    return nuevoIncidente;
  }

  /**
   * Obtiene la lista completa de incidentes almacenados.
   */
  public obtenerTodos(): Incidente[] {
    return [...this.incidentes];
  }

  /**
   * Actualiza el estado de un incidente existente por su ID.
   * Si el incidente no existe, retorna null.
   */
  public actualizarEstado(id: string, nuevoEstado: EstadoIncidente): Incidente | null {
    const incidente = this.incidentes.find((inc) => inc.id === id);
    if (!incidente) {
      return null;
    }
    incidente.estado = nuevoEstado;
    return incidente;
  }
}
