// src/lib/db/schemas/index.ts
import { Schema, model, Document, Types, Model } from 'mongoose';

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

// User Schema
export interface IUser extends Document {
  auth0Id: string;
  email: string;
  name: string;
  roles: string[];  
  organizationId?: Types.ObjectId;
  lastLogin: Date;
  settings: {
    theme?: string;
    notifications?: {
      email: boolean;
      push: boolean;
    };
  };
}

// Teacher Schema
export interface ITeacher extends Document {
    userId: Types.ObjectId;
    organizationId: Types.ObjectId;
    name: string;
    email: string;
    subjects: string[];
    color: string;
    availability: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }>;
    qualifications?: string[];
    status: 'active' | 'inactive' | 'substitute';
    preferredSubstitutes?: Types.ObjectId[];
    metadata?: MetadataRecord;
  }

// Schedule Schema
export interface ISchedule extends Document {
  organizationId: Types.ObjectId;
  name: string;
  description?: string;
  academicYear: string;
  term: string;
  startDate: Date;
  endDate: Date;
  defaultWorkingHours: WorkingHours;
  metadata?: MetadataRecord;
}

// Schedule Entry Schema
export interface IScheduleEntry extends Document {
  scheduleId: Types.ObjectId;
  teacherId: Types.ObjectId;
  substituteId?: Types.ObjectId;
  title: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  subject: string;
  class?: string;
  status: 'scheduled' | 'cancelled' | 'substituted';
  substitutionReason?: string;
  notificationsSent: NotificationStatus;
  recurrence?: {
    pattern: 'daily' | 'weekly';
    interval: number;
    until: Date;
  };
  metadata?: MetadataRecord;
}

// Organization Schema
export interface IOrganization extends Document {
  name: string;
  type: 'school' | 'district' | 'other';
  settings: {
    timezone: string;
    workingDays: number[];
    defaultWorkingHours: WorkingHours;
    notifications: {
      emailEnabled: boolean;
      pushEnabled: boolean;
    };
  };
  metadata?: MetadataRecord;
}

// Change History Schema
export interface IChangeHistory extends Document {
  scheduleEntryId: Types.ObjectId;
  type: 'creation' | 'modification' | 'cancellation' | 'substitution';
  timestamp: Date;
  userId: Types.ObjectId;
  changes: Array<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }>;
  metadata?: MetadataRecord;
}

// Schema Definitions
const UserSchema = new Schema<IUser>({
  auth0Id: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  roles: { type: [String], default: [] },  // Initialize as empty array by default
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
  lastLogin: { type: Date },
  settings: {
    theme: String,
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  }
}, { timestamps: true });

const TeacherSchema = new Schema<ITeacher>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subjects: [{ type: String }],
  color: { type: String, required: true },
  availability: [{
    dayOfWeek: Number,
    startTime: String,
    endTime: String
  }],
  qualifications: [String],
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'substitute'],
    default: 'active'
  },
  preferredSubstitutes: [{ type: Schema.Types.ObjectId, ref: 'Teacher' }],
  metadata: Schema.Types.Mixed
}, { timestamps: true });

const ScheduleSchema = new Schema<ISchedule>({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true },
  description: String,
  academicYear: { type: String, required: true },
  term: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  defaultWorkingHours: {
    start: String,
    end: String
  },
  metadata: Schema.Types.Mixed
}, { timestamps: true });

const ScheduleEntrySchema = new Schema<IScheduleEntry>({
  scheduleId: { type: Schema.Types.ObjectId, ref: 'Schedule', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
  substituteId: { type: Schema.Types.ObjectId, ref: 'Teacher' },
  title: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  location: String,
  subject: { type: String, required: true },
  class: String,
  status: {
    type: String,
    enum: ['scheduled', 'cancelled', 'substituted'],
    default: 'scheduled'
  },
  substitutionReason: String,
  notificationsSent: {
    teacher: { type: Boolean, default: false },
    substitute: Boolean,
    timestamp: Date
  },
  recurrence: {
    pattern: { type: String, enum: ['daily', 'weekly'] },
    interval: Number,
    until: Date
  },
  metadata: Schema.Types.Mixed
}, { timestamps: true });

const OrganizationSchema = new Schema<IOrganization>({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['school', 'district', 'other'],
    required: true
  },
  settings: {
    timezone: { type: String, default: 'UTC' },
    workingDays: [Number],
    defaultWorkingHours: {
      start: String,
      end: String
    },
    notifications: {
      emailEnabled: { type: Boolean, default: true },
      pushEnabled: { type: Boolean, default: true }
    }
  },
  metadata: Schema.Types.Mixed
}, { timestamps: true });

const ChangeHistorySchema = new Schema<IChangeHistory>({
  scheduleEntryId: { type: Schema.Types.ObjectId, ref: 'ScheduleEntry', required: true },
  type: {
    type: String,
    enum: ['creation', 'modification', 'cancellation', 'substitution'],
    required: true
  },
  timestamp: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  changes: [{
    field: String,
    oldValue: Schema.Types.Mixed,
    newValue: Schema.Types.Mixed
  }],
  metadata: Schema.Types.Mixed
}, { timestamps: true });

// Indexes
UserSchema.index({ auth0Id: 1 });
UserSchema.index({ email: 1 });
TeacherSchema.index({ organizationId: 1, status: 1 });
ScheduleSchema.index({ organizationId: 1, academicYear: 1, term: 1 });
ScheduleEntrySchema.index({ scheduleId: 1, startTime: 1, endTime: 1 });
ScheduleEntrySchema.index({ teacherId: 1, startTime: 1 });
ScheduleEntrySchema.index({ substituteId: 1, startTime: 1 });
ChangeHistorySchema.index({ scheduleEntryId: 1, timestamp: -1 });

// Export model types
export type UserModel = Model<IUser>;
export type TeacherModel = Model<ITeacher>;
export type ScheduleModel = Model<ISchedule>;
export type ScheduleEntryModel = Model<IScheduleEntry>;
export type OrganizationModel = Model<IOrganization>;
export type ChangeHistoryModel = Model<IChangeHistory>;

// Export models
export const User = model<IUser>('User', UserSchema);
export const Teacher = model<ITeacher>('Teacher', TeacherSchema);
export const Schedule = model<ISchedule>('Schedule', ScheduleSchema);
export const ScheduleEntry = model<IScheduleEntry>('ScheduleEntry', ScheduleEntrySchema);
export const Organization = model<IOrganization>('Organization', OrganizationSchema);
export const ChangeHistory = model<IChangeHistory>('ChangeHistory', ChangeHistorySchema);