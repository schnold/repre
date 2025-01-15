import { Document, Types } from 'mongoose';

// Admin Interface
export interface IAdmin {
  _id: Types.ObjectId;
  name: string;
  email: string;
  settings: {
    timeZone: string;
    notificationPreferences: {
      immediateUpdates: boolean;
      dailyDigest: boolean;
      weeklyDigest: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

// Organization Interface
export interface IOrganization {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  adminId: Types.ObjectId; // Reference to Admin
  settings: {
    timeZone: string;
    workingHours: {
      start: string;
      end: string;
    };
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
  organizationId: Types.ObjectId;
  createdBy: string;
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
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
  scheduleId: Types.ObjectId; // Reference to Schedule
  teacherId: Types.ObjectId; // Reference to Teacher
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

// Organization-Teacher Assignment Interface
export interface IOrganizationTeacher {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  teacherId: Types.ObjectId;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
} 