import type { Prioridad } from '../interfaces/incidente.interface.js';

export interface CreateIncidenteDto {
  readonly titulo: string;
  readonly descripcion: string;
  readonly reportadoPor: string;
  readonly prioridad: Prioridad;
}
