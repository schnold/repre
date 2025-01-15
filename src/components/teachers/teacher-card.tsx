"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Mail, 
  Phone, 
  ChevronDown, 
  ChevronUp,
  Clock,
  Timer,
  Calendar as CalendarIcon,
  Edit
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { cn } from "@/lib/utils";
import { TeacherModal } from "@/components/calendar/teachers/teacher-modal";
import { Types } from 'mongoose';

interface TeacherCardProps {
  teacher: {
    _id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    subjects: string[];
    status: 'active' | 'inactive' | 'substitute';
    color: string;
    maxHoursPerDay: number;
    maxHoursPerWeek: number;
    availability: {
      dayOfWeek: number;
      timeSlots: { start: string; end: string }[];
    }[];
    preferences: {
      consecutiveHours: number;
      breakDuration: number;
      preferredDays: number[];
    };
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    createdBy?: string;
  };
  onUpdate?: () => void;
}

export function TeacherCard({ teacher, onUpdate }: TeacherCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const statusColors = {
    active: "bg-green-500",
    inactive: "bg-gray-500",
    substitute: "bg-yellow-500"
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <>
      <Card className={`
        transition-all duration-200 ease-in-out
        ${expanded ? 'col-span-2 row-span-2' : 'col-span-1'}
        border-l-4
      `}
      style={{ borderLeftColor: teacher.color }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-lg">{teacher.name}</h3>
            <Badge className={cn(statusColors[teacher.status])}>
              {teacher.status}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Basic Info - Always Visible */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{teacher.email}</span>
            </div>
            {teacher.phoneNumber && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{teacher.phoneNumber}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-1 mt-2">
              {teacher.subjects.map(subject => (
                <Badge 
                  key={subject} 
                  variant="secondary"
                  style={{ backgroundColor: teacher.color, color: '#fff' }}
                >
                  {subject}
                </Badge>
              ))}
            </div>
          </div>

          {/* Extended Info - Visible when expanded */}
          {expanded && (
            <div className="mt-4 space-y-4 border-t pt-4">
              {/* Hours and Preferences */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    Hours
                  </h4>
                  <div className="text-sm space-y-1">
                    <p>Max per day: {teacher.maxHoursPerDay}h</p>
                    <p>Max per week: {teacher.maxHoursPerWeek}h</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Preferences
                  </h4>
                  <div className="text-sm space-y-1">
                    <p>Consecutive: {teacher.preferences.consecutiveHours}h</p>
                    <p>Break: {teacher.preferences.breakDuration}min</p>
                  </div>
                </div>
              </div>

              {/* Weekly Availability */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Weekly Availability
                </h4>
                <div className="grid gap-2">
                  {weekDays.map((day, index) => {
                    const daySchedule = teacher.availability.find(
                      a => a.dayOfWeek === index + 1
                    );
                    
                    return (
                      <div key={day} className="flex items-center gap-2">
                        <span className="w-24 text-sm font-medium">{day}</span>
                        <div className="flex flex-wrap gap-2">
                          {daySchedule?.timeSlots.length === 0 ? (
                            <span className="text-sm text-muted-foreground">No availability set</span>
                          ) : (
                            daySchedule?.timeSlots.map((slot) => (
                              <Badge key={`${slot.start}-${slot.end}`} variant="outline">
                                <Clock className="h-3 w-3 mr-1" />
                                {slot.start} - {slot.end}
                              </Badge>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Metadata */}
              <div className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                <p>Created {formatDistanceToNow(new Date(teacher.createdAt))} ago</p>
                <p>Last updated {formatDistanceToNow(new Date(teacher.updatedAt))} ago</p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm">
                  View Schedule
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isEditModalOpen && (
        <TeacherModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
          }}
          organizationId={teacher.organizationId}
          onSuccess={() => {
            if (onUpdate) onUpdate();
            setIsEditModalOpen(false);
          }}
          teacher={{
            ...teacher,
            _id: new Types.ObjectId(teacher._id),
            organizationId: new Types.ObjectId(teacher.organizationId),
            createdAt: new Date(teacher.createdAt),
            updatedAt: new Date(teacher.updatedAt),
            createdBy: teacher.createdBy || 'unknown',
          }}
        />
      )}
    </>
  );
} 