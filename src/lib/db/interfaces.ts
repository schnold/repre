import { Document, Types } from 'mongoose';
import { ISchoolClass, ISubject } from './models/organization';

// Admin Interface
export interface IAdmin {
  _id: Types.ObjectId;
  name: string;
  email: string;
  auth0Id: string;
  selectedOrganizationId?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// Organization Interface
export interface IOrganization {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  classes: ISchoolClass[];
  subjects: ISubject[];
  timeZone: string;
  workingHours: {
    start: string;
    end: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Teacher Interface
export interface ITeacher {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phoneNumber?: string;
  subjects: string[];
  status: 'active' | 'inactive' | 'substitute';
  color: string;
  createdBy: string;
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  organizationIds: Types.ObjectId[]; // Array of Organization IDs for double reference
  availability: {
    dayOfWeek: number;
    timeSlots: Array<{
      start: string;
      end: string;
    }>;
  }[];
  preferences: {
    consecutiveHours: number;
    breakDuration: number;
    preferredDays: number[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Schedule Interface
export interface ISchedule {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  color: string;
  status: 'active' | 'draft' | 'archived';
  organizationId: Types.ObjectId;
  createdBy: string;
  settings?: {
    allowedRooms: string[];
    allowedSubjects: string[];
    maxEventsPerDay?: number;
    minEventDuration?: number;
    maxEventDuration?: number;
    totalWeeklyHours: number;
    subjectHours: {
      subject: string;
      minimumHours: number;
    }[];
  };
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  workingHours?: {
    start?: string;
    end?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Event Interface
export interface IEvent {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  scheduleId: Types.ObjectId;
  teacherId: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'cancelled' | 'completed';
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number; // e.g., every 2 weeks
    daysOfWeek?: number[]; // 0-6 for Sunday-Saturday
    endsOn?: Date;
    count?: number; // number of occurrences
    exceptions?: Date[]; // dates when the event doesn't occur
  };
  parentEventId?: Types.ObjectId; // Reference to the original event if this is a modified instance
  isRecurring: boolean;
  createdAt: Date;
  updatedAt: Date;
} 