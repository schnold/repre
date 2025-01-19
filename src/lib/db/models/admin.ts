import mongoose from 'mongoose';
import { Types } from 'mongoose';

export interface IAdmin {
  _id: Types.ObjectId;
  auth0Id: string;
  name?: string;
  email: string;
  selectedOrganizationId?: Types.ObjectId;
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
    selectedOrganizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },
  },
  {
    timestamps: true,
  }
);

// Only create indexes for non-unique fields
adminSchema.index({ selectedOrganizationId: 1 });

// Clear existing model to prevent OverwriteModelError
if (mongoose.models.Admin) {
  delete mongoose.models.Admin;
}

export const Admin = mongoose.model<IAdmin>('Admin', adminSchema); 