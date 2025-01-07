// src/lib/db/schemas/index.ts
import { Schema, model, Document, Types } from 'mongoose';

// Interfaces
export interface ITeacher extends Document {
  name: string;
  subjects: string[];
  color: string;
  availability?: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
  email?: string;
  phoneNumber?: string;
}

export interface ILesson extends Document {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  color?: string;
  teacherId: Types.ObjectId;
  substituteTeacherId?: Types.ObjectId;
  isRecurring: boolean;
  recurringPattern?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
  };
}

export interface ISchedule extends Document {
  name: string;
  description?: string;
  organizationId: string; // For multi-tenant support
  ownerId: string;       // User who created the schedule
  lessons: Types.ObjectId[];
  teachers: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  settings?: {
    timezone?: string;
    workingHours?: {
      start: string;
      end: string;
    };
    defaultLessonDuration?: number;
  };
}

// Schemas
const TeacherSchema = new Schema<ITeacher>({
  name: { type: String, required: true },
  subjects: [{ type: String, required: true }],
  color: { type: String, required: true },
  availability: [{
    dayOfWeek: Number,
    startTime: String,
    endTime: String
  }],
  email: String,
  phoneNumber: String
}, { timestamps: true });

const LessonSchema = new Schema<ILesson>({
  title: { type: String, required: true },
  description: String,
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  location: String,
  color: String,
  teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
  substituteTeacherId: { type: Schema.Types.ObjectId, ref: 'Teacher' },
  isRecurring: { type: Boolean, default: false },
  recurringPattern: {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly']
    },
    interval: Number,
    endDate: Date
  }
}, { timestamps: true });

const ScheduleSchema = new Schema<ISchedule>({
  name: { type: String, required: true },
  description: String,
  organizationId: { type: String, required: true, index: true },
  ownerId: { type: String, required: true },
  lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  teachers: [{ type: Schema.Types.ObjectId, ref: 'Teacher' }],
  settings: {
    timezone: String,
    workingHours: {
      start: String,
      end: String
    },
    defaultLessonDuration: Number
  }
}, { timestamps: true });

// Indexes
TeacherSchema.index({ name: 1 });
LessonSchema.index({ startTime: 1, endTime: 1 });
LessonSchema.index({ teacherId: 1 });
ScheduleSchema.index({ organizationId: 1, ownerId: 1 });

// Models
export const Teacher = model<ITeacher>('Teacher', TeacherSchema);
export const Lesson = model<ILesson>('Lesson', LessonSchema);
export const Schedule = model<ISchedule>('Schedule', ScheduleSchema);