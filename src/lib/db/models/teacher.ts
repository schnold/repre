import mongoose from 'mongoose';
import { ITeacher } from '../interfaces';

const teacherSchema = new mongoose.Schema<ITeacher>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String },
    subjects: [{ type: String }],
    status: {
      type: String,
      enum: ['active', 'inactive', 'substitute'],
      default: 'active',
    },
    color: { type: String, required: true },
    createdBy: { type: String, required: true },
    maxHoursPerDay: { type: Number, required: true, min: 1 },
    maxHoursPerWeek: { type: Number, required: true, min: 1 },
    organizationIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }],
      default: [],
      required: true
    },
    availability: [{
      dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
      timeSlots: [{
        start: { type: String, required: true },
        end: { type: String, required: true }
      }]
    }],
    preferences: {
      consecutiveHours: { type: Number, required: true, min: 1 },
      breakDuration: { type: Number, required: true, min: 0 },
      preferredDays: [{ type: Number, min: 0, max: 6 }]
    }
  },
  { timestamps: true }
);

// Add indexes for common queries
teacherSchema.index({ email: 1 }, { unique: true });
teacherSchema.index({ createdBy: 1 });
teacherSchema.index({ status: 1 });
teacherSchema.index({ organizationIds: 1 });

// Clear existing model if it exists to prevent OverwriteModelError
if (mongoose.models.Teacher) {
  delete mongoose.models.Teacher;
}

export const Teacher = mongoose.model<ITeacher>('Teacher', teacherSchema);