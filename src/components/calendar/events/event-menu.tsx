"use client"

import { Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { format, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { defaultColors } from "@/lib/constants";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";

interface EventMenuProps {
  event: any;
  onUpdate: (eventId: string, updates: Partial<any>) => void;
  onDelete: (event: any) => void;
}

export function EventMenu({ event, onUpdate, onDelete }: EventMenuProps) {
  const { toast } = useToast();

  const handleDateTimeUpdate = (field: 'startTime' | 'endTime', newDate: Date) => {
    if (!isValid(newDate)) {
      toast({
        title: "Invalid date",
        variant: "destructive",
      });
      return;
    }

    // Ensure start time is before end time
    const otherField = field === 'startTime' ? 'endTime' : 'startTime';
    const otherTime = event[otherField];
    
    if (field === 'startTime' && newDate > event.endTime) {
      toast({
        title: "Start time must be before end time",
        variant: "destructive",
      });
      return;
    }

    if (field === 'endTime' && newDate < event.startTime) {
      toast({
        title: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }

    onUpdate(event.id, { [field]: newDate });
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      const newDate = new Date(event[field]);
      newDate.setHours(hours);
      newDate.setMinutes(minutes);

      handleDateTimeUpdate(field, newDate);
    } catch (error) {
      toast({
        title: "Please enter a valid time in HH:MM format",
        variant: "destructive",
      });
    }
  };

  const formatEventTime = (date: Date) => {
    try {
      return format(date, "HH:mm");
    } catch {
      return "00:00";
    }
  };

  const formatEventDate = (date: Date) => {
    try {
      return format(date, "PPP");
    } catch {
      return "Invalid date";
    }
  };

  return (
    <DropdownMenuContent className="w-80 bg-slate-800/70 backdrop-blur-md p-2">
      <DropdownMenuLabel>Edit Event</DropdownMenuLabel>
      <div className="p-2 space-y-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input 
            value={event.title} 
            onChange={(e) => onUpdate(event.id, { title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Start Time</Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatEventDate(event.startTime)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={event.startTime}
                  onSelect={(date) => date && handleDateTimeUpdate('startTime', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Input 
              type="time"
              value={formatEventTime(event.startTime)}
              onChange={(e) => handleTimeChange('startTime', e.target.value)}
              className="w-[120px]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>End Time</Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatEventDate(event.endTime)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={event.endTime}
                  onSelect={(date) => date && handleDateTimeUpdate('endTime', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Input 
              type="time"
              value={formatEventTime(event.endTime)}
              onChange={(e) => handleTimeChange('endTime', e.target.value)}
              className="w-[120px]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Color</Label>
          <div className="flex gap-2">
            {defaultColors.map(color => (
              <button
                key={color.value}
                className={cn(
                  "w-6 h-6 rounded-full",
                  event.color === color.value && "ring-2 ring-primary ring-offset-2"
                )}
                style={{ backgroundColor: color.value }}
                onClick={() => onUpdate(event.id, { color: color.value })}
              />
            ))}
          </div>
        </div>
      </div>

      <DropdownMenuSeparator />
      
      <DropdownMenuItem 
        onClick={() => onDelete(event)}
        className="text-destructive focus:text-destructive"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
} 