"use client";

import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface CriticalTaskToggleProps {
  isCritical: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const StarIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      {...props}
    >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);


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
                    "w-10 h-full flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-l-md",
                    disabled && "cursor-not-allowed opacity-50",
                    isCritical ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-500'
                    )}
                >
                    <StarIcon className={cn(
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
