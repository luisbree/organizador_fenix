"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task, SortOrder } from '@/types/task';
import type { LanguageStrings } from '@/lib/translations';

// A simple, inline SVG for the Oak Leaf icon
const OakLeafIcon = ({ className, color }: { className?: string; color: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 200"
    className={cn("h-auto", className)}
    style={{ fill: color }}
  >
    <path d="M496.2,85.2c-29.2-2.3-51,10.7-65.8,25.5c-3.2,3.2-6.1,6.5-8.6,10c-15.8-19-21.2-42.9-10.7-65.8 C421.6,34,440.4,22.2,460.6,21c22.5-1.4,43.2,8.5,50.4,29.3C520,77.5,512.2,95.7,496.2,85.2z M397,112.5 c-1.5,4-2.8,8-3.9,11.9c-15,53.4-60.6,90.4-114.7,94.9c-23.7,2-47-2.3-69-12.2c-20-9-37.4-23.3-50.5-41.2 c-1.9-2.6-3.7-5.2-5.4-7.9c-2-3.1-4.1-6.1-6.2-9c-15-20.9-39.7-33-66-32.1C31.5,117.8,0,147.2,0,186.2 c0,5.7,0.7,11.4,2.2,16.8h415.5c39.3,0,76.7-15.5,104.6-43.4c6.2-6.2,11.5-13.1,15.8-20.6C523.8,118.1,471.9,81.4,397,112.5z M145.4,39.6c-20.1-22.3-52-27.4-78.2-11.3C44,39.2,30,60.1,30.3,83.1c0.3,24.8,15.9,46.7,39.3,55.4 c25.4,9.5,54.1,2,72-19.1c2-2.4,3.9-4.9,5.5-7.5c1.1-1.7,2.1-3.5,3.1-5.3c-0.1,0-0.2-0.1-0.2-0.1c-0.7,1.1-1.3,2.3-2,3.4 c-12.7,21.9-37.9,34.5-63.5,30.3c-23.8-3.9-42.6-22-47.5-45.2c-4.4-20.9,4.4-42.7,21.8-54.3c19.3-12.8,44-11,61,4.3 c3.2,2.8,6,6.1,8.3,9.7c-5.9,3.7-11.4,7.9-16.5,12.8C152.1,69.5,147.6,56.1,145.4,39.6z"/>
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
    t: LanguageStrings;
    disabled: boolean;
}

export function SortAndAgingIndicator({ tasks, sortOrder, setSortOrder, t, disabled }: SortAndAgingIndicatorProps) {
  const averageColor = React.useMemo(() => getAverageAgingColor(tasks), [tasks]);
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'index' ? 'age' : 'index');
  };

  const Icon = sortOrder === 'index' ? ArrowUpDown : CalendarDays;
  const buttonText = sortOrder === 'index' ? t.sortBy.index : t.sortBy.age;

  return (
    <div className="w-full flex items-center justify-center space-x-2 px-1 pt-3 max-w-xl mx-auto">
        <div className="w-1/2 flex items-center justify-center pr-2">
             <div className="w-full h-10 bg-card rounded-md flex items-center justify-center p-2">
                <OakLeafIcon color={averageColor} className="w-full" />
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
