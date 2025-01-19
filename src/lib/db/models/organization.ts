import mongoose from 'mongoose';
import { Types } from 'mongoose';

export interface ISchoolClass {
  _id: Types.ObjectId;
  name: string;
  grade: number;
  section?: string;
}

export interface ISubject {
  _id: Types.ObjectId;
  name: string;
  color?: string;
}

export interface IOrganization {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  classes: ISchoolClass[];
  subjects: ISubject[];
  timeZone: string;
  workingHours: {
    start: string;
    end: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const schoolClassSchema = new mongoose.Schema({
  name: { type: String, required: true },
  grade: { type: Number, required: true },
  section: { type: String }
});

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String }
});

const organizationSchema = new mongoose.Schema<IOrganization>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    address: String,
    phone: String,
    email: String,
    website: String,
    logo: String,
    classes: [schoolClassSchema],
    subjects: [subjectSchema],
    timeZone: {
      type: String,
      default: 'UTC'
    },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    }
  },
  {
    timestamps: true,
  }
);

// Create indexes for better querying
organizationSchema.index({ name: 1 });
organizationSchema.index({ 'classes.grade': 1 });
organizationSchema.index({ 'subjects.name': 1 });

export const Organization = mongoose.models.Organization || mongoose.model<IOrganization>('Organization', organizationSchema);