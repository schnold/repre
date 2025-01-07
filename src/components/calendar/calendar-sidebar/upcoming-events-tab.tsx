// /src/components/calendar/UpcomingEventsTab.tsx
"use client"

import React, { useMemo } from "react"
import { useCalendarStore } from "@/store/calendar-store"
import { useTeacherStore } from "@/store/teacher-store"
import { CalendarEvent } from "@/lib/types/calendar"

/**
 * The "Events" tab that shows upcoming events
 * for the current view, grouped or sorted by subject.
 */
export default function UpcomingEventsTab() {
  const { getFilteredEvents, currentView } = useCalendarStore()
  const { teachers } = useTeacherStore()

  // all events currently visible in the calendar (respecting filters, dateRange, etc.)
  const events = getFilteredEvents()

  // Sort or group by "subject"
  // - we'll assume each teacher has 1+ subjects, we can pick the first subject, or
  //   if no teacher is assigned, group under "No Teacher/Subject"
  const groupedBySubject = useMemo(() => {
    const subjectMap: Record<string, CalendarEvent[]> = {}

    events.forEach(evt => {
      let subjectKey = "No Teacher/Subject"

      if (evt.teacherId) {
        const teacher = teachers.find(t => t.id === evt.teacherId)
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
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors text-sm"
              >
                <div>
                  <div className="font-medium">{evt.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {evt.startTime.toLocaleString()} - {evt.endTime.toLocaleString()}
                  </div>
                </div>
                {evt.color && (
                  <div
                    className="w-3 h-3 rounded-full ml-2"
                    style={{ backgroundColor: evt.color }}
                    title="Event Color"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
