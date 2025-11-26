
"use client";

import type * as React from 'react';
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, CalendarPlus } from 'lucide-react';
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
  
  const createdDate = task.createdAt && 'toDate' in task.createdAt ? task.createdAt.toDate() : new Date(task.createdAt);

  const calculateDynamicIndex = (task: Task): number => {
    const createdDate = task.createdAt && 'toDate' in task.createdAt ? task.createdAt.toDate() : new Date(task.createdAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    createdDate.setHours(0, 0, 0, 0);

    const timeDiff = today.getTime() - createdDate.getTime();
    const daysOld = Math.floor(timeDiff / (1000 * 3600 * 24));

    let agingFactor = 0;
    if (daysOld >= 1) {
        agingFactor = (task.urgencia + task.necesidad) / (10 * daysOld);
    }
    
    if(isNaN(agingFactor)) agingFactor = 0;

    return task.indice + agingFactor;
  };

  const dynamicIndex = calculateDynamicIndex(task);

  return (
    <TableRow className={cn(
        task.completado && "bg-muted/50 opacity-60",
        task.isSchedulingAttempted && !task.completado && "bg-accent/[.08]"
    )}>
      <TableCell className="w-[1%]">
        <Checkbox
            id={`complete-${task.id}`}
            checked={task.completado}
            onCheckedChange={handleCheckboxChange}
            aria-label={`Marcar ${task.tarea} como completada`}
        />
      </TableCell>
      <TableCell className="max-w-[150px] sm:max-w-xs whitespace-nowrap overflow-hidden text-ellipsis">
         <div className="flex items-center gap-3">
          <div className="flex-grow min-w-0">
            <div className={cn("font-medium truncate", task.completado && "line-through text-muted-foreground")} title={task.tarea}>
              {task.tarea}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {createdDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric'})}, {createdDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit'})}
            </div>
          </div>
          <p className="text-lg font-bold tabular-nums pl-2">
            {isFinite(dynamicIndex) ? dynamicIndex.toFixed(2) : "∞"}
          </p>
        </div>
      </TableCell>
      
      <TableCell className="text-center">
        <EditableNumericCell
          value={task.urgencia}
          onSave={(newValue) => onUpdateTaskValue(task.id, 'urgencia', newValue)}
        />
      </TableCell>
      <TableCell className="text-center">
        <EditableNumericCell
          value={task.necesidad}
          onSave={(newValue) => onUpdateTaskValue(task.id, 'necesidad', newValue)}
        />
      </TableCell>
      <TableCell className="text-center">
        <EditableNumericCell
          value={task.costo}
          onSave={(newValue) => onUpdateTaskValue(task.id, 'costo', newValue)}
        />
      </TableCell>
      <TableCell className="text-center">
        <EditableNumericCell
          value={task.duracion}
          onSave={(newValue) => onUpdateTaskValue(task.id, 'duracion', newValue)}
        />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end space-x-1 sm:space-x-2">
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
                <AlertDialogFooter className="flex-col-reverse space-y-2 space-y-reverse w-full sm:flex-row sm:space-y-0">
                   <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className={cn("w-full sm:w-auto")}>
                    Sí, eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}
