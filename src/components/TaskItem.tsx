
"use client";

import type * as React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Flame, ShieldCheck, CircleDollarSign, Hourglass, Trash2, CalendarPlus } from 'lucide-react';
import type { Task } from '@/types/task';
import { cn } from '@/lib/utils';
import { EditableNumericCell } from './EditableNumericCell';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onMarkSchedulingAttempted: (id: string) => void;
  onUpdateTaskValue: (
    taskId: string,
    field: keyof Pick<Task, 'urgencia' | 'necesidad' | 'costo' | 'duracion'>,
    newValue: number
  ) => void;
}

export function TaskItem({ task, onToggleComplete, onDeleteTask, onMarkSchedulingAttempted, onUpdateTaskValue }: TaskItemProps) {
  const handleCheckboxChange = () => {
    onToggleComplete(task.id);
  };

  const handleDelete = () => {
    onDeleteTask(task.id);
  };

  const handleScheduleOnCalendar = () => {
    const taskTitle = encodeURIComponent(task.tarea);
    const taskDetails = encodeURIComponent(
      `Tarea: ${task.tarea}\nUrgencia: ${task.urgencia}\nNecesidad: ${task.necesidad}\nCosto: ${task.costo}\nDuración: ${task.duracion}`
    );
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${taskTitle}&details=${taskDetails}`;
    
    window.open(calendarUrl, '_blank', 'noopener,noreferrer');
    onMarkSchedulingAttempted(task.id);
  };

  return (
    <TableRow className={cn(
      task.completado && "opacity-60 bg-muted/30 hover:bg-muted/40",
      task.isSchedulingAttempted && !task.completado && "bg-accent/[.08] hover:bg-accent/[.12]" 
    )}>
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
      
      <TableCell className="p-1 align-middle text-center whitespace-nowrap">
        <EditableNumericCell
          value={task.urgencia}
          onSave={(newValue) => onUpdateTaskValue(task.id, 'urgencia', newValue)}
          icon={<Flame className="h-4 w-4 text-destructive shrink-0" />}
          title="Urgencia"
        />
      </TableCell>
      <TableCell className="p-1 align-middle text-center whitespace-nowrap">
        <EditableNumericCell
          value={task.necesidad}
          onSave={(newValue) => onUpdateTaskValue(task.id, 'necesidad', newValue)}
          icon={<ShieldCheck className="h-4 w-4 text-primary shrink-0" />}
          title="Necesidad"
        />
      </TableCell>
      <TableCell className="p-1 align-middle text-center whitespace-nowrap">
        <EditableNumericCell
          value={task.costo}
          onSave={(newValue) => onUpdateTaskValue(task.id, 'costo', newValue)}
          icon={<CircleDollarSign className="h-4 w-4 text-accent shrink-0" />}
          title="Costo"
        />
      </TableCell>
      <TableCell className="p-1 align-middle text-center whitespace-nowrap">
        <EditableNumericCell
          value={task.duracion}
          onSave={(newValue) => onUpdateTaskValue(task.id, 'duracion', newValue)}
          icon={<Hourglass className="h-4 w-4 text-muted-foreground shrink-0" />}
          title="Duración"
        />
      </TableCell>

      <TableCell className="p-2 align-middle text-center font-medium whitespace-nowrap">
        {isFinite(task.indice) ? task.indice.toFixed(2) : "∞"}
      </TableCell>
      <TableCell className="p-2 align-middle text-xs text-muted-foreground whitespace-nowrap min-w-[100px]">
        {new Date(task.createdAt).toLocaleDateString('es-ES', { year: '2-digit', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </TableCell>
      <TableCell className="p-2 align-middle text-right">
        <div className="flex items-center justify-end space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleScheduleOnCalendar}
            aria-label={`Programar tarea ${task.tarea} en Google Calendar`}
            className="text-accent hover:bg-accent/10 h-7 w-7"
            title="Programar en Google Calendar"
          >
            <CalendarPlus className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Eliminar tarea ${task.tarea}`}
                className="text-destructive hover:bg-destructive/10 h-7 w-7"
                title="Eliminar tarea"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro que quieres eliminar la tarea?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Esto eliminará permanentemente la tarea de la lista.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className={cn(
                  "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                )}>
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}
