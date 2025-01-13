"use client";

import { Teacher, Subject } from '@/hooks/use-calendar-data';
import { cn } from '@/lib/utils';

interface CalendarLegendProps {
  teachers: Teacher[];
  subjects: Subject[];
  onTeacherClick?: (teacherId: string) => void;
  onSubjectClick?: (subjectId: string) => void;
}

export function CalendarLegend({
  teachers,
  subjects,
  onTeacherClick,
  onSubjectClick
}: CalendarLegendProps) {
  return (
    <div className="p-4 space-y-6">
      {/* Teachers Section */}
      <div>
        <h3 className="font-medium mb-2">Teachers</h3>
        <div className="space-y-2">
          {teachers.map((teacher) => (
            <button
              key={teacher.id}
              onClick={() => onTeacherClick?.(teacher.id)}
              className={cn(
                "w-full flex items-center gap-2 p-2 rounded-md",
                "hover:bg-accent transition-colors",
                "text-left text-sm"
              )}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: teacher.color }}
              />
              <span className="truncate">{teacher.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Subjects Section */}
      <div>
        <h3 className="font-medium mb-2">Subjects</h3>
        <div className="space-y-2">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => onSubjectClick?.(subject.id)}
              className={cn(
                "w-full flex items-center gap-2 p-2 rounded-md",
                "hover:bg-accent transition-colors",
                "text-left text-sm"
              )}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: subject.color }}
              />
              <span className="truncate">{subject.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 