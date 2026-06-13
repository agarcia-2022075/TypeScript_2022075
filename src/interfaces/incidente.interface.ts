export type Prioridad = 'alta' | 'media' | 'baja';

export type EstadoIncidente = 'abierto' | 'en proceso' | 'cerrado';

export interface Incidente {
  readonly id: string;
  titulo: string;
  descripcion: string;
  reportadoPor: string;
  prioridad: Prioridad;
  estado: EstadoIncidente;
  fechaCreacion: Date;
}
