
"use client";

import type * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import { Separator } from './ui/separator';

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
    <Card className={cn(
      "w-full transition-all shadow-md",
      task.completado && "opacity-60 bg-muted/50",
      task.isSchedulingAttempted && !task.completado && "bg-accent/[.08]"
    )}>
      <CardContent className="p-3">
        <div className="flex flex-col space-y-3">
          {/* Top section: Checkbox and Task Description */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id={`complete-${task.id}`}
              checked={task.completado}
              onCheckedChange={handleCheckboxChange}
              aria-label={`Marcar ${task.tarea} como completada`}
              className="h-5 w-5 mt-1"
            />
            <div className="flex-1">
              <p className={cn("font-medium break-words", task.completado && "line-through text-muted-foreground")}>
                {task.tarea}
              </p>
              <p className="text-xs text-muted-foreground">
                Creado: {new Date(task.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <Separator />
          
          {/* Middle section: Stats grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="col-span-2 grid grid-cols-2 gap-2 rounded-md bg-muted/50 p-2">
                <EditableNumericCell
                    value={task.urgencia}
                    onSave={(newValue) => onUpdateTaskValue(task.id, 'urgencia', newValue)}
                    icon={<Flame className="h-4 w-4 text-destructive shrink-0" />}
                    title="Urgencia"
                    className="flex-col"
                    inputClassName="w-14"
                />
                <EditableNumericCell
                    value={task.necesidad}
                    onSave={(newValue) => onUpdateTaskValue(task.id, 'necesidad', newValue)}
                    icon={<ShieldCheck className="h-4 w-4 text-primary shrink-0" />}
                    title="Necesidad"
                    className="flex-col"
                    inputClassName="w-14"
                />
                <EditableNumericCell
                    value={task.costo}
                    onSave={(newValue) => onUpdateTaskValue(task.id, 'costo', newValue)}
                    icon={<CircleDollarSign className="h-4 w-4 text-accent shrink-0" />}
                    title="Costo"
                    className="flex-col"
                    inputClassName="w-14"
                />
                <EditableNumericCell
                    value={task.duracion}
                    onSave={(newValue) => onUpdateTaskValue(task.id, 'duracion', newValue)}
                    icon={<Hourglass className="h-4 w-4 text-muted-foreground shrink-0" />}
                    title="Duración"
                    className="flex-col"
                    inputClassName="w-14"
                />
            </div>
            <div className="flex flex-col items-center justify-center rounded-md bg-primary/10 p-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                <p className="text-sm font-semibold text-primary mt-1">Índice</p>
                <p className="text-2xl font-bold text-foreground">
                    {isFinite(task.indice) ? task.indice.toFixed(2) : "∞"}
                </p>
            </div>
          </div>

          <Separator />

          {/* Bottom section: Actions */}
          <div className="flex items-center justify-end space-x-2">
             <Button
                variant="outline"
                size="sm"
                onClick={handleScheduleOnCalendar}
                aria-label={`Programar tarea ${task.tarea} en Google Calendar`}
                className="h-8"
              >
                <CalendarPlus className="h-4 w-4 mr-1.5" />
                Programar
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
        </div>
      </CardContent>
    </Card>
  );
}
