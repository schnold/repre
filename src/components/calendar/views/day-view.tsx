"use client"

import { useState, useRef, useEffect } from "react";
import { useCalendarStore } from "@/store/calendar-store";
import { cn } from "@/lib/utils";
import { defaultColors } from "@/lib/constants";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock, Edit2, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { EventMenu } from "@/components/calendar/events/event-menu";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES_PER_INTERVAL = 5;
const INTERVALS_PER_HOUR = 60 / MINUTES_PER_INTERVAL;
const ZOOM_LEVELS = [30, 60, 120, 240]; // minutes per row
const EVENT_WIDTH = 200; // Width of each event in pixels
const EVENT_GAP = 10; // Gap between events in pixels

export default function DayView() {
  const [zoomLevel, setZoomLevel] = useState(60);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ time: number; y: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { events, addEvent, deleteEvent, setSelectedEventId, setEventModalOpen, setModalMode } = useCalendarStore();

  // Pan and zoom state
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setScale(prev => Math.min(Math.max(prev * delta, 0.5), 2));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const getTimeFromY = (y: number): number => {
    const grid = gridRef.current;
    if (!grid) return 0;

    const rect = grid.getBoundingClientRect();
    const relativeY = y - rect.top;
    const gridHeight = rect.height;
    const minutesPerPixel = (24 * 60) / gridHeight;
    const minutes = relativeY * minutesPerPixel;

    // Snap to MINUTES_PER_INTERVAL
    return Math.max(0, Math.min(24 * 60 - MINUTES_PER_INTERVAL, 
      Math.round(minutes / MINUTES_PER_INTERVAL) * MINUTES_PER_INTERVAL
    ));
  };

  const handleDragStart = (e: React.MouseEvent, time: number) => {
    const snappedTime = getTimeFromY(e.clientY);
    setIsDragging(true);
    setDragStart({ time: snappedTime, y: e.clientY });
    setDragEnd(snappedTime);
  };

  const handleDragMove = (e: React.MouseEvent) => {
    const time = getTimeFromY(e.clientY);
    setHoverTime(time);

    if (!isDragging || !dragStart) return;
    setDragEnd(time);

    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
  };

  const handleDragEnd = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart || !dragEnd) return;

    const startTime = new Date();
    const startMinutes = Math.min(dragStart.time, dragEnd);
    const endMinutes = Math.max(dragStart.time, dragEnd);
    
    startTime.setHours(Math.floor(startMinutes / 60));
    startTime.setMinutes(startMinutes % 60);

    const endTime = new Date(startTime);
    endTime.setHours(Math.floor(endMinutes / 60));
    endTime.setMinutes(endMinutes % 60);

    if (startTime < endTime) {
      addEvent({
        title: 'New Event',
        startTime,
        endTime,
        category: 'work',
        color: defaultColors[0].value
      });
    }

    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
    if (containerRef.current) {
      containerRef.current.style.cursor = 'default';
    }
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
    if (!isDragging) {
      setDragEnd(null);
    }
  };

  // Layout events in columns
  const layoutEvents = (events: any[]) => {
    const columns: any[][] = [];
    
    // Sort events by start time
    const sortedEvents = [...events].sort((a, b) => {
      const aStart = a.startTime.getHours() * 60 + a.startTime.getMinutes();
      const bStart = b.startTime.getHours() * 60 + b.startTime.getMinutes();
      return aStart - bStart;
    });

    // Place each event in the first available column
    sortedEvents.forEach(event => {
      const eventStart = event.startTime.getHours() * 60 + event.startTime.getMinutes();
      const eventEnd = event.endTime.getHours() * 60 + event.endTime.getMinutes();

      let columnIndex = 0;
      let placed = false;

      while (!placed) {
        if (!columns[columnIndex]) {
          columns[columnIndex] = [event];
          placed = true;
        } else {
          const hasOverlap = columns[columnIndex].some(existingEvent => {
            const existingStart = existingEvent.startTime.getHours() * 60 + existingEvent.startTime.getMinutes();
            const existingEnd = existingEvent.endTime.getHours() * 60 + existingEvent.endTime.getMinutes();
            return !(eventEnd <= existingStart || eventStart >= existingEnd);
          });

          if (!hasOverlap) {
            columns[columnIndex].push(event);
            placed = true;
          } else {
            columnIndex++;
          }
        }
      }
    });

    return columns;
  };

  // Generate time intervals
  const timeIntervals = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let interval = 0; interval < INTERVALS_PER_HOUR; interval++) {
      const minutes = interval * MINUTES_PER_INTERVAL;
      timeIntervals.push({
        hour,
        minutes,
        label: `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      });
    }
  }

  const eventColumns = layoutEvents(events);

  const formatMinutes = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleEditEvent = (event: any) => {
    setSelectedEventId(event.id);
    setModalMode('edit');
    setEventModalOpen(true);
  };

  const handleDeleteEvent = (event: any) => {
    deleteEvent(event.id);
  };

  const handleUpdateEvent = (eventId: string, updates: Partial<any>) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const updatedEvent = {
      ...event,
      ...updates
    };
    
    deleteEvent(eventId);
    addEvent(updatedEvent);
  };

  return (
    <div 
      ref={containerRef}
      className="h-full overflow-auto relative"
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleMouseLeave}
    >
      <div className="sticky top-0 z-20 flex justify-between p-2 bg-background/95 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Zoom:</span>
          <select 
            value={zoomLevel}
            onChange={(e) => setZoomLevel(Number(e.target.value))}
            className="text-sm border rounded p-1"
          >
            {ZOOM_LEVELS.map(level => (
              <option key={level} value={level}>{level}min</option>
            ))}
          </select>
        </div>
        <div className="text-sm text-muted-foreground">
          Scale: {Math.round(scale * 100)}%
          {hoverTime !== null && ` • ${formatMinutes(hoverTime)}`}
        </div>
      </div>

      <motion.div 
        className="relative grid grid-cols-[60px_1fr] gap-2"
        style={{ 
          height: `${24 * (60 / zoomLevel) * 60 * scale}px`,
          transform: `translateY(${scrollPosition.y}px)`
        }}
      >
        {/* Time labels */}
        <div className="space-y-2">
          {timeIntervals.map(interval => (
            <div 
              key={`${interval.hour}-${interval.minutes}`}
              className="sticky left-0 h-[12px] text-xs text-muted-foreground flex items-center justify-end pr-2"
              style={{ 
                height: `${(60 / zoomLevel) * 12 * scale}px`,
                opacity: interval.minutes === 0 ? 1 : 0.5
              }}
            >
              {interval.minutes === 0 && interval.label}
            </div>
          ))}
        </div>

        {/* Time slots with grid lines */}
        <div ref={gridRef} className="relative">
          {timeIntervals.map(interval => (
            <div
              key={`${interval.hour}-${interval.minutes}`}
              className={cn(
                "absolute w-full transition-colors",
                interval.minutes === 0 ? "border-t border-border" : "border-t border-border/30",
                (hoverTime === interval.hour * 60 + interval.minutes) && "bg-primary/5"
              )}
              style={{
                top: `${(interval.hour * 60 + interval.minutes) * (60 / zoomLevel) * scale}px`,
                height: `${(60 / zoomLevel) * 12 * scale}px`
              }}
              onMouseDown={(e) => handleDragStart(e, interval.hour * 60 + interval.minutes)}
            />
          ))}

          {/* Snap indicators */}
          {(hoverTime !== null || dragEnd !== null) && (
            <div 
              className="absolute left-0 w-full border-t-2 border-primary/50 z-10 pointer-events-none"
              style={{
                top: `${((dragEnd ?? hoverTime ?? 0) * (60 / zoomLevel)) * scale}px`
              }}
            />
          )}

          {/* Current time indicator */}
          <div 
            className="absolute w-full border-t-2 border-red-500 z-10"
            style={{
              top: `${(new Date().getHours() * 60 + new Date().getMinutes()) * (60 / zoomLevel) * scale}px`
            }}
          />

          {/* Events */}
          {eventColumns.map((column, columnIndex) => (
            <div
              key={columnIndex}
              className="absolute top-0 bottom-0"
              style={{
                left: `${columnIndex * (EVENT_WIDTH + EVENT_GAP)}px`,
                width: `${EVENT_WIDTH}px`
              }}
            >
              {column.map(event => {
                const startMinutes = event.startTime.getHours() * 60 + event.startTime.getMinutes();
                const endMinutes = event.endTime.getHours() * 60 + event.endTime.getMinutes();
                const duration = endMinutes - startMinutes;

                return (
                  <DropdownMenu key={event.id}>
                    <DropdownMenuTrigger asChild>
                      <motion.div
                        className="absolute rounded-md p-2 bg-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors"
                        style={{
                          top: `${startMinutes * (60 / zoomLevel) * scale}px`,
                          height: `${duration * (60 / zoomLevel) * scale}px`,
                          width: `${EVENT_WIDTH}px`,
                          backgroundColor: event.color || defaultColors[0].value
                        }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <div className="text-sm font-medium truncate">{event.title}</div>
                        <div className="text-xs opacity-75">
                          {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                          {event.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </motion.div>
                    </DropdownMenuTrigger>
                    <EventMenu 
                      event={event}
                      onUpdate={handleUpdateEvent}
                      onDelete={handleDeleteEvent}
                    />
                  </DropdownMenu>
                );
              })}
            </div>
          ))}

          {/* Drag selection indicator */}
          {isDragging && dragStart && dragEnd && (
            <motion.div
              className="absolute left-0 right-0 bg-primary/10 border-2 border-primary/30 pointer-events-none"
              style={{
                top: `${(Math.min(dragStart.time, dragEnd) * (60 / zoomLevel)) * scale}px`,
                height: `${(Math.abs(dragEnd - dragStart.time) * (60 / zoomLevel)) * scale}px`
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}