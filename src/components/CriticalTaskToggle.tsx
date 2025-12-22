"use client";

import * as React from 'react';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface CriticalTaskToggleProps {
  isCritical: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function CriticalTaskToggle({ isCritical, onToggle, disabled = false }: CriticalTaskToggleProps) {

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onToggle();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.stopPropagation();
      e.preventDefault();
      if (!disabled) {
        onToggle();
      }
    }
  };

  const tooltipText = isCritical ? "Quitar de críticas" : (disabled ? "Límite de críticas alcanzado" : "Marcar como crítica");

  return (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <div
                    role="checkbox"
                    aria-checked={isCritical}
                    aria-disabled={disabled}
                    onClick={handleClick}
                    onKeyDown={handleKeyDown}
                    tabIndex={disabled ? -1 : 0}
                    className={cn(
                    "w-10 h-full flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors focus:outline-none rounded-l-md",
                    disabled && "cursor-not-allowed opacity-50",
                    isCritical ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                    )}
                >
                    <Flame className={cn(
                        "h-5 w-5 transition-all", 
                        isCritical ? "fill-current scale-110" : ""
                    )} />
                    <span className="sr-only">Marcar como tarea crítica</span>
                </div>
            </TooltipTrigger>
             <TooltipContent>
                <p>{tooltipText}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
  );
}
