import { useState, useCallback } from 'react';
import { addMinutes } from 'date-fns';
import { CalendarEvent, DragState, Position } from '@/types';

export function useCalendarEvents(
  events: CalendarEvent[],
  onEventUpdate: (event: CalendarEvent) => void,
  onEventCreate: (event: Partial<CalendarEvent>) => void
) {
  const [dragState, setDragState] = useState<DragState | null>(null);

  const handleDragStart = useCallback((position: Position) => {
    setDragState({
      position,
      duration: 30, // Default 30 minutes duration
    });
  }, []);

  const handleDragMove = useCallback((position: Position) => {
    if (!dragState) return;

    setDragState(prev => {
      if (!prev) return null;

      const duration = Math.max(
        15, // Minimum 15 minutes
        Math.round(
          (position.snappedY - prev.position.snappedY) / 40 + prev.duration
        )
      );

      return {
        ...prev,
        position,
        duration
      };
    });
  }, [dragState]);

  const handleDragEnd = useCallback(() => {
    if (!dragState) return;

    const { position, duration } = dragState;
    const endTime = addMinutes(position.time, duration);

    onEventCreate({
      startTime: position.time,
      endTime,
      position,
      duration
    });

    setDragState(null);
  }, [dragState, onEventCreate]);

  return {
    dragState,
    handleDragStart,
    handleDragMove,
    handleDragEnd
  };
} 