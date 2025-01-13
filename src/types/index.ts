export interface Position {
  x: number;
  y: number;
  time: Date;
  column: number;
  snappedY: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  teacherId: string;
  subjectId: string;
  color: string;
  position: Position;
  duration: number;
}

export interface DragState {
  position: Position;
  duration: number;
  event?: CalendarEvent;
} 