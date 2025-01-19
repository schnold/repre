import mongoose from 'mongoose';
import { Types } from 'mongoose';

export interface IOrganizationTeacher {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  teacherId: Types.ObjectId;
  subjects: Types.ObjectId[]; // The subjects this teacher teaches in this organization
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const organizationTeacherSchema = new mongoose.Schema<IOrganizationTeacher>(
  {
    organizationId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Organization', 
      required: true 
    },
    teacherId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Teacher', 
      required: true 
    },
    subjects: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Subject' 
    }],
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
organizationTeacherSchema.index(
  { organizationId: 1, teacherId: 1 }, 
  { unique: true }
);

// Add index for querying by organization
organizationTeacherSchema.index({ organizationId: 1, status: 1 });

// Add index for querying by teacher
organizationTeacherSchema.index({ teacherId: 1, status: 1 });

// Clear existing model to prevent OverwriteModelError
if (mongoose.models.OrganizationTeacher) {
  delete mongoose.models.OrganizationTeacher;
}

export const OrganizationTeacher = mongoose.model<IOrganizationTeacher>('OrganizationTeacher', organizationTeacherSchema);