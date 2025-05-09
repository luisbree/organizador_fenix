"use client";

import type * as React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Flame, ShieldCheck, CircleDollarSign, Hourglass, Trash2 } from 'lucide-react';
import type { Task } from '@/types/task';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export function TaskItem({ task, onToggleComplete, onDeleteTask }: TaskItemProps) {
  const handleCheckboxChange = () => {
    onToggleComplete(task.id);
  };

  const handleDelete = () => {
    onDeleteTask(task.id);
  };

  return (
    <TableRow className={cn(task.completado && "opacity-60 bg-muted/30 hover:bg-muted/40")}>
      <TableCell className="w-px p-2 align-middle">
        <Checkbox
          id={`complete-${task.id}`}
          checked={task.completado}
          onCheckedChange={handleCheckboxChange}
          aria-label={`Marcar ${task.tarea} como completada`}
          className="h-4 w-4"
        />
      </TableCell>
      <TableCell className="p-2 align-middle font-medium break-words min-w-[150px] max-w-[300px]">
        <span className={cn(task.completado && "line-through text-muted-foreground")}>
          {task.tarea}
        </span>
      </TableCell>
      <TableCell className="p-2 align-middle text-center whitespace-nowrap">
        <div className="flex items-center justify-center space-x-1" title="Urgencia">
          <Flame className="h-4 w-4 text-destructive shrink-0" />
          <span>{task.urgencia}</span>
        </div>
      </TableCell>
      <TableCell className="p-2 align-middle text-center whitespace-nowrap">
        <div className="flex items-center justify-center space-x-1" title="Necesidad">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
          <span>{task.necesidad}</span>
        </div>
      </TableCell>
      <TableCell className="p-2 align-middle text-center whitespace-nowrap">
        <div className="flex items-center justify-center space-x-1" title="Costo">
          <CircleDollarSign className="h-4 w-4 text-accent shrink-0" />
          <span>{task.costo}</span>
        </div>
      </TableCell>
      <TableCell className="p-2 align-middle text-center whitespace-nowrap">
        <div className="flex items-center justify-center space-x-1" title="Duración">
          <Hourglass className="h-4 w-4 text-muted-foreground shrink-0" />
          <span>{task.duracion}</span>
        </div>
      </TableCell>
      <TableCell className="p-2 align-middle text-center font-medium whitespace-nowrap">
        {isFinite(task.indice) ? task.indice.toFixed(2) : "∞"}
      </TableCell>
      <TableCell className="p-2 align-middle text-xs text-muted-foreground whitespace-nowrap min-w-[100px]">
        {new Date(task.createdAt).toLocaleDateString('es-ES', { year: '2-digit', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </TableCell>
      <TableCell className="p-2 align-middle text-right">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          aria-label={`Eliminar tarea ${task.tarea}`}
          className="text-destructive hover:bg-destructive/10 h-7 w-7"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

