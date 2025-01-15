"use client"

import { useState, useRef, useEffect } from "react";
import { useCalendarStore } from "@/store/calendar-store";
import { useSchedule } from "@/hooks/use-schedule";
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

  const [dragMode, setDragMode] = useState<'create' | 'resize-start' | 'resize-end' | 'move' | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<any | null>(null);
  const [resizeHandleSize] = useState(6);

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
    e.stopPropagation();
    const snappedTime = getTimeFromY(e.clientY);
    setIsDragging(true);
    setDragMode('create');
    setDragStart({ time: snappedTime, y: e.clientY });
    setDragEnd(snappedTime);
  };

  const handleEventDragStart = (e: React.MouseEvent, event: any) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const isTopHandle = e.clientY - rect.top <= resizeHandleSize;
    const isBottomHandle = rect.bottom - e.clientY <= resizeHandleSize;

    setDraggedEvent(event);
    setIsDragging(true);

    if (isTopHandle) {
      setDragMode('resize-start');
      const startMinutes = event.startTime.getHours() * 60 + event.startTime.getMinutes();
      setDragStart({ time: startMinutes, y: e.clientY });
      setDragEnd(startMinutes);
    } else if (isBottomHandle) {
      setDragMode('resize-end');
      const endMinutes = event.endTime.getHours() * 60 + event.endTime.getMinutes();
      setDragStart({ time: endMinutes, y: e.clientY });
      setDragEnd(endMinutes);
    } else {
      setDragMode('move');
      const startMinutes = event.startTime.getHours() * 60 + event.startTime.getMinutes();
      setDragStart({ time: startMinutes, y: e.clientY });
      setDragEnd(startMinutes);
    }
  };

  const handleDragMove = (e: React.MouseEvent) => {
    e.stopPropagation();
    const time = getTimeFromY(e.clientY);
    setHoverTime(time);

    if (!isDragging || !dragStart) return;
    setDragEnd(time);

    if (containerRef.current) {
      containerRef.current.style.cursor = dragMode === 'move' ? 'grabbing' : 'ns-resize';
    }
  };

  const handleDragEnd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging || !dragStart || !dragEnd) return;

    if (dragMode === 'create') {
      const startMinutes = Math.min(dragStart.time, dragEnd);
      const endMinutes = Math.max(dragStart.time, dragEnd);
      
      const startTime = new Date();
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
          color: defaultColors[0].value,
          scheduleId: useSchedule()?.selectedSchedule?._id || '',
          status: 'active',
          createdBy: '',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    } else if (draggedEvent && (dragMode === 'resize-start' || dragMode === 'resize-end' || dragMode === 'move')) {
      const duration = draggedEvent.endTime.getTime() - draggedEvent.startTime.getTime();
      let newStartTime = new Date(draggedEvent.startTime);
      let newEndTime = new Date(draggedEvent.endTime);

      if (dragMode === 'resize-start') {
        const startMinutes = Math.min(dragEnd, draggedEvent.endTime.getHours() * 60 + draggedEvent.endTime.getMinutes() - MINUTES_PER_INTERVAL);
        newStartTime.setHours(Math.floor(startMinutes / 60));
        newStartTime.setMinutes(startMinutes % 60);
      } else if (dragMode === 'resize-end') {
        const endMinutes = Math.max(dragEnd, draggedEvent.startTime.getHours() * 60 + draggedEvent.startTime.getMinutes() + MINUTES_PER_INTERVAL);
        newEndTime.setHours(Math.floor(endMinutes / 60));
        newEndTime.setMinutes(endMinutes % 60);
      } else if (dragMode === 'move') {
        const startMinutes = dragEnd;
        newStartTime.setHours(Math.floor(startMinutes / 60));
        newStartTime.setMinutes(startMinutes % 60);
        newEndTime = new Date(newStartTime.getTime() + duration);
      }

      if (newStartTime < newEndTime) {
        const updatedEvent = {
          ...draggedEvent,
          startTime: newStartTime,
          endTime: newEndTime
        };
        deleteEvent(draggedEvent.id);
        addEvent(updatedEvent);
      }
    }

    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
    setDraggedEvent(null);
    setDragMode(null);
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
    const event = events.find(e => e._id === eventId);
    if (!event) return;

    const updatedEvent = {
      ...event,
      ...updates
    };
    
    deleteEvent(eventId);
    addEvent(updatedEvent);
  };

  return (
    <div className="h-full flex flex-col">
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

      <div className="flex-1 min-h-0 flex">
        {/* Fixed time labels */}
        <div className="w-[60px] flex-shrink-0 bg-background border-r">
          {timeIntervals.map(interval => (
            <div 
              key={`${interval.hour}-${interval.minutes}`}
              className="sticky h-[12px] text-xs text-muted-foreground flex items-center justify-end pr-2"
              style={{ 
                height: `${(60 / zoomLevel) * 12 * scale}px`,
                opacity: interval.minutes === 0 ? 1 : 0.5
              }}
            >
              {interval.minutes === 0 && interval.label}
            </div>
          ))}
        </div>

        {/* Scrollable grid area */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-auto relative"
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div 
            ref={gridRef}
            className="relative"
            style={{ 
              height: `${24 * (60 / zoomLevel) * 60 * scale}px`,
              minWidth: "100%"
            }}
          >
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
                className="absolute inset-0"
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
                          className={cn(
                            "absolute rounded-md p-2 cursor-pointer transition-all",
                            "hover:ring-2 hover:ring-primary hover:z-10",
                            isDragging && draggedEvent?.id === event.id && "ring-2 ring-primary z-20 opacity-90",
                            dragMode === 'move' && "cursor-grabbing",
                            (dragMode === 'resize-start' || dragMode === 'resize-end') && "cursor-ns-resize"
                          )}
                          style={{
                            top: `${startMinutes * (60 / zoomLevel) * scale}px`,
                            height: `${duration * (60 / zoomLevel) * scale}px`,
                            width: `${EVENT_WIDTH}px`,
                            backgroundColor: event.color || defaultColors[0].value
                          }}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onMouseDown={(e) => handleEventDragStart(e, event)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Resize handles */}
                          <div 
                            className="absolute top-0 left-0 w-full h-1.5 cursor-ns-resize hover:bg-primary/20"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handleEventDragStart(e, event);
                            }}
                          />
                          <div 
                            className="absolute bottom-0 left-0 w-full h-1.5 cursor-ns-resize hover:bg-primary/20"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handleEventDragStart(e, event);
                            }}
                          />
                          
                          <div className="text-sm font-medium truncate">{event.title}</div>
                          <div className="text-xs opacity-75">
                            {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                            {event.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </motion.div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuLabel>Event Options</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleEditEvent(event)}
                          className="flex items-center"
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit Event
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteEvent(event)}
                          className="flex items-center text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Event
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                })}
              </div>
            ))}

            {/* Drag selection indicator */}
            {isDragging && dragStart && dragEnd && dragMode === 'create' && (
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
          </motion.div>
        </div>
      </div>
    </div>
  );
}