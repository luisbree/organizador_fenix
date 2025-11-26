import type { Timestamp } from 'firebase/firestore';

export interface SubTask {
  id: string;
  parentId: string;
  tarea: string;
  completado: boolean;
  createdAt: Timestamp | Date;
  scheduledAt?: Timestamp | Date | null;
}

export interface Task {
  id: string;
  tarea: string;
  urgencia: number;
  necesidad: number;
  costo: number;
  duracion: number;
  indice: number;
  completado: boolean;
  createdAt: Timestamp | Date;
  scheduledAt?: Timestamp | Date | null;
  subtasks?: SubTask[];
  isFenix?: boolean;
  fenixPeriod?: number;
}
