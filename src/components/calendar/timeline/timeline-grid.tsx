import React from 'react';
import { cn } from '@/lib/utils';

interface TimelineGridProps {
  children: React.ReactNode;
  className?: string;
}

const TimelineGrid: React.FC<TimelineGridProps> = ({ children, className }) => {
  return (
    <div className={cn('p-4 grid grid-cols-1 gap-4', className)}>
      {/* Timeline grid lines */}
      <div className="absolute inset-0 grid grid-cols-1 pointer-events-none">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="border-t border-muted h-16"
            style={{
              gridRow: i + 1,
            }}
          />
        ))}
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default TimelineGrid;