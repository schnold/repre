import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  color: { type: String, default: '#4B5563' },
  status: { 
    type: String, 
    enum: ['active', 'draft', 'archived'],
    default: 'draft'
  },
  organizationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organization',
    required: true 
  },
  createdBy: { type: String, required: true },
  settings: {
    type: {
      allowedRooms: { type: [String], default: [] },
      allowedSubjects: { type: [String], default: [] },
      maxEventsPerDay: { type: Number, default: null },
      minEventDuration: { type: Number, default: null },
      maxEventDuration: { type: Number, default: null },
      totalWeeklyHours: { type: Number, required: true, default: 40 },
      subjectHours: [{
        subject: { type: String, required: true },
        minimumHours: { type: Number, required: true, min: 0 }
      }]
    },
    default: () => ({
      allowedRooms: [],
      allowedSubjects: [],
      maxEventsPerDay: null,
      minEventDuration: null,
      maxEventDuration: null,
      totalWeeklyHours: 40,
      subjectHours: []
    })
  },
  dateRange: {
    type: {
      start: { type: Date, default: null },
      end: { type: Date, default: null }
    },
    default: () => ({
      start: null,
      end: null
    })
  },
  workingHours: {
    type: {
      start: { type: String, default: null },
      end: { type: String, default: null }
    },
    default: () => ({
      start: null,
      end: null
    })
  }
}, {
  timestamps: true,
  minimize: false // Ensure empty objects are stored
});

// Create indexes
scheduleSchema.index({ organizationId: 1 });
scheduleSchema.index({ status: 1 });

// Clear existing model if it exists to prevent OverwriteModelError
if (mongoose.models.Schedule) {
  delete mongoose.models.Schedule;
}

export const Schedule = mongoose.model('Schedule', scheduleSchema);