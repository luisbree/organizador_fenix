
"use client";

import type * as React from 'react';
import type { Task, SubTask } from '@/types/task';
import { TaskItem } from './TaskItem';
import { ListChecks, ChevronDown } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { SubTaskItem } from './SubTaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onMarkSchedulingAttempted: (id: string) => void;
  onUpdateTaskValue: (
    taskId: string,
    field: keyof Pick<Task, 'urgencia' | 'necesidad' | 'costo' | 'duracion'>,
    newValue: number
  ) => void;
  onSelectTask: (taskId: string | null) => void;
  selectedTaskId: string | null;
  onToggleSubTaskComplete: (subTaskId: string, parentId: string) => void;
  onDeleteSubTask: (subTaskId: string, parentId: string) => void;
  onMarkSubTaskSchedulingAttempted: (subTaskId: string, parentId: string) => void;
}

const calculateDynamicIndex = (task: Task): number => {
    if (!task.createdAt) return task.indice;
    const createdDate = task.createdAt && 'toDate' in task.createdAt ? task.createdAt.toDate() : new Date(task.createdAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    createdDate.setHours(0, 0, 0, 0);
    
    const timeDiff = today.getTime() - createdDate.getTime();
    const daysOld = Math.max(0, Math.floor(timeDiff / (1000 * 3600 * 24)));

    let agingFactor = 0;
    if (daysOld >= 1) {
        agingFactor = ((task.urgencia + task.necesidad) / 10) * Math.log(daysOld + 1);
    }

    if(isNaN(agingFactor)) agingFactor = 0;

    return task.indice + agingFactor;
};

const calculateAgingFactor = (task: Task): number => {
    if (!task.createdAt) return 0;
    const createdDate = task.createdAt && 'toDate' in task.createdAt ? task.createdAt.toDate() : new Date(task.createdAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    createdDate.setHours(0, 0, 0, 0);

    const timeDiff = today.getTime() - createdDate.getTime();
    const daysOld = Math.max(0, Math.floor(timeDiff / (1000 * 3600 * 24)));

    if (daysOld < 1) {
        return 0;
    }

    const factor = ((task.urgencia + task.necesidad) / 10) * Math.log(daysOld + 1);
    
    return isNaN(factor) ? 0 : factor;
}

const getAgingColorStyle = (agingFactor: number): React.CSSProperties => {
  if (agingFactor <= 0) {
    return { backgroundColor: `hsla(121, 63%, 58%, 0.5)` };
  }

  const maxFactorForColor = 2.5;
  const normalizedFactor = Math.min(agingFactor / maxFactorForColor, 1.0);

  const hue = 120 - (normalizedFactor * 120);
  const saturation = 70 + (normalizedFactor * 30); 
  const lightness = 60 - (normalizedFactor * 10); 
  const alpha = 0.5 + (normalizedFactor * 0.2); 

  return { backgroundColor: `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})` };
};


export function TaskList({ 
    tasks, 
    onToggleComplete, 
    onDeleteTask, 
    onMarkSchedulingAttempted, 
    onUpdateTaskValue,
    onSelectTask,
    selectedTaskId,
    onToggleSubTaskComplete,
    onDeleteSubTask,
    onMarkSubTaskSchedulingAttempted,
}: TaskListProps) {
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completado && !b.completado) return 1;
    if (!a.completado && b.completado) return -1;

    const aIndex = calculateDynamicIndex(a);
    const bIndex = calculateDynamicIndex(b);

    if (aIndex === Infinity && bIndex !== Infinity) return -1;
    if (bIndex === Infinity && aIndex !== Infinity) return 1;
    if (aIndex === Infinity && bIndex === Infinity) {
      const aDate = a.createdAt && 'toDate' in a.createdAt ? a.createdAt.toDate() : new Date(a.createdAt);
      const bDate = b.createdAt && 'toDate' in b.createdAt ? b.createdAt.toDate() : new Date(b.createdAt);
      return bDate.getTime() - aDate.getTime();
    }
    
    if (isNaN(aIndex) && !isNaN(bIndex)) return 1;
    if (!isNaN(aIndex) && isNaN(bIndex)) return -1;
    if (isNaN(aIndex) && isNaN(bIndex)) {
      const aDate = a.createdAt && 'toDate' in a.createdAt ? a.createdAt.toDate() : new Date(a.createdAt);
      const bDate = b.createdAt && 'toDate' in b.createdAt ? b.createdAt.toDate() : new Date(b.createdAt);
      return bDate.getTime() - aDate.getTime();
    }
    
    if (bIndex !== aIndex) {
      return bIndex - aIndex; 
    }

    const aDate = a.createdAt && 'toDate' in a.createdAt ? a.createdAt.toDate() : new Date(a.createdAt);
    const bDate = b.createdAt && 'toDate' in b.createdAt ? b.createdAt.toDate() : new Date(b.createdAt);
    return bDate.getTime() - aDate.getTime();
  });
  
  const sortedSubtasks = (subtasks: SubTask[] = []) => {
    return [...subtasks].sort((a, b) => {
        if (a.completado && !b.completado) return 1;
        if (!a.completado && b.completado) return -1;
        const aDate = a.createdAt && 'toDate' in a.createdAt ? a.createdAt.toDate() : new Date(a.createdAt);
        const bDate = b.createdAt && 'toDate' in b.createdAt ? b.createdAt.toDate() : new Date(b.createdAt);
        return aDate.getTime() - bDate.getTime();
    });
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed rounded-xl bg-card">
        <ListChecks className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-xl text-foreground font-semibold">No hay tareas pendientes.</p>
        <p className="text-md text-muted-foreground">¡Añade una nueva tarea para empezar!</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Accordion type="multiple" className="w-full space-y-2">
        {sortedTasks.map((task) => {
          const agingFactor = calculateAgingFactor(task);
          const agingColorStyle = getAgingColorStyle(agingFactor);
          const hasSubtasks = task.subtasks && task.subtasks.length > 0;

          return (
            <AccordionItem 
              value={task.id} 
              key={task.id} 
              className={cn(
                "border rounded-lg overflow-hidden transition-all duration-300",
                selectedTaskId === task.id ? 'border-primary shadow-lg' : 'border-border',
                task.completado ? "bg-muted/50 opacity-60" : ""
              )}
              style={task.completado ? {} : agingColorStyle}
            >
              <div className="flex items-center w-full relative">
                <div onClick={() => onSelectTask(task.id)} className="flex-grow cursor-pointer">
                    <TaskItem
                        task={task}
                        onToggleComplete={onToggleComplete}
                        onDeleteTask={onDeleteTask}
                        onMarkSchedulingAttempted={onMarkSchedulingAttempted}
                        onUpdateTaskValue={onUpdateTaskValue}
                        agingFactor={agingFactor}
                    />
                </div>
                <AccordionTrigger 
                    className={cn(
                        "p-0 hover:no-underline w-[40px] flex-shrink-0 flex justify-center items-center",
                        "[&[data-state=open]>.chevron]:rotate-180"
                    )}
                    disabled={!hasSubtasks}
                    onClick={(e) => e.stopPropagation()}
                >
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 chevron" />
                </AccordionTrigger>
              </div>
              {hasSubtasks && (
                <AccordionContent className="bg-transparent">
                  <div className="flex flex-col gap-1 px-2 py-2">
                    {sortedSubtasks(task.subtasks).map(subtask => (
                      <SubTaskItem
                        key={subtask.id}
                        subtask={subtask}
                        onToggleComplete={() => onToggleSubTaskComplete(subtask.id, task.id)}
                        onDelete={() => onDeleteSubTask(subtask.id, task.id)}
                        onSchedule={() => onMarkSubTaskSchedulingAttempted(subtask.id, task.id)}
                      />
                    ))}
                  </div>
                </AccordionContent>
              )}
            </AccordionItem>
          );
        })}
      </Accordion>
    </TooltipProvider>
  );
}
