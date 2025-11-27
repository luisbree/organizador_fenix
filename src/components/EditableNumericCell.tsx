
"use client";

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { LanguageStrings } from '@/lib/translations';

interface EditableNumericCellProps {
  value: number;
  onSave: (newValue: number) => void;
  t: LanguageStrings;
  min?: number;
  max?: number;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
}

export function EditableNumericCell({
  value,
  onSave,
  t,
  min = 0,
  max = 5,
  className,
  inputClassName,
  disabled = false,
}: EditableNumericCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) {
      setCurrentValue(String(value));
    }
  }, [value, isEditing]);

  const handleSave = () => {
    const numValue = parseInt(currentValue, 10);
    if (isNaN(numValue) || numValue < min || numValue > max) {
      toast({
        title: t.invalidValueTitle,
        description: t.invalidValueDescription(min, max),
        variant: "destructive",
      });
      setCurrentValue(String(value)); 
      setIsEditing(false);
      return;
    }
    if (numValue !== value) {
        onSave(numValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setCurrentValue(String(value)); 
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type="number"
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn("h-7 p-1 text-center tabular-nums text-sm", inputClassName)}
        min={min}
        max={max}
        aria-label={t.editValueAriaLabel}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center space-x-1 p-1 rounded-md min-h-[28px]",
        !disabled && "cursor-pointer hover:bg-muted/80",
        disabled && "cursor-not-allowed",
        className
      )}
      title={disabled ? undefined : t.editValueTooltip(value)}
      onClick={() => {
        if (disabled) return;
        setCurrentValue(String(value)); 
        setIsEditing(true);
      }}
      role={disabled ? "status" : "button"}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === 'Enter' || e.key === ' ') {
          setCurrentValue(String(value));
          setIsEditing(true);
        }
      }}
    >
      <span className={cn("tabular-nums text-base", disabled && "text-muted-foreground/60")}>{value}</span>
    </div>
  );
}
