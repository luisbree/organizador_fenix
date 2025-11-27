
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
import type { LanguageStrings } from '@/lib/translations';

interface SubTaskItemProps {
  subtask: SubTask;
  onToggleComplete: () => void;
  onDelete: () => void;
  onToggleScheduled: () => void;
  t: LanguageStrings;
}

export function SubTaskItem({ subtask, onToggleComplete, onDelete, onToggleScheduled, t }: SubTaskItemProps) {

  const handleScheduleOnCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const taskTitle = encodeURIComponent(subtask.tarea);
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${taskTitle}`;
    window.open(calendarUrl, '_blank', 'noopener,noreferrer');
    // We no longer automatically mark as scheduled. The user does it by clicking the clock.
  };
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete();
  };
  
  const handleClockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (subtask.completado) return;
    onToggleScheduled();
  };

  return (
    <div className={cn(
        "flex items-center w-full p-1.5 rounded-md hover:bg-muted/50 min-w-[600px]",
        subtask.completado && "opacity-70"
    )}>
        <div className="w-[40px] flex-shrink-0 flex items-center justify-center">
            <Dialog>
                <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Checkbox
                    id={`complete-subtask-${subtask.id}`}
                    checked={subtask.completado}
                    aria-label={t.completeSubtaskAriaLabel(subtask.tarea)}
                />
                </DialogTrigger>
                {!subtask.completado && (
                    <DialogContent className="max-w-[340px] rounded-lg" style={{backgroundColor: '#fdfdfd'}}>
                        <DialogHeader>
                            <DialogTitle className="sr-only">{t.confirmCompletionTitle}</DialogTitle>
                        </DialogHeader>
                        <DialogFooter className="sm:justify-center">
                            <Button onClick={handleToggle} className={cn("w-full sm:w-auto")}>
                            {t.confirm}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>
        </div>

        <div className="flex-grow min-w-0">
            <div className={cn("font-medium whitespace-nowrap text-sm", subtask.completado && "line-through text-muted-foreground")}>
                {subtask.tarea}
            </div>
        </div>

        <div className="w-[80px] flex-shrink-0 text-right">
            <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                <div onClick={handleClockClick} className={cn("cursor-pointer p-1", subtask.completado && "cursor-not-allowed")} title={t.toggleScheduledTooltip}>
                  <Clock
                    className={cn(
                      "h-3.5 w-3.5 flex-shrink-0 transition-colors",
                      subtask.scheduledAt ? 'text-muted-foreground' : 'text-muted-foreground/30',
                      subtask.completado && "text-muted-foreground/20"
                    )}
                  />
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleScheduleOnCalendar}
                    aria-label={t.scheduleSubtaskAriaLabel(subtask.tarea)}
                    className="h-6 w-6 p-0"
                    disabled={subtask.completado}
                >
                    <CalendarPlus className="h-3.5 w-3.5" />
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                            variant="destructive"
                            size="icon"
                            aria-label={t.deleteSubtaskAriaLabel(subtask.tarea)}
                            className="h-6 w-6"
                            title={t.deleteSubtaskTooltip}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-[340px] rounded-lg">
                        <AlertDialogHeader className="text-center items-center">
                            <AlertDialogTitle>{t.confirmDeleteSubtaskTitle}</AlertDialogTitle>
                            <AlertDialogDescription className="text-center px-4">
                                {t.confirmDeleteSubtaskDescription(subtask.tarea)}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col-reverse space-y-2 space-y-reverse w-full sm:flex-row sm:space-y-0 sm:justify-center sm:space-x-2 pt-2">
                            <AlertDialogCancel className="w-full sm:w-auto">{t.cancel}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete()} className={cn("w-full sm:w-auto")}>
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
