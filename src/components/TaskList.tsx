
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
import { Flame, ShieldCheck, CircleDollarSign, Hourglass, ListChecks, CalendarDays, HelpCircle, Trash2 } from 'lucide-react';


interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export function TaskList({ tasks, onToggleComplete, onDeleteTask }: TaskListProps) {
  const sortedTasks = [...tasks].sort((a, b) => {
    const aIndex = a.indice;
    const bIndex = b.indice;

    if (a.completado && !b.completado) return 1;
    if (!a.completado && b.completado) return -1;

    if (aIndex === Infinity && bIndex !== Infinity) return -1;
    if (bIndex === Infinity && aIndex !== Infinity) return 1;
    if (aIndex === Infinity && bIndex === Infinity) {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (isNaN(aIndex) && !isNaN(bIndex)) return 1; 
    if (!isNaN(aIndex) && isNaN(bIndex)) return -1;
    if (isNaN(aIndex) && isNaN(bIndex)) {
       return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    
    if (bIndex !== aIndex) {
      return bIndex - aIndex; // Descending order for finite indices
    }
    // If indices are equal, sort by creation date (older first)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
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
            <TableHead className="w-px p-2 h-10"></TableHead> {/* Checkbox */}
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
            <TableHead className="p-2 h-10 text-right" title="Acciones">
              <div className="flex items-center justify-end">
                <Trash2 className="h-4 w-4 mr-1 text-muted-foreground" /> Acción
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
