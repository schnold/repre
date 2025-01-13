import mongoose from 'mongoose';

// Teacher Schema & Model
const teacherSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  phoneNumber: String,
  subjects: { type: [String], default: [] },
  color: { type: String, default: '#3b82f6' },
  status: { type: String, default: 'active' },
  maxHoursPerDay: { type: Number, default: 8 },
  maxHoursPerWeek: { type: Number, default: 40 },
  availability: {
    type: [{
      dayOfWeek: Number,
      timeSlots: [{
        start: String,
        end: String
      }]
    }],
    default: []
  },
  preferences: {
    type: {
      consecutiveHours: { type: Number, default: 4 },
      breakDuration: { type: Number, default: 30 },
      preferredDays: { type: [Number], default: [] }
    },
    default: {
      consecutiveHours: 4,
      breakDuration: 30,
      preferredDays: []
    }
  },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdBy: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add compound unique index for email within organization
teacherSchema.index({ email: 1, organizationId: 1 }, { unique: true });

// Subject Schema & Model
const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, required: true },
  description: String,
  teacherIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }],
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdBy: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add compound unique index for name within organization
subjectSchema.index({ name: 1, organizationId: 1 }, { unique: true });

// User Schema & Model
const userSchema = new mongoose.Schema({
  auth0Id: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: String,
  picture: String,
  roles: { type: [String], default: ['user'] },
  organizationId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Organization Schema
const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  settings: {
    type: {
      timezone: { type: String, default: 'UTC' },
      workingHours: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' }
      },
      workingDays: { type: [Number], default: [1, 2, 3, 4, 5] } // 1-7 for Monday-Sunday
    },
    default: {}
  },
  // Store Auth0 user IDs as strings
  admins: [{ type: String }],  // Auth0 user IDs
  members: [{ type: String }], // Auth0 user IDs
  createdBy: { type: String, required: true }, // Auth0 user ID
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Export models
export const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);
export const Subject = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Organization = mongoose.models.Organization || mongoose.model('Organization', organizationSchema);

// Export interfaces
export interface ITeacher extends mongoose.Document {
  name: string;
  email: string;
  phoneNumber?: string;
  subjects: string[];
  color: string;
  status: string;
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  availability: Array<{
    dayOfWeek: number;
    timeSlots: Array<{
      start: string;
      end: string;
    }>;
  }>;
  preferences: {
    consecutiveHours: number;
    breakDuration: number;
    preferredDays: number[];
  };
  organizationId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubject extends mongoose.Document {
  name: string;
  color: string;
  description?: string;
  teacherIds: mongoose.Types.ObjectId[];
  organizationId: mongoose.Types.ObjectId;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends mongoose.Document {
  auth0Id: string;
  email: string;
  name: string;
  picture?: string;
  roles: string[];
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrganization extends mongoose.Document {
  name: string;
  description?: string;
  settings: {
    timezone?: string;
    workingHours?: {
      start: string;
      end: string;
    };
    workingDays?: number[];
  };
  admins: string[];
  members: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
} 