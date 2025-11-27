
"use client";

import type * as React from 'react';
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, CalendarPlus, Clock, ChevronDown } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleScheduled: (id: string, currentScheduledAt: any) => void;
  onUpdateTaskValue: (
    taskId: string,
    field: keyof Pick<Task, 'urgencia' | 'necesidad' | 'costo' | 'duracion'>,
    newValue: number
  ) => void;
  agingFactor: number;
}

const calculateDynamicIndex = (task: Task, agingFactor: number): number => {
    return task.indice + agingFactor;
};

export function TaskItem({ 
    task, 
    onToggleComplete, 
    onDeleteTask, 
    onToggleScheduled, 
    onUpdateTaskValue,
    agingFactor
}: TaskItemProps) {

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteTask(task.id);
  };

  const handleScheduleOnCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const taskTitle = encodeURIComponent(task.tarea);
    const taskDetails = encodeURIComponent(
      `Urgencia: ${task.urgencia}\nNecesidad: ${task.necesidad}\nCosto: ${task.costo}\nDuración: ${task.duracion}`
    );
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${taskTitle}&details=${taskDetails}`;
    
    window.open(calendarUrl, '_blank', 'noopener,noreferrer');
    // We no longer automatically mark as scheduled. The user does it by clicking the clock.
  };
  
  const createdDate = task.createdAt && 'toDate' in task.createdAt ? task.createdAt.toDate() : new Date(task.createdAt);

  const dynamicIndex = calculateDynamicIndex(task, agingFactor);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete(task.id);
  };
  
  const handleClockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleScheduled(task.id, task.scheduledAt);
  };
  
  const formattedCreationDate = createdDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex items-center w-full p-1.5 min-w-[600px]">
      <div className="w-[40px] flex-shrink-0 flex items-center justify-center">
        {task.completado ? (
          <Checkbox
            id={`complete-${task.id}`}
            checked={task.completado}
            onCheckedChange={(e) => {
                const dummyEvent = { stopPropagation: () => {} };
                handleToggle(dummyEvent as any);
            }}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Reactivar ${task.tarea}`}
          />
        ) : (
          <Dialog>
            <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Checkbox
                id={`complete-${task.id}`}
                checked={task.completado}
                aria-label={`Marcar ${task.tarea} como completada`}
              />
            </DialogTrigger>
            <DialogContent className="max-w-[340px] rounded-lg" style={{backgroundColor: '#fdfdfd'}}>
               <DialogHeader>
                  <DialogTitle className="sr-only">Confirmar Tarea Completada</DialogTitle>
              </DialogHeader>
              <DialogFooter className="sm:justify-center">
                <Button onClick={(e) => { e.stopPropagation(); handleToggle(e);}} className={cn("w-full sm:w-auto")}>
                  Confirmar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="flex-grow min-w-0 grid grid-cols-[1fr_auto] items-center gap-2 pr-2">
         <div className="flex-grow min-w-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn("font-bold whitespace-nowrap text-sm", task.completado && "line-through text-muted-foreground")}>
                  {task.tarea}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                 <p>{formattedCreationDate} ({agingFactor.toFixed(2)})</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
              <p className="text-base font-bold tabular-nums pl-1">
                {isFinite(dynamicIndex) ? dynamicIndex.toFixed(2) : "∞"}
              </p>
           </div>
      </div>
      
      <div className="w-[50px] text-center flex-shrink-0">
        <EditableNumericCell
          value={task.urgencia}
          onSave={(newValue) => onUpdateTaskValue(task.id, 'urgencia', newValue)}
        />
      </div>
      <div className="w-[50px] text-center flex-shrink-0">
        <EditableNumericCell
          value={task.necesidad}
          onSave={(newValue) => onUpdateTaskValue(task.id, 'necesidad', newValue)}
        />
      </div>
      <div className="w-[50px] text-center flex-shrink-0">
        <EditableNumericCell
          value={task.costo}
          onSave={(newValue) => onUpdateTaskValue(task.id, 'costo', newValue)}
        />
      </div>
      <div className="w-[50px] text-center flex-shrink-0">
        <EditableNumericCell
          value={task.duracion}
          onSave={(newValue) => onUpdateTaskValue(task.id, 'duracion', newValue)}
        />
      </div>
      <div className="w-[80px] flex-shrink-0 text-right">
        <div className="flex items-center justify-end space-x-1 sm:space-x-2">
            <div onClick={handleClockClick} className="cursor-pointer p-1" title="Marcar como agendado">
                <Clock
                    className={cn(
                        "h-3.5 w-3.5 flex-shrink-0 transition-colors",
                        task.scheduledAt ? 'text-muted-foreground' : 'text-muted-foreground/30'
                    )}
                />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleScheduleOnCalendar}
              aria-label={`Programar tarea ${task.tarea} en Google Calendar`}
              className="h-6 w-6 p-0"
            >
              <CalendarPlus className="h-3.5 w-3.5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="destructive"
                  size="icon"
                  aria-label={`Eliminar tarea ${task.tarea}`}
                  className="h-6 w-6"
                  title="Eliminar tarea"
                >
                  <Trash2 className="h-3.5 w-3.5" />
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
      </div>
    </div>
  );
}

    