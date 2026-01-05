
"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';

interface AverageIndexGaugeProps {
  value: number;
  maxValue: number;
  className?: string;
}

export function AverageIndexGauge({ value, maxValue, className }: AverageIndexGaugeProps) {
  const size = 144; // Matches the microphone button size (w-36)
  const strokeWidth = 8;
  const center = size / 2;
  const radius = center - strokeWidth;

  const totalAngle = 240; // The total sweep of the gauge arc in degrees
  const startAngle = -totalAngle / 2; // Start from -120 degrees

  // Clamp the value to be within the min/max range
  const clampedValue = Math.max(0, Math.min(value, maxValue));

  const valueAngle = startAngle + (clampedValue / maxValue) * totalAngle;

  const needleLength = radius - 15;
  const needleX = center + needleLength * Math.sin((valueAngle * Math.PI) / 180);
  const needleY = center - needleLength * Math.cos((valueAngle * Math.PI) / 180);

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    const d = ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
    return d;
  };

  // Create ticks
  const ticks = [];
  const numTicks = 5;
  for (let i = 0; i <= numTicks; i++) {
    const tickValue = (i / numTicks) * maxValue;
    const tickAngle = startAngle + (tickValue / maxValue) * totalAngle;

    const tickInnerRadius = radius - 5;
    const tickOuterRadius = radius + 5;

    const startPt = {
        x: center + tickInnerRadius * Math.sin(tickAngle * Math.PI / 180),
        y: center - tickInnerRadius * Math.cos(tickAngle * Math.PI / 180),
    };
    const endPt = {
        x: center + tickOuterRadius * Math.sin(tickAngle * Math.PI / 180),
        y: center - tickOuterRadius * Math.cos(tickAngle * Math.PI / 180),
    };
    
    ticks.push(<line key={i} x1={startPt.x} y1={startPt.y} x2={endPt.x} y2={endPt.y} stroke="hsl(var(--foreground))" strokeWidth="2" />);
  }


  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={cn("transition-opacity duration-300", value > 0 ? "opacity-100" : "opacity-30", className)}>
      {/* Gauge background arc */}
      <path
        d={describeArc(center, center, radius, -120, 120)}
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Ticks */}
      <g>{ticks}</g>
      {/* Needle */}
      <g transform={`rotate(${valueAngle} ${center} ${center})`}>
         <path d={`M ${center - 5} ${center + 10} L ${center} ${center - needleLength} L ${center + 5} ${center + 10} Z`} fill="hsl(var(--foreground))" />
         <circle cx={center} cy={center} r="7" fill="hsl(var(--foreground))" />
      </g>
    </svg>
  );
}
