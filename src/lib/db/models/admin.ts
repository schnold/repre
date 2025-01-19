import mongoose from 'mongoose';
import { Types } from 'mongoose';

export interface IAdmin {
  _id: Types.ObjectId;
  auth0Id: string;
  name?: string;
  email: string;
  preferences: {
    theme?: string;
    notifications?: boolean;
    defaultView?: 'week' | 'month' | 'day';
    startOfWeek?: number;
    selectedOrganizationId?: Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new mongoose.Schema<IAdmin>(
  {
    auth0Id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    preferences: {
      theme: { type: String },
      notifications: { type: Boolean, default: true },
      defaultView: { 
        type: String, 
        enum: ['week', 'month', 'day'],
        default: 'week'
      },
      startOfWeek: { type: Number, min: 0, max: 6, default: 0 },
      selectedOrganizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
      }
    }
  },
  {
    timestamps: true,
  }
);

// Only create indexes for non-unique fields
adminSchema.index({ email: 1 });
adminSchema.index({ 'preferences.selectedOrganizationId': 1 });

// Clear existing model to prevent OverwriteModelError
if (mongoose.models.Admin) {
  delete mongoose.models.Admin;
}

export const Admin = mongoose.model<IAdmin>('Admin', adminSchema); 