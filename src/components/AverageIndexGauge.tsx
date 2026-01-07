"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';

interface AverageIndexGaugeProps {
  value: number;
  maxValue: number;
  className?: string;
  colorBands?: boolean;
  useGradient?: boolean;
  useAgingGradient?: boolean;
}

// Function to interpolate between two colors
const lerpColor = (a: [number, number, number], b: [number, number, number], amount: number): [number, number, number] => {
  const clampedAmount = Math.max(0, Math.min(1, amount));
  const r = Math.round(a[0] + (b[0] - a[0]) * clampedAmount);
  const g = Math.round(a[1] + (b[1] - a[1]) * clampedAmount);
  const blue = Math.round(a[2] + (b[2] - a[2]) * clampedAmount);
  return [r, g, blue];
};

// Hex to RGB conversion
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0];
};

const COLORS = {
  GREEN: hexToRgb('#5cd65c'),
  YELLOW: hexToRgb('#fdf068'),
  ORANGE: hexToRgb('#ff9933'),
  RED: hexToRgb('#fa0505'),
};

// This function is now the single source of truth for aging colors.
export const getAgingGradientColor = (factor: number, maxFactor: number): string => {
  const normalizedFactor = Math.min(factor / maxFactor, 1.0);

  let rgb: [number, number, number];

  if (normalizedFactor < 0.33) {
    // Green to Yellow
    rgb = lerpColor(COLORS.GREEN, COLORS.YELLOW, normalizedFactor / 0.33);
  } else if (normalizedFactor < 0.66) {
    // Yellow to Orange
    rgb = lerpColor(COLORS.YELLOW, COLORS.ORANGE, (normalizedFactor - 0.33) / 0.33);
  } else {
    // Orange to Red
    rgb = lerpColor(COLORS.ORANGE, COLORS.RED, (normalizedFactor - 0.66) / 0.34);
  }
  
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
};


export const getAgingColor = (agingFactor: number): string => {
  // The max factor for the leaf and gauge should be consistent.
  return getAgingGradientColor(agingFactor, 4.0); 
};

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


export function AverageIndexGauge({ 
  value, 
  maxValue, 
  className, 
  colorBands = false, 
  useGradient = false,
  useAgingGradient = false 
}: AverageIndexGaugeProps) {
  const size = 77; 
  const strokeWidth = 5;
  const center = size / 2;
  const radius = center - strokeWidth;

  const totalAngle = 240; // The total sweep of the gauge arc in degrees
  const startAngle = -totalAngle / 2; // Start from -120 degrees

  const valueToAngle = (val: number) => {
    return startAngle + (Math.max(0, Math.min(val, maxValue)) / maxValue) * totalAngle;
  };

  const valueAngle = valueToAngle(value);

  const needleLength = radius - 8;
  
  // Create ticks
  const ticks = [];
  const numTicks = 5;
  for (let i = 0; i <= numTicks; i++) {
    const tickValue = (i / numTicks) * maxValue;
    const tickAngle = startAngle + (tickValue / maxValue) * totalAngle;

    const tickInnerRadius = radius - 2; 
    const tickOuterRadius = radius + 2;

    const startPt = {
        x: center + tickInnerRadius * Math.sin(tickAngle * Math.PI / 180),
        y: center - tickInnerRadius * Math.cos(tickAngle * Math.PI / 180),
    };
    const endPt = {
        x: center + tickOuterRadius * Math.sin(tickAngle * Math.PI / 180),
        y: center - tickOuterRadius * Math.cos(tickAngle * Math.PI / 180),
    };
    
    ticks.push(<line key={i} x1={startPt.x} y1={startPt.y} x2={endPt.x} y2={endPt.y} stroke="hsl(var(--foreground))" strokeWidth="1" />);
  }
  
  const agingGradientArcs = useAgingGradient ? 
    Array.from({ length: 100 }).map((_, i) => {
        const segmentStartValue = (i / 100) * maxValue;
        const segmentEndValue = ((i + 1) / 100) * maxValue;
        
        const segmentStartAngle = valueToAngle(segmentStartValue);
        const segmentEndAngle = valueToAngle(segmentEndValue);
        
        const color = getAgingGradientColor(segmentStartValue, maxValue);

        return (
            <path
                key={i}
                d={describeArc(center, center, radius, segmentStartAngle, segmentEndAngle)}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
            />
        );
    }) : null;

  return (
    <div className="flex flex-col items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={cn("transition-opacity duration-300", value > 0 ? "opacity-100" : "opacity-30", className)}>
            <defs>
              <linearGradient id="avgIndexGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="blue" />
                <stop offset="33%" stopColor="lightblue" />
                <stop offset="66%" stopColor="pink" />
                <stop offset="100%" stopColor="red" />
              </linearGradient>
            </defs>

            {/* Gauge background arc */}
            {useAgingGradient ? (
              <g>{agingGradientArcs}</g>
            ) : colorBands ? (
              <>
                <path
                    d={describeArc(center, center, radius, valueToAngle(0), valueToAngle(80))}
                    fill="none"
                    stroke="#22c55e" // Green
                    strokeWidth={strokeWidth}
                />
                <path
                    d={describeArc(center, center, radius, valueToAngle(80), valueToAngle(160))}
                    fill="none"
                    stroke="#facc15" // Yellow
                    strokeWidth={strokeWidth}
                />
                <path
                    d={describeArc(center, center, radius, valueToAngle(160), valueToAngle(240))}
                    fill="none"
                    stroke="#ef4444" // Red
                    strokeWidth={strokeWidth}
                />
              </>
            ) : (
               <path
                  d={describeArc(center, center, radius, -120, 120)}
                  fill="none"
                  stroke={useGradient ? "url(#avgIndexGradient)" : "hsl(var(--muted))"}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
              />
            )}

            {/* Ticks */}
            <g>{ticks}</g>
            {/* Needle */}
            <g transform={`rotate(${valueAngle} ${center} ${center})`}>
                <path d={`M ${center - 2.5} ${center + 5} L ${center} ${center - needleLength} L ${center + 2.5} ${center + 5} Z`} fill="hsl(var(--foreground))" />
                <circle cx={center} cy={center} r="4" fill="hsl(var(--foreground))" />
            </g>
        </svg>
        {value > 0 && (
            <p className="text-center text-sm font-bold text-foreground mt-1 tabular-nums">
                {value.toFixed(2)}
            </p>
        )}
    </div>
  );
}
