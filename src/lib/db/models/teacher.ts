import mongoose from 'mongoose';
import { Types } from 'mongoose';

export interface ITeacher {
  _id: Types.ObjectId;
  adminId: string; // auth0Id of the admin who created this teacher
  name: string;
  email: string;
  phoneNumber?: string;
  subjects: {
    organizationId: Types.ObjectId;
    subjectId: string; // Using string since subjects are embedded in organization
  }[];
  status: 'active' | 'inactive' | 'substitute';
  color: string;
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  availability: {
    dayOfWeek: number;
    timeSlots: {
      start: string;
      end: string;
    }[];
  }[];
  preferences: {
    consecutiveHours: number;
    breakDuration: number;
    preferredDays: number[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const teacherSchema = new mongoose.Schema<ITeacher>(
  {
    adminId: {
      type: String,
      required: true,
      index: true
    },
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true 
    },
    phoneNumber: { 
      type: String 
    },
    subjects: [{
      organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
      },
      subjectId: {
        type: String,
        required: true
      }
    }],
    status: {
      type: String,
      enum: ['active', 'inactive', 'substitute'],
      default: 'active',
    },
    color: { 
      type: String, 
      required: true 
    },
    maxHoursPerDay: { 
      type: Number, 
      required: true, 
      min: 1 
    },
    maxHoursPerWeek: { 
      type: Number, 
      required: true, 
      min: 1 
    },
    availability: [{
      dayOfWeek: { 
        type: Number, 
        required: true, 
        min: 0, 
        max: 6 
      },
      timeSlots: [{
        start: { type: String, required: true },
        end: { type: String, required: true }
      }]
    }],
    preferences: {
      consecutiveHours: { 
        type: Number, 
        required: true, 
        min: 1 
      },
      breakDuration: { 
        type: Number, 
        required: true, 
        min: 0 
      },
      preferredDays: [{ 
        type: Number, 
        min: 0, 
        max: 6 
      }]
    }
  },
  { timestamps: true }
);

// Add indexes for common queries
teacherSchema.index({ adminId: 1 });
teacherSchema.index({ 'subjects.organizationId': 1 });

// Clear existing model to prevent OverwriteModelError
if (mongoose.models.Teacher) {
  delete mongoose.models.Teacher;
}

export const Teacher = mongoose.model<ITeacher>('Teacher', teacherSchema);