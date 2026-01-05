import type { Timestamp } from 'firebase/firestore';

export type SortOrder = 'index' | 'age';

export interface TaskList {
  id: string;
  name: string;
  createdAt: Timestamp | Date;
}

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
  completedAt?: Timestamp | Date | null;
  scheduledAt?: Timestamp | Date | null;
  subtasks?: SubTask[];
  isFenix?: boolean;
  fenixPeriod?: number;
  isCritical?: boolean;
}
