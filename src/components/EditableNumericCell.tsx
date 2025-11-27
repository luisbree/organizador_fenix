
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
}

export function EditableNumericCell({
  value,
  onSave,
  min = 0,
  max = 5,
  className,
  inputClassName,
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
        title: "Valor inválido",
        description: `El valor debe ser un número entre ${min} y ${max}.`,
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
        aria-label={`Editar valor`}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center space-x-1 cursor-pointer p-1 rounded-md hover:bg-muted/80 min-h-[28px]",
        className
      )}
      title={`Valor actual: ${value}. Click para editar.`}
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
      <span className="tabular-nums font-semibold text-base">{value}</span>
    </div>
  );
}
