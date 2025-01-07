import React from 'react';
import { cn } from "@/lib/utils";
import { Clock, MapPin, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  location,
  category,
  description,
  className,
  isDragging,
  style,
  ...props
}) => {
  const categoryStyles: Record<EventCategory, { bg: string, text: string }> = {
    work: { 
      bg: 'bg-blue-100 dark:bg-blue-900/50', 
      text: 'text-blue-700 dark:text-blue-300'
    },
    personal: { 
      bg: 'bg-green-100 dark:bg-green-900/50', 
      text: 'text-green-700 dark:text-green-300'
    },
    important: { 
      bg: 'bg-red-100 dark:bg-red-900/50', 
      text: 'text-red-700 dark:text-red-300'
    },
    other: { 
      bg: 'bg-gray-100 dark:bg-gray-900/50', 
      text: 'text-gray-700 dark:text-gray-300'
    }
  };

  return (
    <div
      className={cn(
        "group relative p-4 rounded-lg border transition-all",
        categoryStyles[category].bg,
        isDragging && "shadow-lg ring-2 ring-primary",
        className
      )}
      style={style}
      {...props}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className={cn("font-medium truncate", categoryStyles[category].text)}>
            {title}
          </h3>
          <div className="mt-1 flex flex-col gap-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-2 h-3 w-3" />
              <span>{startTime}</span>
            </div>
            {location && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-2 h-3 w-3" />
                <span className="truncate">{location}</span>
              </div>
            )}
          </div>
          {description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" align="end">
            <div className="grid gap-1">
              <Button variant="ghost" className="justify-start">
                Edit
              </Button>
              <Button variant="ghost" className="justify-start">
                Delete
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div
        className={cn(
          "absolute left-0 top-0 w-1 h-full rounded-l-lg transition-colors",
          categoryStyles[category].bg,
          "opacity-50"
        )}
      />
    </div>
  );
};

export default TimelineCard;