
"use client";

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EditableNumericCellProps {
  value: number;
  onSave: (newValue: number) => void;
  min?: number;
  max?: number;
  className?: string;
  inputClassName?: string;
  icon?: React.ReactNode;
  title?: string;
}

export function EditableNumericCell({
  value,
  onSave,
  min = 0,
  max = 5,
  className,
  inputClassName,
  icon,
  title,
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
    // If the parent component updates the value prop (e.g. after save),
    // or if editing is cancelled, reflect it in the non-editing display
    // and reset internal input state.
    if (!isEditing) {
      setCurrentValue(String(value));
    }
  }, [value, isEditing]);

  const handleSave = () => {
    const numValue = parseInt(currentValue, 10);
    if (isNaN(numValue) || numValue < min || numValue > max) {
      toast({
        title: "Valor inválido",
        description: `El valor debe ser un número entre ${min} y ${max}.`,
        variant: "destructive",
      });
      setCurrentValue(String(value)); // Revert to original value on bad input
      setIsEditing(false);
      return;
    }
    if (numValue !== value) { // Only call onSave if value actually changed
        onSave(numValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setCurrentValue(String(value)); // Revert to original on escape
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
        className={cn("h-8 p-1 text-center tabular-nums", inputClassName)}
        min={min}
        max={max}
        aria-label={`Editar ${title}`}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center space-x-1 cursor-pointer p-1 rounded-md hover:bg-muted/80 min-h-[32px]", // min-h to match input height
        className
      )}
      title={title ? `${title}: ${value}. Click para editar.` : `Valor actual: ${value}. Click para editar.`}
      onClick={() => {
        setCurrentValue(String(value)); 
        setIsEditing(true);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setCurrentValue(String(value));
          setIsEditing(true);
        }
      }}
    >
      {icon}
      <span className="tabular-nums font-semibold">{value}</span>
      {title && <span className="text-xs text-muted-foreground -ml-0.5">{title}</span>}
    </div>
  );
}
