"use client";

import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { useTimeGrid, type TimeGridConfig } from '@/hooks/use-time-grid';
import { useCalendarEvents } from '@/hooks/use-calendar-events';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CalendarEvent, Position } from '@/types';

interface TimeGridProps {
  events: CalendarEvent[];
  onEventUpdate: (event: CalendarEvent) => void;
  onEventCreate: (event: Partial<CalendarEvent>) => void;
  className?: string;
  gridConfig?: Partial<TimeGridConfig>;
  view: 'day' | 'week' | 'month';
  selectedDate: Date;
  teachers: { id: string; name: string; color: string }[];
}

export function TimeGrid({
  events,
  onEventUpdate,
  onEventCreate,
  className,
  gridConfig,
  view,
  selectedDate,
  teachers
}: TimeGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const {
    config,
    getTimeSlots,
    getGridPosition,
    getColumnWidth,
    adjustZoom,
    getCurrentScale
  } = useTimeGrid({
    ...gridConfig,
    columnCount: view === 'day' ? teachers.length : 1
  });

  const {
    dragState,
    handleDragStart,
    handleDragMove,
    handleDragEnd
  } = useCalendarEvents(events, onEventUpdate, onEventCreate);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        // Calculate height based on time slots and scale
        const timeSlots = getTimeSlots();
        const height = Math.max(600, timeSlots.length * 40 * config.zoomLevel);
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [config.zoomLevel, getTimeSlots]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top + containerRef.current.scrollTop;
    
    const gridPosition = getGridPosition(y, dimensions.height, x, dimensions.width);
    const position: Position = {
      x: gridPosition.column,
      y: gridPosition.snappedY,
      time: gridPosition.time,
      column: gridPosition.column,
      snappedY: gridPosition.snappedY
    };
    handleDragStart(position);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !dragState) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top + containerRef.current.scrollTop;
    
    const gridPosition = getGridPosition(y, dimensions.height, x, dimensions.width);
    const position: Position = {
      x: gridPosition.column,
      y: gridPosition.snappedY,
      time: gridPosition.time,
      column: gridPosition.column,
      snappedY: gridPosition.snappedY
    };
    handleDragMove(position);
  };

  const handleMouseUp = () => {
    if (dragState) {
      handleDragEnd();
    }
  };

  const timeSlots = getTimeSlots();
  const columnWidth = getColumnWidth(dimensions.width);
  const scale = getCurrentScale();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustZoom(config.zoomLevel - 0.25)}
            disabled={config.zoomLevel <= 0.25}
          >
            -
          </Button>
          <span className="text-sm font-medium">
            Scale: {scale} ({Math.round(config.zoomLevel * 100)}%)
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustZoom(config.zoomLevel + 0.25)}
            disabled={config.zoomLevel >= 3}
          >
            +
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div
          ref={containerRef}
          className={cn(
            "relative",
            className
          )}
          style={{ 
            width: '100%',
            height: dimensions.height,
            minHeight: '600px'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Time slots */}
          {timeSlots.map((time, index) => (
            <div
              key={time.toISOString()}
              className="absolute left-0 w-full border-t border-gray-200 dark:border-gray-800"
              style={{
                top: (index * 40 * config.zoomLevel),
                height: (40 * config.zoomLevel)
              }}
            >
              <span className="absolute -top-3 left-2 text-sm text-gray-500 dark:text-gray-400">
                {format(time, 'HH:mm')}
              </span>
            </div>
          ))}

          {/* Column separators for day view */}
          {view === 'day' && teachers.map((teacher, index) => (
            <div
              key={teacher.id}
              className="absolute top-0 h-full border-l border-gray-200 dark:border-gray-800"
              style={{
                left: `${(index * columnWidth)}px`,
                width: `${columnWidth}px`
              }}
            >
              <div className="sticky top-0 z-10 px-2 py-1 text-sm font-medium bg-background border-b">
                {teacher.name}
              </div>
            </div>
          ))}

          {/* Events */}
          {events.map(event => (
            <div
              key={event.id}
              className="absolute rounded-md border border-primary bg-primary/10 p-2 cursor-pointer"
              style={{
                left: `${event.position.x * columnWidth}px`,
                top: event.position.y,
                width: `${columnWidth - 4}px`,
                height: `${event.duration * 40 * config.zoomLevel}px`
              }}
            >
              <div className="text-sm font-medium truncate">{event.title}</div>
            </div>
          ))}

          {/* Drag indicator */}
          {dragState && (
            <div
              className="absolute border-2 border-primary bg-primary/5 rounded-md pointer-events-none"
              style={{
                left: `${dragState.position.column * columnWidth}px`,
                top: dragState.position.snappedY,
                width: `${columnWidth - 4}px`,
                height: `${dragState.duration * 40 * config.zoomLevel}px`
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
} 