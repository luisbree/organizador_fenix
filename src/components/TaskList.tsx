
"use client";

import type * as React from 'react';
import type { Task } from '@/types/task';
import { TaskItem } from './TaskItem';
import { ListChecks, Flame, ShieldCheck, CircleDollarSign, Hourglass, HelpCircle, Hash } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


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
}

const headerCells = [
    { id: 'urgencia', label: 'Urgencia', icon: Flame, className: 'text-destructive' },
    { id: 'necesidad', label: 'Necesidad', icon: ShieldCheck, className: 'text-primary' },
    { id: 'costo', label: 'Costo', icon: CircleDollarSign, className: 'text-accent' },
    { id: 'duracion', label: 'Duración', icon: Hourglass, className: 'text-muted-foreground' },
];

export function TaskList({ tasks, onToggleComplete, onDeleteTask, onMarkSchedulingAttempted, onUpdateTaskValue }: TaskListProps) {
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completado && !b.completado) return 1;
    if (!a.completado && b.completado) return -1;

    const aIndex = a.indice;
    const bIndex = b.indice;

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
      <div className="rounded-lg border overflow-hidden bg-card">
        <Table>
          <TableCaption>
            {tasks.filter(task => !task.completado).length} tarea(s) pendiente(s) de {tasks.length}.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Tarea</TableHead>
              {headerCells.map(({ id, label, icon: Icon, className }) => (
                <TableHead key={id} className="text-center">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex justify-center items-center">
                                <Icon className={`h-5 w-5 ${className}`} />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{label}</p>
                        </TooltipContent>
                    </Tooltip>
                </TableHead>
              ))}
              <TableHead className="text-center">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex justify-center items-center font-bold text-lg">
                           <p>#</p>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Índice</p>
                    </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="text-right w-[120px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onDeleteTask={onDeleteTask}
                onMarkSchedulingAttempted={onMarkSchedulingAttempted}
                onUpdateTaskValue={onUpdateTaskValue}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
