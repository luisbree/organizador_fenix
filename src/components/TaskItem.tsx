"use client";

import type * as React from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    <Card className={cn(
      "w-full shadow-md transition-all duration-300 ease-in-out",
      task.completado ? "bg-muted/50 opacity-60" : "bg-card hover:shadow-lg"
    )}>
      <div className="p-3 flex items-start justify-between gap-2">
        <div className="flex items-start space-x-2 flex-grow min-w-0 pt-0.5">
          <Checkbox
            id={`complete-${task.id}`}
            checked={task.completado}
            onCheckedChange={handleCheckboxChange}
            aria-label={`Marcar ${task.tarea} como completada`}
            className="h-5 w-5 shrink-0 mt-0.5"
          />
          <h3 className={cn(
            "text-lg font-semibold break-words",
            task.completado && "line-through text-muted-foreground"
          )}>
            {task.tarea}
          </h3>
        </div>
        <Badge className="text-xs whitespace-nowrap bg-accent text-accent-foreground px-2 py-0.5 shrink-0 mt-0.5">
          Índice: {isFinite(task.indice) ? task.indice.toFixed(2) : "∞"}
        </Badge>
      </div>

      <div className="px-3 pb-2 pt-0">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground items-center mb-2">
          <div className="flex items-center space-x-1" title="Urgencia">
            <Flame className="h-3.5 w-3.5 text-destructive" />
            <span>{task.urgencia}</span>
          </div>
          <div className="flex items-center space-x-1" title="Necesidad">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>{task.necesidad}</span>
          </div>
          <div className="flex items-center space-x-1" title="Costo">
            <CircleDollarSign className="h-3.5 w-3.5 text-accent" />
            <span>{task.costo}</span>
          </div>
          <div className="flex items-center space-x-1" title="Duración">
            <Hourglass className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{task.duracion}</span>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <p className="text-xs">
            {new Date(task.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDelete} 
            aria-label={`Eliminar tarea ${task.tarea}`} 
            className="text-destructive hover:bg-destructive/10 h-7 w-7"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
