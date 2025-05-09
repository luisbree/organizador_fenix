"use client";

import type * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    <Card className={cn("w-full shadow-lg transition-all duration-300 ease-in-out", task.completado ? "bg-muted/50 opacity-70" : "bg-card hover:shadow-xl")}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
        <div className="flex items-center space-x-3">
          <Checkbox
            id={`complete-${task.id}`}
            checked={task.completado}
            onCheckedChange={handleCheckboxChange}
            aria-label={`Marcar ${task.tarea} como completada`}
            className="h-5 w-5"
          />
          <CardTitle className={cn("text-xl font-semibold", task.completado && "line-through text-muted-foreground")}>
            {task.tarea}
          </CardTitle>
        </div>
        <Badge className="text-sm whitespace-nowrap bg-accent text-accent-foreground px-3 py-1">
          Índice: {isFinite(task.indice) ? task.indice.toFixed(2) : "∞"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1.5" title="Urgencia">
            <Flame className="h-4 w-4 text-destructive" /> 
            <span>Urgencia: {task.urgencia}</span>
          </div>
          <div className="flex items-center space-x-1.5" title="Necesidad">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Necesidad: {task.necesidad}</span>
          </div>
          <div className="flex items-center space-x-1.5" title="Costo">
            <CircleDollarSign className="h-4 w-4 text-accent" />
            <span>Costo: {task.costo}</span>
          </div>
          <div className="flex items-center space-x-1.5" title="Duración">
            <Hourglass className="h-4 w-4 text-muted-foreground" />
            <span>Duración: {task.duracion}</span>
          </div>
        </div>
         <CardDescription className="text-xs">
          Añadido: {new Date(task.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </CardDescription>
        <div className="flex justify-end pt-2">
          <Button variant="ghost" size="icon" onClick={handleDelete} aria-label={`Eliminar tarea ${task.tarea}`} className="text-destructive hover:bg-destructive/10">
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
