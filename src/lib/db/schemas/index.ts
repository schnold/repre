// src/lib/db/schemas/index.ts
import { Schema, model, models, Document, Types } from 'mongoose';

// Common Types
type WorkingHours = {
  start: string;
  end: string;
};

type NotificationStatus = {
  teacher: boolean;
  substitute?: boolean;
  timestamp?: Date;
};

type MetadataRecord = {
    [key: string]: string | number | boolean | null | undefined;
  };

// Organization Schema - Top level entity
export interface IOrganization extends Document {
  name: string;
  type: 'school' | 'district' | 'other';
  settings: {
    timezone: string;
    workingDays: number[];
    defaultWorkingHours: WorkingHours;
    notifications: NotificationSettings;
  };
  subjects: Array<{
    name: string;
    color: string;
    description?: string;
  }>;
  admins: Types.ObjectId[]; // References to users with admin rights
  members: Types.ObjectId[]; // References to all organization members
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Schedule Schema - Belongs to an organization
export interface ISchedule extends Document {
  organizationId: Types.ObjectId;
  name: string;
  academicYear: string;
  term: string;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'active' | 'archived';
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
}

// Event Schema - Belongs to a schedule
export interface IEvent extends Document {
  scheduleId: Types.ObjectId;
  title: string;
  subject: string;
  teacherId: Types.ObjectId;
  substituteId?: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  location?: string;
  status: 'scheduled' | 'cancelled' | 'completed' | 'substituted';
  recurrence?: {
    pattern: 'daily' | 'weekly';
    until: Date;
  };
  createdBy: Types.ObjectId;
  createdAt: Date;
  lastModified: {
    by: Types.ObjectId;
    at: Date;
    reason?: string;
  };
}

// Event History - Tracks all changes to events
export interface IEventHistory extends Document {
  eventId: Types.ObjectId;
  scheduleId: Types.ObjectId;
  organizationId: Types.ObjectId;
  changeType: 'creation' | 'modification' | 'cancellation' | 'substitution';
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  changedBy: Types.ObjectId;
  changedAt: Date;
  reason?: string;
}

// User Schema with enhanced role management
export interface IUser extends Document {
  auth0Id: string;
  email: string;
  name: string;
  organizations: Array<{
    organizationId: Types.ObjectId;
    role: 'admin' | 'teacher' | 'substitute' | 'viewer';
    joinedAt: Date;
  }>;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: {
      email: boolean;
      push: boolean;
      schedule: {
        changes: boolean;
        reminders: boolean;
        substitutions: boolean;
      };
    };
  };
  lastLogin: Date;
}

// Notification Schema
export interface INotification extends Document {
  userId: Types.ObjectId;
  organizationId: Types.ObjectId;
  type: 'event_change' | 'schedule_update' | 'substitution_request' | 'system';
  title: string;
  message: string;
  relatedTo?: {
    type: 'event' | 'schedule' | 'organization';
    id: Types.ObjectId;
  };
  status: 'unread' | 'read' | 'archived';
  createdAt: Date;
  readAt?: Date;
}

interface NotificationSettings {
  events: {
    creation: boolean;
    modification: boolean;
    cancellation: boolean;
    reminders: boolean;
  };
  substitutions: {
    requests: boolean;
    confirmations: boolean;
    reminders: boolean;
  };
  system: {
    maintenance: boolean;
    announcements: boolean;
  };
  delivery: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

const OrganizationSchema = new Schema<IOrganization>({
  name: { type: String, required: true },
  type: { type: String, enum: ['school', 'district', 'other'], required: true },
  settings: {
    timezone: String,
    workingDays: [Number],
    defaultWorkingHours: {
      start: String,
      end: String
    },
    notifications: Schema.Types.Mixed
  },
  subjects: [{
    name: String,
    color: String,
    description: String
  }],
  admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Organization = models.Organization || model<IOrganization>('Organization', OrganizationSchema);

export interface ITeacher extends Document {
  userId: Types.ObjectId;
  organizationId: Types.ObjectId;
  name: string;
  email: string;
  phoneNumber?: string;
  subjects: string[];
  selectedSubjects: string[];
  color: string;
  availability: {
    dayOfWeek: number;
    timeSlots: { start: string; end: string }[];
  }[];
  qualifications?: string[];
  role: 'fulltime' | 'parttime' | 'substitute';
  maxHoursPerWeek: number;
  status: 'active' | 'inactive' | 'substitute';
}

export interface IRole extends Document {
  name: string;
  organizationId: Types.ObjectId;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubject extends Document {
  name: string;
  organizationId: Types.ObjectId;
  color: string;
  description?: string;
  requirements?: {
    qualifications?: string[];
    minExperience?: number;
  };
  metadata?: Record<string, any>;
}

export interface ITeacherAvailability extends Document {
  teacherId: Types.ObjectId;
  organizationId: Types.ObjectId;
  regularSchedule: {
    dayOfWeek: number;
    timeSlots: Array<{
      start: string;
      end: string;
      preferredSubjects?: string[];
    }>;
  }[];
  exceptions: Array<{
    date: Date;
    available: boolean;
    timeSlots?: Array<{
      start: string;
      end: string;
    }>;
    reason?: string;
  }>;
}

const RoleSchema = new Schema<IRole>({
  name: { type: String, required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  permissions: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const SubjectSchema = new Schema<ISubject>({
  name: { type: String, required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  color: { type: String, required: true },
  description: String,
  requirements: {
    qualifications: [String],
    minExperience: Number
  },
  metadata: Schema.Types.Mixed
});

const TeacherAvailabilitySchema = new Schema<ITeacherAvailability>({
  teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  regularSchedule: [{
    dayOfWeek: { type: Number, required: true },
    timeSlots: [{
      start: { type: String, required: true },
      end: { type: String, required: true },
      preferredSubjects: [String]
    }]
  }],
  exceptions: [{
    date: { type: Date, required: true },
    available: { type: Boolean, required: true },
    timeSlots: [{
      start: String,
      end: String
    }],
    reason: String
  }]
});

// Add indexes for better query performance
RoleSchema.index({ organizationId: 1, name: 1 }, { unique: true });
SubjectSchema.index({ organizationId: 1, name: 1 }, { unique: true });
TeacherAvailabilitySchema.index({ teacherId: 1, organizationId: 1 }, { unique: true });
TeacherAvailabilitySchema.index({ 'exceptions.date': 1 });

export const Role = models.Role || model<IRole>('Role', RoleSchema);
export const Subject = models.Subject || model<ISubject>('Subject', SubjectSchema);
export const TeacherAvailability = models.TeacherAvailability || 
  model<ITeacherAvailability>('TeacherAvailability', TeacherAvailabilitySchema);

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  type: { type: String, enum: ['event_change', 'schedule_update', 'substitution_request', 'system'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedTo: {
    type: { type: String, enum: ['event', 'schedule', 'organization'] },
    id: { type: Schema.Types.ObjectId }
  },
  status: { type: String, enum: ['unread', 'read', 'archived'], default: 'unread' },
  createdAt: { type: Date, default: Date.now },
  readAt: Date
});

export const Notification = models.Notification || model<INotification>('Notification', NotificationSchema);