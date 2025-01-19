import mongoose from 'mongoose';
import { Types } from 'mongoose';

// Nested Schemas
const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, default: '#000000' },
  description: String
}, { 
  timestamps: true,
  _id: true // Ensure MongoDB generates _id for subjects
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { 
    type: String, 
    required: true,
    enum: ['scheduled', 'cancelled', 'completed'],
    default: 'scheduled'
  },
  recurrence: {
    frequency: { 
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
    },
    interval: { type: Number, min: 1 },
    daysOfWeek: [{ type: Number, min: 0, max: 6 }],
    endsOn: { type: Date },
    count: { type: Number, min: 1 },
    exceptions: [{ type: Date }]
  },
  parentEventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  isRecurring: { type: Boolean, default: false },
}, { timestamps: true });

const scheduleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  color: { type: String, default: '#4B5563' },
  status: { 
    type: String, 
    enum: ['active', 'draft', 'archived'],
    default: 'draft'
  },
  settings: {
    allowedRooms: { type: [String], default: [] },
    allowedSubjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    maxEventsPerDay: { type: Number, default: null },
    minEventDuration: { type: Number, default: null },
    maxEventDuration: { type: Number, default: null },
    totalWeeklyHours: { type: Number, required: true, default: 40 },
    subjectHours: [{
      subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
      minimumHours: { type: Number, required: true, min: 0 }
    }]
  },
  dateRange: {
    start: { type: Date, default: null },
    end: { type: Date, default: null }
  },
  workingHours: {
    start: { type: String, default: null },
    end: { type: String, default: null }
  },
  events: [eventSchema]
}, { timestamps: true });

const schoolClassSchema = new mongoose.Schema({
  name: { type: String, required: true },
  grade: { type: Number, required: true },
  section: { type: String }
});

export interface IOrganization {
  _id: Types.ObjectId;
  adminId: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  timeZone: string;
  workingHours: {
    start: string;
    end: string;
  };
  subjects: {
    _id: Types.ObjectId;
    name: string;
    color: string;
    description?: string;
  }[];
  teacherIds: Types.ObjectId[]; // Array of teacher references
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new mongoose.Schema<IOrganization>(
  {
    adminId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    address: String,
    phone: String,
    email: String,
    website: String,
    timeZone: {
      type: String,
      default: 'UTC'
    },
    workingHours: {
      start: {
        type: String,
        default: '09:00'
      },
      end: {
        type: String,
        default: '17:00'
      }
    },
    subjects: [{
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      color: {
        type: String,
        required: true
      },
      description: String
    }],
    teacherIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    }]
  },
  { timestamps: true }
);

// Add indexes for common queries
organizationSchema.index({ adminId: 1 });
organizationSchema.index({ 'subjects.name': 1 });

// Clear existing model to prevent OverwriteModelError
if (mongoose.models.Organization) {
  delete mongoose.models.Organization;
}

export const Organization = mongoose.model<IOrganization>('Organization', organizationSchema);