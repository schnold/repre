import React from 'react';
import { cn } from "@/lib/utils";
import { MoreHorizontal, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCategory } from '@/lib/types/calendar';

interface TimelineCardProps {
  title: string;
  startTime: string;
  endTime: string;
  location?: string;
  category: EventCategory;
  description?: string;
  className?: string;
  isDragging?: boolean;
  style?: React.CSSProperties;
}

const TimelineCard: React.FC<TimelineCardProps> = ({
  title,
  startTime,
  endTime,
  location,
  category,
  description,
  className,
  isDragging,
  style,
  ...props
}) => {
  const categoryColors: Record<EventCategory, string> = {
    work: 'bg-blue-100 dark:bg-blue-900',
    personal: 'bg-green-100 dark:bg-green-900',
    important: 'bg-red-100 dark:bg-red-900',
    other: 'bg-gray-100 dark:bg-gray-900'
  };

  return (
    <div
      className={cn(
        "group relative p-3 rounded-lg border transition-all",
        categoryColors[category],
        isDragging && "shadow-lg ring-2 ring-primary",
        className
      )}
      style={{
        ...style,
        cursor: 'grab'
      }}
      {...props}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{title}</h3>
          <div className="mt-1 flex flex-col gap-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              <span>{startTime} - {endTime}</span>
            </div>
            {location && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-1 h-3 w-3" />
                <span className="truncate">{location}</span>
              </div>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
      )}
    </div>
  );
};

export default TimelineCard;