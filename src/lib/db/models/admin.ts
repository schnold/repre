import mongoose from 'mongoose';
import { IAdmin } from '../interfaces';

const adminSchema = new mongoose.Schema<IAdmin>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    settings: {
      timeZone: { type: String, required: true, default: 'UTC' },
      notificationPreferences: {
        immediateUpdates: { type: Boolean, default: true },
        dailyDigest: { type: Boolean, default: false },
        weeklyDigest: { type: Boolean, default: false },
      },
    },
  },
  { timestamps: true }
);

export const Admin = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', adminSchema); 