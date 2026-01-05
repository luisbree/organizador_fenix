"use client";

import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { LanguageStrings } from '@/lib/translations';

interface FenixPeriodEditorProps {
  children: React.ReactNode;
  fenixPeriod: number;
  isFenix: boolean;
  onUpdate: (newPeriod: number) => void;
  t: LanguageStrings;
}

export function FenixPeriodEditor({ children, fenixPeriod, isFenix, onUpdate, t }: FenixPeriodEditorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [localPeriod, setLocalPeriod] = React.useState(fenixPeriod);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    setLocalPeriod(fenixPeriod);
  }, [fenixPeriod, isOpen]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isFenix) return;
    timerRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 700); // 700ms for a long press
  };

  const handlePointerUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };
  
  const handlePointerLeave = () => {
     if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };
  
  const handleSave = () => {
    onUpdate(localPeriod);
    setIsOpen(false);
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        asChild
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        // Prevent context menu on long press on touch devices
        onContextMenu={(e) => { if(isFenix) e.preventDefault()}} 
      >
        {children}
      </PopoverTrigger>
      {isFenix && (
        <PopoverContent className="w-60" align="start" onBlur={handleSave}>
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">{t.fenixRebirthPeriodTitle}</h4>
              <p className="text-sm text-muted-foreground">
                {t.fenixRebirthPeriodDescription}
              </p>
            </div>
            <div className="grid gap-2">
              <Slider
                defaultValue={[localPeriod]}
                max={90}
                min={1}
                step={1}
                onValueChange={(value) => setLocalPeriod(value[0])}
                onBlur={handleSave}
              />
              <div className="flex items-center justify-between">
                <Input
                  type="number"
                  value={localPeriod}
                  onChange={(e) => setLocalPeriod(Number(e.target.value))}
                  onBlur={handleSave}
                  className="w-20 h-8 text-center"
                />
                <Label>{t.days}</Label>
              </div>
            </div>
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
}
