import { useState, useCallback } from 'react';
import { addMinutes, setMinutes, setHours, startOfDay } from 'date-fns';

export interface TimeGridConfig {
  minTimeIncrement: number; // in minutes
  startHour: number;
  endHour: number;
  zoomLevel: number;
  columnCount: number;
  scale: 'minutes' | '5minutes' | '15minutes' | '30minutes' | 'hours';
}

export interface GridPosition {
  time: Date;
  column: number;
  exactY: number;
  snappedY: number;
  isSnapped: boolean;
}

const SCALES = {
  'minutes': { increment: 1, pixelsPerHour: 360 },    // 6px per minute
  '5minutes': { increment: 5, pixelsPerHour: 300 },   // 5px per minute
  '15minutes': { increment: 15, pixelsPerHour: 240 }, // 4px per minute
  '30minutes': { increment: 30, pixelsPerHour: 180 }, // 3px per minute
  'hours': { increment: 60, pixelsPerHour: 120 }      // 2px per minute
} as const;

export function useTimeGrid(initialConfig?: Partial<TimeGridConfig>) {
  const [config, setConfig] = useState<TimeGridConfig>({
    minTimeIncrement: 15,
    startHour: 7,
    endHour: 19,
    zoomLevel: 1.5,
    columnCount: 1,
    scale: '15minutes',
    ...initialConfig
  });

  const getCurrentScale = useCallback(() => {
    const { zoomLevel } = config;
    if (zoomLevel >= 2) return 'minutes';
    if (zoomLevel >= 1.5) return '5minutes';
    if (zoomLevel >= 1) return '15minutes';
    if (zoomLevel >= 0.5) return '30minutes';
    return 'hours';
  }, [config.zoomLevel]);

  const snapTimeToGrid = useCallback((date: Date): Date => {
    const scale = getCurrentScale();
    const increment = SCALES[scale].increment;
    const minutes = date.getMinutes();
    const snappedMinutes = Math.round(minutes / increment) * increment;
    return setMinutes(date, snappedMinutes);
  }, [getCurrentScale]);

  const isValidTime = useCallback((date: Date): boolean => {
    const hour = date.getHours();
    return hour >= config.startHour && hour <= config.endHour;
  }, [config.startHour, config.endHour]);

  const getTimeSlots = useCallback((): Date[] => {
    const slots: Date[] = [];
    const baseDate = startOfDay(new Date());
    const startTime = setHours(baseDate, config.startHour);
    const endTime = setHours(baseDate, config.endHour);
    const scale = getCurrentScale();
    const increment = SCALES[scale].increment;
    
    let currentTime = startTime;
    while (currentTime <= endTime) {
      slots.push(currentTime);
      currentTime = addMinutes(currentTime, increment);
    }
    
    return slots;
  }, [config.startHour, config.endHour, getCurrentScale]);

  const getPixelsPerMinute = useCallback((containerHeight: number): number => {
    const scale = getCurrentScale();
    const pixelsPerHour = SCALES[scale].pixelsPerHour * config.zoomLevel;
    return pixelsPerHour / 60;
  }, [config.zoomLevel, getCurrentScale]);

  const getGridPosition = useCallback((
    y: number,
    containerHeight: number,
    x: number,
    containerWidth: number
  ): GridPosition => {
    const pixelsPerMinute = getPixelsPerMinute(containerHeight);
    const columnWidth = containerWidth / config.columnCount;
    const column = Math.floor(x / columnWidth);
    
    // Calculate exact time from cursor position
    const minutesFromStart = y / pixelsPerMinute;
    const exactTime = addMinutes(
      setHours(startOfDay(new Date()), config.startHour),
      minutesFromStart
    );
    
    // Calculate snapped time
    const snappedTime = snapTimeToGrid(exactTime);
    const snappedY = (
      (snappedTime.getHours() - config.startHour) * 60 + 
      snappedTime.getMinutes()
    ) * pixelsPerMinute;

    return {
      time: snappedTime,
      column: Math.max(0, Math.min(column, config.columnCount - 1)),
      exactY: y,
      snappedY,
      isSnapped: Math.abs(y - snappedY) < 5
    };
  }, [
    config.startHour,
    config.columnCount,
    getPixelsPerMinute,
    snapTimeToGrid
  ]);

  const getColumnWidth = useCallback((containerWidth: number): number => {
    return Math.max(200, containerWidth / config.columnCount); // Minimum column width of 200px
  }, [config.columnCount]);

  const adjustZoom = useCallback((newZoomLevel: number) => {
    setConfig(prev => {
      const zoomLevel = Math.max(0.25, Math.min(3, newZoomLevel)); // Allow higher zoom
      return {
        ...prev,
        zoomLevel,
        scale: getCurrentScale()
      };
    });
  }, [getCurrentScale]);

  const setColumnCount = useCallback((count: number) => {
    setConfig(prev => ({
      ...prev,
      columnCount: Math.max(1, count)
    }));
  }, []);

  return {
    config,
    snapTimeToGrid,
    isValidTime,
    getTimeSlots,
    getGridPosition,
    getColumnWidth,
    adjustZoom,
    setColumnCount,
    getCurrentScale
  };
} 