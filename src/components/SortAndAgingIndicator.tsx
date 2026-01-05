
"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task, SortOrder } from '@/types/task';
import type { LanguageStrings } from '@/lib/translations';

// A simple, inline SVG for the Fern Leaf icon
const FernLeafIcon = ({ className, color }: { className?: string; color: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 200" // Adjusted viewBox for horizontal layout
        className={cn("h-auto", className)}
        style={{ fill: color, stroke: 'rgba(0,0,0,0.1)', strokeWidth: '1' }}
        preserveAspectRatio="xMidYMid meet"
    >
        <path d="M256,180 C200,180 180,120 150,100 C120,80 80,90 50,60 C20,30 10,80 10,100 C10,120 20,170 50,140 C80,110 120,120 150,120 L256,120 M256,180 C312,180 332,120 362,100 C392,80 432,90 462,60 C492,30 502,80 502,100 C502,120 492,170 462,140 C432,110 392,120 362,120 L256,120 M150,120 C160,140 170,150 180,160 M150,120 C140,100 130,90 120,80 M120,80 C110,70 100,60 90,50 M362,120 C352,140 342,150 332,160 M362,120 C372,100 382,90 392,80 M392,80 C402,70 412,60 422,50" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(0, -20)" />
    </svg>
);


const getAverageAgingColor = (tasks: Task[]): string => {
    const nonCompletedTasks = tasks.filter(t => !t.completado && !t.isCritical);
    if (nonCompletedTasks.length === 0) {
        return `hsla(121, 63%, 58%, 0.7)`; // Default green when no tasks
    }

    const maxFactorForColor = 2.5;
    let totalHue = 0;
    let totalSaturation = 0;
    let totalLightness = 0;
    let totalAlpha = 0;

    const calculateAgingFactor = (task: Task): number => {
        if (!task.createdAt) return 0;
        const createdDate = task.createdAt && 'toDate' in task.createdAt ? task.createdAt.toDate() : new Date(task.createdAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        createdDate.setHours(0, 0, 0, 0);

        const timeDiff = today.getTime() - createdDate.getTime();
        const daysOld = Math.max(0, Math.floor(timeDiff / (1000 * 3600 * 24)));

        if (daysOld < 1) return 0;
        const factor = ((task.urgencia + task.necesidad) / 10) * Math.log(daysOld + 1);
        return isNaN(factor) ? 0 : factor;
    };

    nonCompletedTasks.forEach(task => {
        const agingFactor = calculateAgingFactor(task);
        if (agingFactor <= 0) {
            totalHue += 121;
            totalSaturation += 63;
            totalLightness += 58;
            totalAlpha += 0.7;
        } else {
            const normalizedFactor = Math.min(agingFactor / maxFactorForColor, 1.0);
            totalHue += 120 - (normalizedFactor * 120);
            totalSaturation += 70 + (normalizedFactor * 30);
            totalLightness += 60 - (normalizedFactor * 10);
            totalAlpha += 0.5 + (normalizedFactor * 0.2);
        }
    });

    const avgHue = totalHue / nonCompletedTasks.length;
    const avgSaturation = totalSaturation / nonCompletedTasks.length;
    const avgLightness = totalLightness / nonCompletedTasks.length;
    const avgAlpha = totalAlpha / nonCompletedTasks.length;

    return `hsla(${avgHue}, ${avgSaturation}%, ${avgLightness}%, ${avgAlpha})`;
};

interface SortAndAgingIndicatorProps {
    tasks: Task[];
    sortOrder: SortOrder;
    setSortOrder: (order: SortOrder) => void;
    averageIndex: number;
    t: LanguageStrings;
    disabled: boolean;
}

export function SortAndAgingIndicator({ tasks, sortOrder, setSortOrder, averageIndex, t, disabled }: SortAndAgingIndicatorProps) {
  const averageColor = React.useMemo(() => getAverageAgingColor(tasks), [tasks]);
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'index' ? 'age' : 'index');
  };

  const Icon = sortOrder === 'index' ? ArrowUpDown : CalendarDays;
  const buttonText = sortOrder === 'index' 
    ? `${t.sortBy.index} (${averageIndex.toFixed(2)})` 
    : t.sortBy.age;


  return (
    <div className="w-full flex items-center justify-center space-x-2 px-1 pt-3 max-w-xl mx-auto">
        <div className="w-1/2 flex items-center justify-center pr-2">
             <div className="w-full h-10 bg-card rounded-md flex items-center justify-center p-2 overflow-hidden">
                <FernLeafIcon color={averageColor} className="w-full" />
             </div>
        </div>
        <div className="w-1/2 flex items-center justify-center pl-2">
            <Button
                onClick={toggleSortOrder}
                variant="outline"
                className="w-full h-10"
                disabled={disabled}
            >
                <Icon className="mr-2 h-4 w-4" />
                {buttonText}
            </Button>
        </div>
    </div>
  );
}
