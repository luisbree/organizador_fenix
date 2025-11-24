
"use client";

import type * as React from 'react';
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Flame, ShieldCheck, CircleDollarSign, Hourglass, Trash2, CalendarPlus, HelpCircle } from 'lucide-react';
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
      `Urgencia: ${task.urgencia}\nNecesidad: ${task.necesidad}\nCosto: ${task.costo}\nDuración: ${task.duracion}`
    );
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${taskTitle}&details=${taskDetails}`;
    
    window.open(calendarUrl, '_blank', 'noopener,noreferrer');
    onMarkSchedulingAttempted(task.id);
  };
  
  const createdDate = new Date(task.createdAt);

  return (
    <TableRow className={cn(
        task.completado && "bg-muted/50 opacity-60",
        task.isSchedulingAttempted && !task.completado && "bg-accent/[.08]"
    )}>
      <TableCell>
        <Checkbox
            id={`complete-${task.id}`}
            checked={task.completado}
            onCheckedChange={handleCheckboxChange}
            aria-label={`Marcar ${task.tarea} como completada`}
        />
      </TableCell>
      <TableCell>
        <div className={cn("font-medium", task.completado && "line-through text-muted-foreground")}>
          {task.tarea}
        </div>
        <div className="text-xs text-muted-foreground">
          {createdDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric'})}, {createdDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit'})}
        </div>
      </TableCell>
      <TableCell className="text-center">
        <EditableNumericCell
          value={task.urgencia}
          onSave={(newValue) => onUpdateTaskValue(task.id, 'urgencia', newValue)}
          icon={<Flame className="h-4 w-4 text-destructive" />}
          title="Urgencia"
        />
      </TableCell>
      <TableCell className="text-center">
        <EditableNumericCell
          value={task.necesidad}
          onSave={(newValue) => onUpdateTaskValue(task.id, 'necesidad', newValue)}
          icon={<ShieldCheck className="h-4 w-4 text-primary" />}
          title="Necesidad"
        />
      </TableCell>
      <TableCell className="text-center">
        <EditableNumericCell
          value={task.costo}
          onSave={(newValue) => onUpdateTaskValue(task.id, 'costo', newValue)}
          icon={<CircleDollarSign className="h-4 w-4 text-accent" />}
          title="Costo"
        />
      </TableCell>
      <TableCell className="text-center">
        <EditableNumericCell
          value={task.duracion}
          onSave={(newValue) => onUpdateTaskValue(task.id, 'duracion', newValue)}
          icon={<Hourglass className="h-4 w-4 text-muted-foreground" />}
          title="Duración"
        />
      </TableCell>
      <TableCell className="text-center">
        <div className="flex flex-col items-center justify-center">
           <p className="text-xl font-bold">
            {isFinite(task.indice) ? task.indice.toFixed(2) : "∞"}
          </p>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleScheduleOnCalendar}
              aria-label={`Programar tarea ${task.tarea} en Google Calendar`}
              className="h-8"
            >
              <CalendarPlus className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  aria-label={`Eliminar tarea ${task.tarea}`}
                  className="h-8 w-8"
                  title="Eliminar tarea"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[340px] rounded-lg">
                <AlertDialogHeader className="text-center items-center">
                  <AlertDialogTitle>¿Eliminar esta tarea?</AlertDialogTitle>
                  <AlertDialogDescription className="text-center px-4">
                    La tarea "{task.tarea}" será eliminada permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col-reverse space-y-2 space-y-reverse w-full">
                  <AlertDialogAction onClick={handleDelete} className={cn("w-full bg-destructive text-destructive-foreground hover:bg-destructive/90")}>
                    Sí, eliminar
                  </AlertDialogAction>
                  <AlertDialogCancel className="w-full">Cancelar</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}
