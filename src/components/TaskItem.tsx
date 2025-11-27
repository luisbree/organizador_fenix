
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
import type { LanguageStrings } from '@/lib/translations';

// A simple, inline SVG for the Phoenix icon
const PhoenixIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("h-3.5 w-3.5", className)}
  >
    <path d="M12 2a5 5 0 0 0-5 5c0 2.5-1.5 4.5-4 5.5 2.5 1 4 3 4 5.5a5 5 0 0 0 10 0c0-2.5 1.5-4.5 4-5.5-2.5-1-4-3-4-5.5a5 5 0 0 0-5-5z" />
    <path d="M6 16c0 2 1 4 4 4s4-2 4-4" />
  </svg>
);


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
  t: LanguageStrings;
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
    agingFactor,
    t
}: TaskItemProps) {

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteTask(task.id);
  };

  const handleScheduleOnCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const taskTitle = encodeURIComponent(task.tarea);
    const taskDetails = encodeURIComponent(
      `${t.urgency}: ${task.urgencia}\n${t.necessity}: ${task.necesidad}\n${t.cost}: ${task.costo}\n${t.duration}: ${task.duracion}`
    );
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${taskTitle}&details=${taskDetails}`;
    
    window.open(calendarUrl, '_blank', 'noopener,noreferrer');
  };
  
  const createdDate = task.createdAt && 'toDate' in task.createdAt ? task.createdAt.toDate() : new Date(task.createdAt);

  const dynamicIndex = calculateDynamicIndex(task, agingFactor);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete(task.id);
  };
  
  const handleClockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.completado) return;
    onToggleScheduled(task.id, task.scheduledAt);
  };
  
  const formattedCreationDate = createdDate.toLocaleDateString(t.locale, { month: 'short', day: 'numeric' });

  return (
    <div className={cn("flex items-center w-full p-1.5 min-w-[600px]", task.completado && "opacity-70")}>
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
            aria-label={t.reactivateTaskAriaLabel(task.tarea)}
          />
        ) : (
          <Dialog>
            <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Checkbox
                id={`complete-${task.id}`}
                checked={task.completado}
                aria-label={t.completeTaskAriaLabel(task.tarea)}
              />
            </DialogTrigger>
            <DialogContent className="max-w-[340px] rounded-lg" style={{backgroundColor: '#fdfdfd'}}>
               <DialogHeader>
                  <DialogTitle className="sr-only">{t.confirmCompletionTitle}</DialogTitle>
              </DialogHeader>
              <DialogFooter className="sm:justify-center">
                <Button onClick={(e) => { e.stopPropagation(); handleToggle(e);}} className={cn("w-full sm:w-auto")}>
                  {t.confirm}
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
              {task.isFenix && (
                  <div title={t.fenixTaskTooltip(task.fenixPeriod || 0)}>
                      <PhoenixIcon className="h-3.5 w-3.5 flex-shrink-0 text-amber-600" />
                  </div>
              )}
              <div onClick={handleClockClick} className={cn("cursor-pointer p-1", task.completado && "cursor-not-allowed")} title={t.toggleScheduledTooltip}>
                  <Clock
                      className={cn(
                          "h-3.5 w-3.5 flex-shrink-0 transition-colors",
                          task.scheduledAt ? 'text-muted-foreground' : 'text-muted-foreground/30',
                          task.completado && "text-muted-foreground/20"
                      )}
                  />
              </div>
              <p className={cn("text-base font-bold tabular-nums", task.completado && "text-muted-foreground/60")}>
                {isFinite(dynamicIndex) ? dynamicIndex.toFixed(2) : "∞"}
              </p>
           </div>
      </div>
      
      <div className="w-[50px] text-center flex-shrink-0">
        <EditableNumericCell
          value={task.urgencia}
          onSave={(newValue) => onUpdateTaskValue(task.id, 'urgencia', newValue)}
          t={t}
          disabled={task.completado}
        />
      </div>
      <div className="w-[50px] text-center flex-shrink-0">
        <EditableNumericCell
          value={task.necesidad}
          onSave={(newValue) => onUpdateTaskValue(task.id, 'necesidad', newValue)}
          t={t}
          disabled={task.completado}
        />
      </div>
      <div className="w-[50px] text-center flex-shrink-0">
        <EditableNumericCell
          value={task.costo}
          onSave={(newValue) => onUpdateTaskValue(task.id, 'costo', newValue)}
          t={t}
          disabled={task.completado}
        />
      </div>
      <div className="w-[50px] text-center flex-shrink-0">
        <EditableNumericCell
          value={task.duracion}
          onSave={(newValue) => onUpdateTaskValue(task.id, 'duracion', newValue)}
          t={t}
          disabled={task.completado}
        />
      </div>
      <div className="w-[80px] flex-shrink-0 text-right">
        <div className="flex items-center justify-end space-x-1 sm:space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleScheduleOnCalendar}
              aria-label={t.scheduleTaskAriaLabel(task.tarea)}
              className="h-6 w-6 p-0"
              disabled={task.completado}
            >
              <CalendarPlus className="h-3.5 w-3.5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="destructive"
                  size="icon"
                  aria-label={t.deleteTaskAriaLabel(task.tarea)}
                  className="h-6 w-6"
                  title={t.deleteTaskTooltip}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[340px] rounded-lg">
                <AlertDialogHeader className="text-center items-center">
                  <AlertDialogTitle>{t.confirmDeleteTaskTitle}</AlertDialogTitle>
                  <AlertDialogDescription className="text-center px-4">
                    {t.confirmDeleteTaskDescription(task.tarea)}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col-reverse space-y-2 space-y-reverse w-full sm:flex-row sm:space-y-0 sm:justify-center sm:space-x-2 pt-2">
                   <AlertDialogCancel className="w-full sm:w-auto">{t.cancel}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className={cn("w-full sm:w-auto")}>
                    {t.confirmDelete}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>
    </div>
  );
}
