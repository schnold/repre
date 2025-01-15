import mongoose from 'mongoose';
import { ITeacher } from '../interfaces';

// Delete the existing model if it exists
if (mongoose.models.Teacher) {
  delete mongoose.models.Teacher;
}

const teacherSchema = new mongoose.Schema<ITeacher>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String },
    subjects: [{ type: String }],
    color: { type: String, required: true, default: '#3b82f6' },
    createdBy: { type: String, required: true }, // Auth0 user ID
    maxHoursPerDay: { type: Number, required: true, default: 8 },
    maxHoursPerWeek: { type: Number, required: true, default: 40 },
    availability: [{
      dayOfWeek: { type: Number, required: true },
      timeSlots: [{
        start: { type: String, required: true },
        end: { type: String, required: true }
      }]
    }],
    preferences: {
      consecutiveHours: { type: Number, required: true, default: 4 },
      breakDuration: { type: Number, required: true, default: 30 },
      preferredDays: [{ type: Number }]
    }
  },
  { timestamps: true }
);

export const Teacher = mongoose.model<ITeacher>('Teacher', teacherSchema);