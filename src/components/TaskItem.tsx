
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

const getAgingFactor = (task: Task): number => {
    const createdDate = task.createdAt && 'toDate' in task.createdAt ? task.createdAt.toDate() : new Date(task.createdAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    createdDate.setHours(0, 0, 0, 0);

    const timeDiff = today.getTime() - createdDate.getTime();
    const daysOld = Math.floor(timeDiff / (1000 * 3600 * 24));

    if (daysOld < 1) {
        return 0; // No aging factor for tasks less than a day old
    }
    
    let factor = (task.urgencia + task.necesidad) / (10 * daysOld);
    
    return isNaN(factor) ? 0 : factor;
}

const getAgingColorStyle = (agingFactor: number): React.CSSProperties => {
  if (agingFactor <= 0) return {};

  // Apply a non-linear (logarithmic) scale to the factor
  // This makes the color change slower at the beginning and faster towards the end.
  // The '+1' prevents log(0), and we adjust the divisor to keep the scale in a reasonable range.
  const scaledFactor = Math.log(agingFactor + 1) / Math.log(1.5); // Using log base 1.5 for a gentle curve
  
  // Normalize the factor, capping it at 1 for the color scale
  const normalizedFactor = Math.min(scaledFactor, 1.0);

  const colors = [
    { h: 120, s: 60, l: 58 }, // #5cd65c (Green)
    { h: 56, s: 98, l: 70 }, // #fdf068 (Yellow)
    { h: 30, s: 100, l: 60 }, // #ff9933 (Orange)
    { h: 0, s: 96, l: 50 },   // #fa0505 (Red)
  ];

  const numSegments = colors.length - 1;
  const segmentIndex = Math.min(Math.floor(normalizedFactor * numSegments), numSegments - 1);
  const segmentStart = segmentIndex / numSegments;
  
  const segmentFactor = (normalizedFactor - segmentStart) * numSegments;

  const startColor = colors[segmentIndex];
  const endColor = colors[segmentIndex + 1];

  const h = startColor.h + (endColor.h - startColor.h) * segmentFactor;
  const s = startColor.s + (endColor.s - startColor.s) * segmentFactor;
  const l = startColor.l + (endColor.l - startColor.l) * segmentFactor;

  // Apply a consistent light transparency
  return { backgroundColor: `hsla(${h}, ${s}%, ${l}%, 0.6)` };
};


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

    let agingFactorValue = 0;
    if (daysOld >= 1) {
        agingFactorValue = (task.urgencia + task.necesidad) / (10 * daysOld);
    }
    
    if(isNaN(agingFactorValue)) agingFactorValue = 0;

    return task.indice + agingFactorValue;
  };

  const agingFactor = getAgingFactor(task);
  const dynamicIndex = task.indice + agingFactor;
  const agingColorStyle = getAgingColorStyle(agingFactor);


  return (
    <TableRow 
      style={task.completado ? {} : agingColorStyle}
      className={cn(
        task.completado && "bg-muted/50 opacity-60",
        "transition-colors duration-500"
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
         <div className="flex items-center gap-2">
          <div className="flex-grow min-w-0">
            <div className={cn("font-medium truncate", task.completado && "line-through text-muted-foreground")} title={task.tarea}>
              {task.tarea}
            </div>
            <div className="text-xs text-muted-foreground truncate">
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

