"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { addMinutes, format, getHours, getMinutes, isToday, setHours, setMinutes, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { IEvent } from '@/lib/db/interfaces';
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface TimeGridProps {
  events: IEvent[];
  onEventUpdate: (event: IEvent) => void;
  onEventCreate: (position: { x: number; y: number }, time: Date) => void;
  view: string;
  selectedDate: Date;
}

interface TimeSlot {
  time: Date;
  events: IEvent[];
}

export function TimeGrid({ events, onEventUpdate, onEventCreate, view, selectedDate }: TimeGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [draggingEvent, setDraggingEvent] = useState<IEvent | null>(null);
  const [resizingEvent, setResizingEvent] = useState<IEvent | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [containerHeight, setContainerHeight] = useState(0);
  const [dragEventTimes, setDragEventTimes] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [initialClickOffset, setInitialClickOffset] = useState(0);
  const [dragPosition, setDragPosition] = useState({ y: 0 });
  const [smoothPosition, setSmoothPosition] = useState({ y: 0 });

  // Grid configuration
  const startHour = 7;
  const endHour = 19;
  const totalHours = endHour - startHour + 1;
  
  // Dynamic time increment based on zoom level
  const getTimeIncrement = () => {
    if (zoom >= 1.5) return 5; // 5-minute increments at high zoom
    if (zoom >= 1) return 15; // 15-minute increments at normal zoom
    return 30; // 30-minute increments at low zoom
  };
  
  const minTimeIncrement = getTimeIncrement();
  const intervalsPerHour = 60 / minTimeIncrement;
  const baseHourHeight = 100; // base height for one hour at zoom level 1
  const hourHeight = baseHourHeight * zoom;
  const incrementHeight = hourHeight / intervalsPerHour;

  // Snap time to nearest increment
  const snapTimeToIncrement = useCallback((date: Date) => {
    const minutes = getMinutes(date);
    const increment = getTimeIncrement();
    const snappedMinutes = Math.round(minutes / increment) * increment;
    return setMinutes(date, snappedMinutes);
  }, [zoom]);

  // Calculate position to time
  const positionToTime = useCallback((y: number) => {
    const minutesPerPixel = 60 / hourHeight;
    const totalMinutes = y * minutesPerPixel;
    const hour = Math.floor(totalMinutes / 60) + startHour;
    const minutes = Math.round(totalMinutes % 60);
    const time = setMinutes(setHours(startOfDay(selectedDate), hour), minutes);
    return snapTimeToIncrement(time);
  }, [selectedDate, hourHeight, startHour, snapTimeToIncrement]);

  // Update container height on mount and zoom change
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const height = containerRef.current.getBoundingClientRect().height;
        setContainerHeight(height);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [zoom]);

  // Sync scroll between time labels and grid
  useEffect(() => {
    const timeLabels = containerRef.current;
    const grid = gridRef.current;
    
    if (!timeLabels || !grid) return;

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target === timeLabels) {
        grid.scrollTop = timeLabels.scrollTop;
      } else if (target === grid) {
        timeLabels.scrollTop = grid.scrollTop;
      }
    };

    timeLabels.addEventListener('scroll', handleScroll);
    grid.addEventListener('scroll', handleScroll);

    return () => {
      timeLabels.removeEventListener('scroll', handleScroll);
      grid.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleZoom = useCallback((delta: number) => {
    setZoom(prev => {
      const minZoom = Math.max(0.5, containerHeight / (baseHourHeight * totalHours));
      const newZoom = Math.max(minZoom, Math.min(2, prev + delta));
      return newZoom;
    });
  }, [containerHeight, totalHours]);

  // Track mouse position for precise dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Update smooth position when drag position changes
  useEffect(() => {
    if (draggingEvent) {
      const smoothing = 0.3; // Adjust this value to change the smoothing amount (0-1)
      const animate = () => {
        setSmoothPosition(prev => ({
          y: prev.y + (dragPosition.y - prev.y) * smoothing
        }));
        if (draggingEvent) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [dragPosition.y, draggingEvent]);

  // Event handlers
  const handleEventDrag = useCallback((event: IEvent, e: React.MouseEvent | PointerEvent | MouseEvent | TouchEvent) => {
    if (!gridRef.current || !event) return;

    const rect = gridRef.current.getBoundingClientRect();
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    const y = clientY - rect.top;
    
    // Update drag position immediately
    setDragPosition({ y: y - initialClickOffset });
    
    // Calculate snapped time for both ghost and actual event
    const snappedTime = positionToTime(y - initialClickOffset);
    const duration = new Date(event.endTime).getTime() - new Date(event.startTime).getTime();
    const snappedEndTime = new Date(snappedTime.getTime() + duration);

    setDragEventTimes({
      start: snappedTime,
      end: snappedEndTime
    });
  }, [positionToTime, initialClickOffset]);

  const handleEventDragStart = useCallback((event: IEvent, e: React.MouseEvent) => {
    if (!gridRef.current) return;
    
    const eventElement = (e.currentTarget as HTMLElement);
    const clickOffsetY = e.clientY - eventElement.getBoundingClientRect().top;
    
    setInitialClickOffset(clickOffsetY);
    setDraggingEvent(event);
    
    const rect = gridRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    setDragPosition({ y: y - clickOffsetY });
    setSmoothPosition({ y: y - clickOffsetY });
    
    setDragEventTimes({
      start: new Date(event.startTime),
      end: new Date(event.endTime)
    });
  }, []);

  const handleEventDragEnd = useCallback((e: React.MouseEvent) => {
    if (!draggingEvent || !gridRef.current || !dragEventTimes.start || !dragEventTimes.end) return;

    onEventUpdate({
      ...draggingEvent,
      startTime: dragEventTimes.start,
      endTime: dragEventTimes.end
    } as IEvent);

    setDraggingEvent(null);
    setDragEventTimes({ start: null, end: null });
    setDragPosition({ y: 0 });
    setSmoothPosition({ y: 0 });
  }, [draggingEvent, dragEventTimes, onEventUpdate]);

  const handleEventResize = useCallback((event: IEvent, e: React.MouseEvent, edge: 'top' | 'bottom') => {
    if (!gridRef.current) return;

    const rect = gridRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const newTime = positionToTime(y);

    if (edge === 'top') {
      onEventUpdate({
        ...event,
        startTime: newTime,
        endTime: new Date(event.endTime)
      });
    } else {
      onEventUpdate({
        ...event,
        startTime: new Date(event.startTime),
        endTime: newTime
      });
    }
  }, [positionToTime, onEventUpdate]);

  const handleGridClick = useCallback((e: React.MouseEvent) => {
    if (!gridRef.current) return;

    const rect = gridRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const clickTime = positionToTime(y);

    onEventCreate({ x: e.clientX, y: e.clientY }, clickTime);
  }, [positionToTime, onEventCreate]);

  // Calculate grid content height
  const gridHeight = totalHours * hourHeight;

  // Render time slots
  return (
    <div className="flex flex-col h-full relative">
      {/* Zoom controls */}
      <div className="absolute right-4 top-4 z-50 flex flex-col gap-2 bg-background/80 backdrop-blur rounded-lg shadow-lg border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleZoom(0.1)}
          className="h-8 w-8"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleZoom(-0.1)}
          className="h-8 w-8"
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      {/* Time grid container */}
      <div className="flex-1 flex min-h-0">
        {/* Scrollable container */}
        <div
          ref={gridRef}
          className="flex-1 overflow-y-auto relative bg-background scrollbar-thin scrollbar-thumb-muted scrollbar-track-background hover:scrollbar-thumb-muted-foreground/50"
        >
          <div className="flex" style={{ height: `${gridHeight}px` }}>
            {/* Time labels */}
            <div className="w-16 flex-shrink-0 bg-background border-r sticky left-0">
              {Array.from({ length: totalHours + 1 }).map((_, i) => {
                const hour = startHour + i;
                return (
                  <div
                    key={hour}
                    className="flex items-start justify-end pr-2 text-xs text-muted-foreground"
                    style={{ height: `${hourHeight}px` }}
                  >
                    {format(setHours(startOfDay(selectedDate), hour), 'HH:mm')}
                  </div>
                );
              })}
            </div>

            {/* Grid content */}
            <div className="flex-1 relative" onClick={handleGridClick}>
              {/* Grid lines based on zoom level */}
              {Array.from({ length: totalHours * intervalsPerHour }, (_, i) => {
                const isHourLine = i % intervalsPerHour === 0;
                const isHalfHourLine = i % (intervalsPerHour / 2) === 0;
                const isQuarterHourLine = zoom >= 1 && i % (intervalsPerHour / 4) === 0;
                
                // Skip rendering minute lines at low zoom levels
                if (!isHourLine && !isHalfHourLine && !isQuarterHourLine && zoom < 1.5) return null;
                
                return (
                  <div
                    key={i}
                    className={cn(
                      "absolute left-0 right-0 border-t",
                      isHourLine ? "border-border" : 
                      isHalfHourLine ? "border-border/50" : 
                      isQuarterHourLine ? "border-border/30" :
                      "border-border/20"
                    )}
                    style={{ 
                      top: `${i * incrementHeight}px`,
                    }}
                  />
                );
              })}

              {/* Current time indicator */}
              {isToday(selectedDate) && (
                <div 
                  className="absolute left-0 right-0 border-t-2 border-primary z-10"
                  style={{
                    top: `${((getHours(new Date()) - startHour) * 60 + getMinutes(new Date())) * (hourHeight / 60)}px`
                  }}
                >
                  <div className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-primary" />
                </div>
              )}

              {/* Events */}
              {events.map(event => {
                const isBeingDragged = draggingEvent?._id === event._id;
                const startTime = new Date(event.startTime);
                const endTime = new Date(event.endTime);
                const ghostStartTime = dragEventTimes.start || startTime;
                const ghostEndTime = dragEventTimes.end || endTime;
                
                // Calculate positions
                const minutesFromStart = (getHours(startTime) - startHour) * 60 + getMinutes(startTime);
                const top = (minutesFromStart * hourHeight) / 60;
                const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
                const height = (duration * hourHeight) / 60;

                // Calculate ghost preview position
                const ghostMinutesFromStart = (getHours(ghostStartTime) - startHour) * 60 + getMinutes(ghostStartTime);
                const ghostTop = (ghostMinutesFromStart * hourHeight) / 60;

                return (
                  <React.Fragment key={event._id}>
                    {/* Ghost preview when dragging */}
                    {isBeingDragged && (
                      <div
                        className={cn(
                          "absolute left-1 right-1 rounded-md border-2 border-dashed border-primary/50",
                          "bg-primary/5 pointer-events-none"
                        )}
                        style={{
                          top: `${Math.round(dragPosition.y)}px`,
                          height: `${Math.max(incrementHeight, Math.round(height))}px`,
                          zIndex: 48
                        }}
                      />
                    )}
                    
                    {/* Actual event */}
                    <motion.div
                      className={cn(
                        "absolute left-1 right-1 rounded-md bg-primary/20 border border-primary p-2",
                        "hover:bg-primary/30 hover:shadow-lg transition-colors",
                        isBeingDragged ? "cursor-grabbing z-50 shadow-lg" : "cursor-grab"
                      )}
                      style={{
                        top: isBeingDragged ? 
                          `${Math.round(smoothPosition.y)}px` :
                          `${Math.round(top)}px`,
                        height: `${Math.max(incrementHeight, Math.round(height))}px`,
                        opacity: isBeingDragged ? 0.8 : 1,
                        transform: 'none'
                      }}
                      initial={false}
                      dragSnapToOrigin={false}
                      dragElastic={0}
                      dragMomentum={false}
                      drag={isBeingDragged ? false : "y"}
                      onPointerDown={(e) => handleEventDragStart(event, e as any)}
                      onPointerMove={(e) => isBeingDragged && handleEventDrag(event, e as any)}
                      onPointerUp={(e) => isBeingDragged && handleEventDragEnd(e as any)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-sm font-medium truncate">{event.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {format(isBeingDragged ? ghostStartTime : startTime, 'h:mm a')} - 
                        {format(isBeingDragged ? ghostEndTime : endTime, 'h:mm a')}
                      </div>
                      {/* Resize handles */}
                      <div
                        className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-primary/20"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setResizingEvent(event);
                        }}
                        onMouseUp={() => setResizingEvent(null)}
                        onMouseMove={(e) => resizingEvent && handleEventResize(event, e, 'top')}
                      />
                      <div
                        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-primary/20"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setResizingEvent(event);
                        }}
                        onMouseUp={() => setResizingEvent(null)}
                        onMouseMove={(e) => resizingEvent && handleEventResize(event, e, 'bottom')}
                      />
                    </motion.div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 