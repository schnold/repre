// /src/components/calendar/UpcomingEventsTab.tsx
"use client"

import React, { useMemo } from "react"
import { useCalendarStore } from "@/store/calendar-store"
import { useTeacherStore } from "@/store/teacher-store"
import { CalendarEvent } from "@/lib/types/calendar"
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast"

/**
 * The "Events" tab that shows upcoming events
 * for the current view, grouped or sorted by subject.
 */
export default function UpcomingEventsTab() {
  const { getFilteredEvents, currentView, deleteEvent, addEvent, setSelectedEventId, setModalMode, setEventModalOpen } = useCalendarStore()
  const { teachers } = useTeacherStore()

  // all events currently visible in the calendar (respecting filters, dateRange, etc.)
  const events = getFilteredEvents().map(evt => ({
    ...evt,
    id: evt._id || crypto.randomUUID(),
    startTime: new Date(evt.startTime),
    endTime: new Date(evt.endTime)
  }));

  const handleEditEvent = (event: any) => {
    setSelectedEventId(event.id);
    setModalMode('edit');
    setEventModalOpen(true);
  };

  const handleDeleteEvent = async (event: any) => {
    try {
      // Delete from database
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      // Delete from frontend state
      deleteEvent(event.id);

      toast({
        title: "Event Deleted",
        description: "Successfully deleted event",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  // Sort or group by "subject"
  // - we'll assume each teacher has 1+ subjects, we can pick the first subject, or
  //   if no teacher is assigned, group under "No Teacher/Subject"
  const groupedBySubject = useMemo(() => {
    const subjectMap: Record<string, CalendarEvent[]> = {}

    events.forEach(evt => {
      let subjectKey = "No Teacher/Subject"

      if (evt.teacher) {
        const teacher = teachers.find(t => t.id === evt.teacher)
        if (teacher && teacher.subjects.length > 0) {
          subjectKey = teacher.subjects[0] // take first subject
        }
      }
      if (!subjectMap[subjectKey]) subjectMap[subjectKey] = []
      subjectMap[subjectKey].push(evt)
    })

    // Sort each subject group by startTime ascending
    for (const subj in subjectMap) {
      subjectMap[subj].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    }

    return subjectMap
  }, [events, teachers])

  // Render
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold mb-2">Upcoming Events ({currentView} View)</h2>
      {Object.entries(groupedBySubject).map(([subject, subjectEvents]) => (
        <div key={subject} className="mb-4">
          <h3 className="font-medium text-sm text-muted-foreground mb-1">
            {subject}
          </h3>
          <div className="space-y-1">
            {subjectEvents.map(evt => (
              <div
                key={evt.id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors text-sm group"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{evt.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(evt.startTime).toLocaleString()} - {new Date(evt.endTime).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  {evt.color && (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: evt.color }}
                      title="Event Color"
                    />
                  )}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleEditEvent(evt)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      onClick={() => handleDeleteEvent(evt)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}