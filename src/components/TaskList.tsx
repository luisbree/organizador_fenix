
"use client";

import type * as React from 'react';
import type { Task } from '@/types/task';
import { TaskItem } from './TaskItem';
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Flame, ShieldCheck, CircleDollarSign, Hourglass, ListChecks, CalendarDays, HelpCircle } from 'lucide-react';


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
    // 1. Completed tasks go to the bottom
    if (a.completado && !b.completado) return 1;
    if (!a.completado && b.completado) return -1;

    // At this point, tasks are either all completed or all not completed.
    // Sort them by indice and then by createdAt.

    const aIndex = a.indice;
    const bIndex = b.indice;

    // Handle Infinity for indice (Infinity comes first in descending sort)
    if (aIndex === Infinity && bIndex !== Infinity) return -1;
    if (bIndex === Infinity && aIndex !== Infinity) return 1;
    if (aIndex === Infinity && bIndex === Infinity) {
      // Both are Infinity, sort by creation date (newer first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    // Handle NaN for indice (NaN goes to the bottom of its current group, effectively lower priority)
    if (isNaN(aIndex) && !isNaN(bIndex)) return 1; // a (NaN) after b
    if (!isNaN(aIndex) && isNaN(bIndex)) return -1; // b (NaN) after a
    if (isNaN(aIndex) && isNaN(bIndex)) {
      // Both are NaN, sort by creation date (newer first)
       return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    
    // Main sort by indice (descending)
    if (bIndex !== aIndex) {
      return bIndex - aIndex; 
    }

    // Fallback sort by creation date (descending - newer first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 border rounded-xl shadow-md bg-card">
        <ListChecks className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-xl text-foreground font-semibold">No hay tareas pendientes.</p>
        <p className="text-md text-muted-foreground">¡Añade una nueva tarea para empezar!</p>
      </div>
    );
  }

  return (
    <div className="border rounded-xl shadow-md overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/60 hover:bg-muted/70">
            <TableHead className="w-px p-2 h-10"></TableHead> 
            <TableHead className="p-2 h-10 min-w-[150px]">Tarea</TableHead>
            <TableHead className="p-2 h-10 text-center" title="Urgencia">
              <div className="flex items-center justify-center">
                <Flame className="h-4 w-4 mr-1 text-destructive" /> Urg.
              </div>
            </TableHead>
            <TableHead className="p-2 h-10 text-center" title="Necesidad">
              <div className="flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 mr-1 text-primary" /> Nec.
              </div>
            </TableHead>
            <TableHead className="p-2 h-10 text-center" title="Costo">
              <div className="flex items-center justify-center">
                <CircleDollarSign className="h-4 w-4 mr-1 text-accent" /> Cost.
              </div>
            </TableHead>
            <TableHead className="p-2 h-10 text-center" title="Duración">
              <div className="flex items-center justify-center">
                 <Hourglass className="h-4 w-4 mr-1 text-muted-foreground" /> Dur.
              </div>
            </TableHead>
            <TableHead className="p-2 h-10 text-center" title="Índice de Prioridad">
              <div className="flex items-center justify-center">
                <HelpCircle className="h-4 w-4 mr-1 text-foreground" /> Índice
              </div>
            </TableHead>
            <TableHead className="p-2 h-10 text-left min-w-[100px]" title="Fecha de Creación">
               <div className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-1 text-muted-foreground" /> Creado
               </div>
            </TableHead>
            <TableHead className="p-2 h-10 text-right min-w-[80px]">
              <div className="flex items-center justify-end">
                 Acción 
              </div>
            </TableHead>
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
         {tasks.length > 0 && (
          <TableCaption className="py-4 text-sm">
            {tasks.filter(task => !task.completado).length} tarea(s) pendiente(s). Total: {tasks.length} tarea(s).
          </TableCaption>
        )}
      </Table>
    </div>
  );
}
