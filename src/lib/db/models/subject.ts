import mongoose from 'mongoose';
import { Types } from 'mongoose';

export interface ISubject {
  _id: Types.ObjectId;
  name: string;
  color?: string;
  organizationId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const subjectSchema = new mongoose.Schema<ISubject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      default: '#000000',
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index to ensure unique subject names within an organization
subjectSchema.index({ name: 1, organizationId: 1 }, { unique: true });

export const Subject = mongoose.models.Subject || mongoose.model<ISubject>('Subject', subjectSchema); 