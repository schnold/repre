"use client";

import React from "react";
import { useCalendarStore } from "@/store/calendar-store";
import { useTeacherStore } from "@/store/teacher-store";

export default function RepresentationOverview() {
  const { events } = useCalendarStore();
  const { teachers } = useTeacherStore();

  // Filter events that have a substituteTeacherId
  const substitutionEvents = events.filter((e) => e.substituteTeacherId);

  const getTeacherName = (teacherId: string | undefined) => {
    if (!teacherId) return "(none)";
    const t = teachers.find((tt) => tt.id === teacherId);
    return t ? t.name : "(unknown)";
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Representation (Substitution) Plan</h1>
      {substitutionEvents.length === 0 ? (
        <p className="text-sm text-muted-foreground">No substitutions scheduled.</p>
      ) : (
        <div className="space-y-2">
          {substitutionEvents.map((event) => (
            <div key={event.id} className="p-3 border rounded-md bg-background shadow-sm">
              <p className="font-medium text-sm">Lesson: {event.title}</p>
              <p className="text-xs">
                Original Teacher: <strong>{getTeacherName(event.teacherId)}</strong>
              </p>
              <p className="text-xs">
                Substitute: <strong>{getTeacherName(event.substituteTeacherId)}</strong>
              </p>
              {/* You can format the date/time with date-fns or similar */}
              <p className="text-xs">
                {`${event.startTime.toLocaleString()} - ${event.endTime.toLocaleString()}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
