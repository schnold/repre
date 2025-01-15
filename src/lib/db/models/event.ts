import mongoose from 'mongoose';
import { IEvent } from '../interfaces';

const eventSchema = new mongoose.Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String },
    scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { 
      type: String, 
      required: true,
      enum: ['scheduled', 'cancelled', 'completed'],
      default: 'scheduled'
    }
  },
  { timestamps: true }
);

// Add indexes for common queries
eventSchema.index({ scheduleId: 1, startTime: 1 });
eventSchema.index({ scheduleId: 1, endTime: 1 });
eventSchema.index({ teacherId: 1, startTime: 1 });

export const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);