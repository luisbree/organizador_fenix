
import type { Timestamp } from 'firebase/firestore';

export interface Task {
  id: string;
  tarea: string;
  urgencia: number;
  necesidad: number;
  costo: number;
  duracion: number;
  indice: number;
  completado: boolean;
  createdAt: Timestamp | Date; // Can be a server timestamp or a Date object
  scheduledAt?: Timestamp | Date | null;
}
