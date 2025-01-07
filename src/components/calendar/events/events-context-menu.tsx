import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash, Copy } from "lucide-react";
import { useCalendarStore } from "@/store/calendar-store";

interface EventContextMenuProps {
  eventId: string;
}

const EventContextMenu: React.FC<EventContextMenuProps> = ({ eventId }) => {
  const { 
    deleteEvent, 
    duplicateEvent, 
    setSelectedEventId, 
    setModalMode, 
    setEventModalOpen 
  } = useCalendarStore();

  const handleEdit = () => {
    setSelectedEventId(eventId);
    setModalMode('edit');
    setEventModalOpen(true);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent(eventId);
    }
  };

  const handleDuplicate = () => {
    duplicateEvent(eventId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDuplicate} className="cursor-pointer">
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleDelete} 
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EventContextMenu;