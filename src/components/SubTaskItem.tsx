
"use client";

import * as React from 'react';
import type { SubTask } from '@/types/task';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, CalendarPlus, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
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

interface SubTaskItemProps {
  subtask: SubTask;
  onToggleComplete: () => void;
  onDelete: () => void;
  onSchedule: () => void;
}

export function SubTaskItem({ subtask, onToggleComplete, onDelete, onSchedule }: SubTaskItemProps) {

  const handleScheduleOnCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const taskTitle = encodeURIComponent(subtask.tarea);
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${taskTitle}`;
    window.open(calendarUrl, '_blank', 'noopener,noreferrer');
    onSchedule();
  };
  
  const createdDate = subtask.createdAt && 'toDate' in subtask.createdAt ? subtask.createdAt.toDate() : new Date(subtask.createdAt);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete();
  };

  return (
    <div className={cn(
        "flex items-center w-full p-1.5 rounded-md hover:bg-muted/50",
        subtask.completado && "opacity-50"
    )}>
        <div className="w-[40px] flex-shrink-0 flex items-center justify-center">
            <Dialog>
                <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Checkbox
                    id={`complete-subtask-${subtask.id}`}
                    checked={subtask.completado}
                    aria-label={`Marcar ${subtask.tarea} como completada`}
                />
                </DialogTrigger>
                {!subtask.completado && (
                    <DialogContent className="max-w-[340px] rounded-lg" style={{backgroundColor: '#fdfdfd'}}>
                        <DialogHeader>
                            <DialogTitle className="sr-only">Confirmar Tarea Completada</DialogTitle>
                        </DialogHeader>
                        <DialogFooter className="sm:justify-center">
                            <Button onClick={handleToggle} className={cn("w-full sm:w-auto")}>
                            Confirmar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>
        </div>

        <div className="flex-grow min-w-0">
            <div className={cn("font-medium", subtask.completado && "line-through text-muted-foreground")}>
                {subtask.tarea}
            </div>
        </div>

        <div className="w-[80px] flex-shrink-0 text-right">
            <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                {subtask.scheduledAt && (
                    <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" title="Se intentó programar en calendario" />
                )}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleScheduleOnCalendar}
                    aria-label={`Programar subtarea ${subtask.tarea} en Google Calendar`}
                    className="h-7 w-7 p-0"
                >
                    <CalendarPlus className="h-4 w-4" />
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                            variant="destructive"
                            size="icon"
                            aria-label={`Eliminar subtarea ${subtask.tarea}`}
                            className="h-7 w-7"
                            title="Eliminar subtarea"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-[340px] rounded-lg">
                        <AlertDialogHeader className="text-center items-center">
                            <AlertDialogTitle>¿Eliminar esta subtarea?</AlertDialogTitle>
                            <AlertDialogDescription className="text-center px-4">
                                La subtarea "{subtask.tarea}" será eliminada permanentemente.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col-reverse space-y-2 space-y-reverse w-full sm:flex-row sm:space-y-0 sm:justify-center sm:space-x-2 pt-2">
                            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete()} className={cn("w-full sm:w-auto")}>
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
