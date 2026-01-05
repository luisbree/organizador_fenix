"use client";

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface EditableTextProps {
  initialValue: string;
  onSave: (newValue: string) => void;
  className?: string;
  inputClassName?: string;
  isCompleted?: boolean;
}

export function EditableText({
  initialValue,
  onSave,
  className,
  inputClassName,
  isCompleted = false,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [value, setValue] = React.useState(initialValue);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  React.useEffect(() => {
    if (!isEditing) {
      setValue(initialValue);
    }
  }, [initialValue, isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (value.trim() && value.trim() !== initialValue) {
      onSave(value.trim());
    } else {
      setValue(initialValue);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isCompleted) return;
    e.stopPropagation(); // Prevents task selection when clicking text
    setIsEditing(true);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
     if (e.key === 'Enter') {
        handleSave();
     } else if (e.key === 'Escape') {
        setValue(initialValue);
        setIsEditing(false);
     }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()} // Prevent accordion trigger on click inside input
        className={cn("h-7 p-1 text-sm bg-background/80", inputClassName)}
      />
    );
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        "cursor-text whitespace-nowrap",
        isCompleted && "line-through text-muted-foreground",
        className
      )}
    >
      {value}
    </div>
  );
}
