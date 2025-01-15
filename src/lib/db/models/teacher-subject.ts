import mongoose from 'mongoose';
import { ITeacherSubject } from '../interfaces';

const teacherSubjectSchema = new mongoose.Schema<ITeacherSubject>({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  proficiencyLevel: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'expert'],
    default: 'intermediate'
  },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create compound indexes
teacherSubjectSchema.index({ teacherId: 1, subjectId: 1, organizationId: 1 }, { unique: true });
teacherSubjectSchema.index({ organizationId: 1, subjectId: 1 });
teacherSubjectSchema.index({ organizationId: 1, teacherId: 1 });

export const TeacherSubject = mongoose.models.TeacherSubject || 
  mongoose.model<ITeacherSubject>('TeacherSubject', teacherSubjectSchema); 