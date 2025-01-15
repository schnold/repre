import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['school', 'district', 'other'], default: 'school' },
  createdBy: { type: String, required: true },
  settings: {
    timeZone: { type: String, default: 'UTC' },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    }
  }
}, {
  timestamps: true
});

export const Organization = mongoose.models.Organization || mongoose.model('Organization', organizationSchema);