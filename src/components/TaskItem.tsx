
"use client";

import type * as React from 'react';
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, CalendarPlus, Clock } from 'lucide-react';
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
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';


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

const calculateAgingFactor = (task: Task): number => {
    if (!task.createdAt) return 0;
    const createdDate = task.createdAt && 'toDate' in task.createdAt ? task.createdAt.toDate() : new Date(task.createdAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    createdDate.setHours(0, 0, 0, 0);

    const timeDiff = today.getTime() - createdDate.getTime();
    const daysOld = Math.max(0, Math.floor(timeDiff / (1000 * 3600 * 24)));

    if (daysOld < 1) {
        return 0; // No aging factor for tasks less than a day old
    }

    // Use a logarithmic scale for a more gradual and cumulative-feeling aging effect.
    // The (urgencia + necesidad) / 10 term weights the aging based on importance.
    const factor = ((task.urgencia + task.necesidad) / 10) * Math.log(daysOld + 1);
    
    return isNaN(factor) ? 0 : factor;
}

const getAgingColorStyle = (agingFactor: number): React.CSSProperties => {
  if (agingFactor <= 0) {
     // #5cd65c in hsla with alpha
    return { backgroundColor: `hsla(121, 63%, 58%, 0.5)` };
  }

  // Normalize the factor. Let's establish a "max" factor for color scaling, e.g., what we consider "fully red".
  // A factor of around 2.5 (e.g. U+N=10 at ~11 days old) could be our cap for the gradient.
  const maxFactorForColor = 2.5;
  const normalizedFactor = Math.min(agingFactor / maxFactorForColor, 1.0);

  // Linear interpolation between Green -> Yellow -> Red
  // Green (hue 120), Yellow (hue 60), Red (hue 0)
  const hue = 120 - (normalizedFactor * 120);
  const saturation = 70 + (normalizedFactor * 30); // Go from 70% to 100% saturation
  const lightness = 60 - (normalizedFactor * 10); // Slightly darken as it gets redder
  const alpha = 0.5 + (normalizedFactor * 0.2); // Increase opacity from 0.5 to 0.7

  return { backgroundColor: `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})` };
};


export function TaskItem({ task, onToggleComplete, onDeleteTask, onMarkSchedulingAttempted, onUpdateTaskValue }: TaskItemProps) {

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
    const agingFactorValue = calculateAgingFactor(task);
    return task.indice + agingFactorValue;
  };

  const dynamicIndex = calculateDynamicIndex(task);
  const agingFactor = calculateAgingFactor(task);
  const agingColorStyle = getAgingColorStyle(agingFactor);


  const handleToggle = () => {
    onToggleComplete(task.id);
  };

  return (
    <TableRow 
      style={task.completado ? {} : agingColorStyle}
      className={cn(
        task.completado && "bg-muted/50 opacity-60",
        "transition-colors duration-500"
    )}>
      <TableCell className="w-[1%]">
        {task.completado ? (
          <Checkbox
            id={`complete-${task.id}`}
            checked={task.completado}
            onCheckedChange={handleToggle}
            aria-label={`Reactivar ${task.tarea}`}
          />
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Checkbox
                id={`complete-${task.id}`}
                checked={task.completado}
                // We prevent the default onCheckedChange and use the trigger
                aria-label={`Marcar ${task.tarea} como completada`}
              />
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[340px] rounded-lg">
              <AlertDialogFooter className="sm:justify-center">
                <AlertDialogAction onClick={handleToggle} className={cn("w-full sm:w-auto")}>
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </TableCell>
      <TableCell className="min-w-[200px] whitespace-normal">
         <div className="flex items-center gap-2">
          <div className="flex-grow min-w-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn("font-medium", task.completado && "line-through text-muted-foreground")}>
                  {task.tarea}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">{task.tarea}</p>
                <p className="text-sm text-muted-foreground">
                  Factor de envejecimiento: {agingFactor.toFixed(2)}
                </p>
              </TooltipContent>
            </Tooltip>
            <div className="text-xs text-muted-foreground">
              {createdDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric'})}, {createdDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit'})}
            </div>
          </div>
          {task.isSchedulingAttempted && <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
          <p className="text-lg font-bold tabular-nums pl-1">
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
                <AlertDialogFooter className="flex-col-reverse space-y-2 space-y-reverse w-full sm:flex-row sm:space-y-0 sm:justify-center sm:space-x-2 pt-2">
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
