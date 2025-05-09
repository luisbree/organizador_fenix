export interface Task {
  id: string;
  tarea: string;
  urgencia: number;
  necesidad: number;
  costo: number;
  duracion: number;
  indice: number;
  completado: boolean;
  createdAt: Date;
}
