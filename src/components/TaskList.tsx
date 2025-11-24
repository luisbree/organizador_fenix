
"use client";

import type * as React from 'react';
import type { Task } from '@/types/task';
import { TaskItem } from './TaskItem';
import { ListChecks } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onMarkSchedulingAttempted: (id: string) => void;
  onUpdateTaskValue: (
    taskId: string,
    field: keyof Pick<Task, 'urgencia' | 'necesidad' | 'costo' | 'duracion'>,
    newValue: number
  ) => void;
}

export function TaskList({ tasks, onToggleComplete, onDeleteTask, onMarkSchedulingAttempted, onUpdateTaskValue }: TaskListProps) {
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completado && !b.completado) return 1;
    if (!a.completado && b.completado) return -1;

    const aIndex = a.indice;
    const bIndex = b.indice;

    if (aIndex === Infinity && bIndex !== Infinity) return -1;
    if (bIndex === Infinity && aIndex !== Infinity) return 1;
    if (aIndex === Infinity && bIndex === Infinity) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    
    if (isNaN(aIndex) && !isNaN(bIndex)) return 1;
    if (!isNaN(aIndex) && isNaN(bIndex)) return -1;
    if (isNaN(aIndex) && isNaN(bIndex)) {
       return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    
    if (bIndex !== aIndex) {
      return bIndex - aIndex; 
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed rounded-xl bg-card">
        <ListChecks className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-xl text-foreground font-semibold">No hay tareas pendientes.</p>
        <p className="text-md text-muted-foreground">¡Añade una nueva tarea para empezar!</p>
      </div>
    );
  }

  return (
     <div className="rounded-lg border overflow-hidden bg-card">
      <Table>
        <TableCaption>
           {tasks.filter(task => !task.completado).length} tarea(s) pendiente(s) de {tasks.length}.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Tarea</TableHead>
            <TableHead className="text-center">Urgencia</TableHead>
            <TableHead className="text-center">Necesidad</TableHead>
            <TableHead className="text-center">Costo</TableHead>
            <TableHead className="text-center">Duración</TableHead>
            <TableHead className="text-center font-bold">Índice</TableHead>
            <TableHead className="text-right w-[120px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onDeleteTask={onDeleteTask}
              onMarkSchedulingAttempted={onMarkSchedulingAttempted}
              onUpdateTaskValue={onUpdateTaskValue}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
