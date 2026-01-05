
"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, CalendarDays } from 'lucide-react';
import type { SortOrder } from '@/types/task';
import type { LanguageStrings } from '@/lib/translations';

interface SortAndAgingIndicatorProps {
    sortOrder: SortOrder;
    setSortOrder: (order: SortOrder) => void;
    t: LanguageStrings;
    disabled: boolean;
}

export function SortAndAgingIndicator({ sortOrder, setSortOrder, t, disabled }: SortAndAgingIndicatorProps) {
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'index' ? 'age' : 'index');
  };

  const Icon = sortOrder === 'index' ? ArrowUpDown : CalendarDays;
  const buttonText = sortOrder === 'index' 
    ? t.sortBy.index 
    : t.sortBy.age;


  return (
        <Button
            onClick={toggleSortOrder}
            variant="outline"
            className="w-full h-10"
            disabled={disabled}
        >
            <Icon className="mr-2 h-4 w-4" />
            {buttonText}
        </Button>
  );
}
