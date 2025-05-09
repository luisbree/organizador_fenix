"use client";

import type * as React from 'react';
import type { Task } from '@/types/task';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export function TaskList({ tasks, onToggleComplete, onDeleteTask }: TaskListProps) {
  const sortedTasks = [...tasks].sort((a, b) => {
    const aIndex = a.indice;
    const bIndex = b.indice;

    if (aIndex === Infinity && bIndex !== Infinity) return -1;
    if (bIndex === Infinity && aIndex !== Infinity) return 1;
    if (aIndex === Infinity && bIndex === Infinity) {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (isNaN(aIndex) && !isNaN(bIndex)) return 1; // NaN at the end
    if (!isNaN(aIndex) && isNaN(bIndex)) return -1; // NaN at the end
    if (isNaN(aIndex) && isNaN(bIndex)) {
       return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    
    // Descending order for finite indices
    return bIndex - aIndex;
  });

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground">No hay tareas pendientes.</p>
        <p className="text-md text-muted-foreground">¡Añade una nueva tarea para empezar!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedTasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </div>
  );
}
