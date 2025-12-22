
"use client";

import type * as React from 'react';
import type { Task, SubTask } from '@/types/task';
import { TaskItem } from './TaskItem';
import { ListChecks, ChevronDown } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { SubTaskItem } from './SubTaskItem';
import type { LanguageStrings } from '@/lib/translations';
import { CriticalTaskToggle } from './CriticalTaskToggle';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleScheduled: (id: string, currentScheduledAt: any) => void;
  onUpdateTaskValue: (
    taskId: string,
    field: keyof Pick<Task, 'urgencia' | 'necesidad' | 'costo' | 'duracion'>,
    newValue: number
  ) => void;
  onSelectTask: (taskId: string | null) => void;
  selectedTaskId: string | null;
  onToggleSubTaskComplete: (subTaskId: string, parentId: string) => void;
  onDeleteSubTask: (subTaskId: string, parentId: string) => void;
  onToggleSubTaskScheduled: (subTaskId: string, parentId: string, currentScheduledAt: any) => void;
  onToggleCritical: (taskId: string, isCurrentlyCritical: boolean) => void;
  criticalTasksCount: number;
  t: LanguageStrings;
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
    return { 
        backgroundColor: `hsla(121, 63%, 58%, 0.5)`,
        borderColor: `hsla(121, 63%, 48%, 1)`
    };
  }

  const maxFactorForColor = 2.5;
  const normalizedFactor = Math.min(agingFactor / maxFactorForColor, 1.0);

  const hue = 120 - (normalizedFactor * 120);
  const saturation = 70 + (normalizedFactor * 30); 
  const lightness = 60 - (normalizedFactor * 10); 
  const alpha = 0.5 + (normalizedFactor * 0.2); 

  return { 
      backgroundColor: `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`,
      borderColor: `hsla(${hue}, ${saturation}%, ${lightness - 10}%, 1)` 
  };
};


export function TaskList({ 
    tasks, 
    onToggleComplete, 
    onDeleteTask, 
    onToggleScheduled, 
    onUpdateTaskValue,
    onSelectTask,
    selectedTaskId,
    onToggleSubTaskComplete,
    onDeleteSubTask,
    onToggleSubTaskScheduled,
    onToggleCritical,
    criticalTasksCount,
    t
}: TaskListProps) {
  const sortedTasks = [...tasks].sort((a, b) => {
    // Critical tasks always on top
    if (a.isCritical && !b.isCritical) return -1;
    if (!a.isCritical && b.isCritical) return 1;

    if (a.completado && !b.completado) return 1;
    if (!a.completado && b.completado) return -1;

    // For completed tasks, sort by completion date descending
    if (a.completado && b.completado) {
        const aDate = a.completedAt && 'toDate' in a.completedAt ? a.completedAt.toDate() : new Date(a.completedAt || 0);
        const bDate = b.completedAt && 'toDate' in b.completedAt ? b.completedAt.toDate() : new Date(b.completedAt || 0);
        return bDate.getTime() - aDate.getTime();
    }

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
        <p className="text-xl text-foreground font-semibold">{t.noTasksTitle}</p>
        <p className="text-md text-muted-foreground">{t.noTasksDescription}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <TooltipProvider>
        <Accordion type="multiple" className="w-full border-t-0 rounded-none min-w-[600px]">
          {sortedTasks.map((task) => {
            const agingFactor = calculateAgingFactor(task);
            const agingColorStyle = getAgingColorStyle(agingFactor);
            const hasSubtasks = task.subtasks && task.subtasks.length > 0;
            const isSelected = selectedTaskId === task.id;

            const rowStyle: React.CSSProperties = {};
            if (task.isCritical) {
              rowStyle.backgroundColor = '#661400';
              rowStyle.color = 'white';
            } else if (!task.completado) {
                rowStyle.backgroundColor = agingColorStyle.backgroundColor;
            }

            if (isSelected && !task.completado) {
              rowStyle.borderColor = task.isCritical ? '#ffb700' : agingColorStyle.borderColor;
            }

            return (
              <AccordionItem 
                value={task.id} 
                key={task.id} 
                className={cn(
                  "border-b overflow-hidden transition-all duration-300",
                  isSelected ? 'border-4 shadow-lg' : 'border-border',
                  task.completado && "bg-muted/50"
                )}
                style={rowStyle}
              >
                <div 
                   onClick={() => onSelectTask(task.id)} 
                   className="flex items-center w-full relative cursor-pointer"
                >
                  <CriticalTaskToggle
                    isCritical={!!task.isCritical}
                    onToggle={() => onToggleCritical(task.id, !!task.isCritical)}
                    disabled={task.completado || (!task.isCritical && criticalTasksCount >= 3)}
                  />
                  <div className="flex-grow">
                      <TaskItem
                          task={task}
                          onToggleComplete={onToggleComplete}
                          onDeleteTask={onDeleteTask}
                          onToggleScheduled={onToggleScheduled}
                          onUpdateTaskValue={onUpdateTaskValue}
                          agingFactor={agingFactor}
                          t={t}
                      />
                  </div>
                  <AccordionTrigger 
                      className={cn(
                          "p-0 hover:no-underline w-[40px] flex-shrink-0 flex justify-center items-center",
                          "[&[data-state=open]>.chevron]:rotate-180",
                          !hasSubtasks && "opacity-0 cursor-default",
                          task.isCritical && "text-white hover:bg-white/10"
                      )}
                      disabled={!hasSubtasks}
                      onClick={(e) => {
                        if (hasSubtasks) {
                          e.stopPropagation(); // Evita que onSelectTask se dispare al hacer clic en el trigger del acordeón
                        }
                      }}
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
                          onToggleScheduled={() => onToggleSubTaskScheduled(subtask.id, task.id, subtask.scheduledAt)}
                          t={t}
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
    </div>
  );
}
