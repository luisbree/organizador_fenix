
"use client";

import type * as React from 'react';
import type { Task } from '@/types/task';
import { TaskItem } from './TaskItem';
import { ListChecks } from 'lucide-react';


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
      <div className="text-center py-10 border-2 border-dashed rounded-xl bg-card">
        <ListChecks className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-xl text-foreground font-semibold">No hay tareas pendientes.</p>
        <p className="text-md text-muted-foreground">¡Añade una nueva tarea para empezar!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
       {tasks.length > 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            {tasks.filter(task => !task.completado).length} tarea(s) pendiente(s) de {tasks.length}.
          </p>
        )}
    </div>
  );
}
