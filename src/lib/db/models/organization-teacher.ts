import mongoose from 'mongoose';
import { IOrganizationTeacher } from '../interfaces';

const organizationTeacherSchema = new mongoose.Schema<IOrganizationTeacher>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    status: { 
      type: String, 
      required: true,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  { timestamps: true }
);

// Add compound index for unique organization-teacher pairs
organizationTeacherSchema.index({ organizationId: 1, teacherId: 1 }, { unique: true });

export const OrganizationTeacher = mongoose.models.OrganizationTeacher || 
  mongoose.model<IOrganizationTeacher>('OrganizationTeacher', organizationTeacherSchema);