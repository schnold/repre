// src/lib/utils/teacherUtils.ts
import { Types } from 'mongoose';
import { 
  ITeacher, 
  Teacher, 
  ScheduleEntry,
  IScheduleEntry
} from '../db/schemas';
import { TeacherQuery } from '../db/types';

export interface TeacherStatistics {
  totalClasses: number;
  substitutionsTaken: number;
  substitutionsGiven: number;
  hoursWorked: number;
  averageClassesPerWeek: number;
  upcomingClasses: IScheduleEntry[];
}

export interface TeacherWorkload {
  totalHours: number;
  regularClasses: number;
  substitutions: number;
  scheduleEntries: IScheduleEntry[];
}

export class TeacherService {
  // Teacher Management
  static async createTeacher(data: Partial<ITeacher>): Promise<ITeacher> {
    const teacher = new Teacher(data);
    await teacher.save();
    return teacher;
  }

  static async updateTeacher(id: string, data: Partial<ITeacher>): Promise<ITeacher | null> {
    return Teacher.findByIdAndUpdate(id, data, { new: true })
      .populate('userId')
      .populate('organizationId')
      .exec();
  }

  static async deleteTeacher(id: string): Promise<void> {
    await Teacher.findByIdAndDelete(id);
    
    // Update schedule entries that reference this teacher
    await ScheduleEntry.updateMany(
      { teacherId: new Types.ObjectId(id) },
      { $unset: { teacherId: 1 } }
    );
    
    await ScheduleEntry.updateMany(
      { substituteId: new Types.ObjectId(id) },
      { $unset: { substituteId: 1 } }
    );
  }

  static async getTeacherById(id: string): Promise<ITeacher | null> {
    return Teacher.findById(id)
      .populate('userId')
      .populate('organizationId')
      .exec();
  }

  static async getAllTeachers(organizationId?: string): Promise<ITeacher[]> {
    const query: TeacherQuery = {};
    if (organizationId) {
      query.organizationId = new Types.ObjectId(organizationId);
    }
    return Teacher.find(query)
      .populate('userId')
      .populate('organizationId')
      .exec();
  }

  // Teacher Search & Filtering
  static async findTeachersBySubjects(subjects: string[]): Promise<ITeacher[]> {
    const query: TeacherQuery = {
      subjects: { $in: subjects },
      status: 'active'
    };
    return Teacher.find(query)
      .populate('userId')
      .populate('organizationId')
      .exec();
  }

  static async getActiveSubstitutes(organizationId: string): Promise<ITeacher[]> {
    return Teacher.find({
      organizationId: new Types.ObjectId(organizationId),
      status: 'substitute'
    })
      .populate('userId')
      .populate('organizationId')
      .exec();
  }

  // Teacher Schedule & Availability
  static async getTeacherWorkload(
    teacherId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TeacherWorkload> {
    const scheduleEntries = await ScheduleEntry.find({
      $or: [
        { teacherId: new Types.ObjectId(teacherId) },
        { substituteId: new Types.ObjectId(teacherId) }
      ],
      startTime: { $gte: startDate },
      endTime: { $lte: endDate }
    }).exec();

    let totalHours = 0;
    let regularClasses = 0;
    let substitutions = 0;

    scheduleEntries.forEach(entry => {
      const duration = (entry.endTime.getTime() - entry.startTime.getTime()) / (1000 * 60 * 60);
      totalHours += duration;

      if (entry.teacherId.toString() === teacherId) {
        regularClasses++;
      }
      if (entry.substituteId?.toString() === teacherId) {
        substitutions++;
      }
    });

    return {
      totalHours,
      regularClasses,
      substitutions,
      scheduleEntries
    };
  }

  static async updateTeacherAvailability(
    teacherId: string,
    availability: ITeacher['availability']
  ): Promise<ITeacher | null> {
    return Teacher.findByIdAndUpdate(
      teacherId,
      { $set: { availability } },
      { new: true }
    ).exec();
  }

  static async updatePreferredSubstitutes(
    teacherId: string,
    preferredSubstitutes: string[]
  ): Promise<ITeacher | null> {
    const substituteIds = preferredSubstitutes.map(id => new Types.ObjectId(id));
    return Teacher.findByIdAndUpdate(
      teacherId,
      { $set: { preferredSubstitutes: substituteIds } },
      { new: true }
    ).exec();
  }

  // Teacher Statistics
  static async getTeacherStatistics(
    teacherId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TeacherStatistics> {
    const scheduleEntries = await ScheduleEntry.find({
      $or: [
        { teacherId: new Types.ObjectId(teacherId) },
        { substituteId: new Types.ObjectId(teacherId) }
      ],
      startTime: { $gte: startDate },
      endTime: { $lte: endDate }
    })
    .sort({ startTime: 1 })
    .exec();

    let totalClasses = 0;
    let substitutionsTaken = 0;
    let substitutionsGiven = 0;
    let hoursWorked = 0;

    scheduleEntries.forEach(entry => {
      const duration = (entry.endTime.getTime() - entry.startTime.getTime()) / (1000 * 60 * 60);
      hoursWorked += duration;

      if (entry.teacherId.toString() === teacherId) {
        totalClasses++;
        if (entry.substituteId) {
          substitutionsGiven++;
        }
      }

      if (entry.substituteId?.toString() === teacherId) {
        substitutionsTaken++;
      }
    });

    // Calculate average classes per week
    const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const averageClassesPerWeek = totalWeeks > 0 ? totalClasses / totalWeeks : 0;

    // Get upcoming classes
    const now = new Date();
    const upcomingClasses = scheduleEntries.filter(entry => entry.startTime > now);

    return {
      totalClasses,
      substitutionsTaken,
      substitutionsGiven,
      hoursWorked,
      averageClassesPerWeek,
      upcomingClasses
    };
  }

  // Availability Checks
  static async findAvailableSubstitutes(
    startTime: Date,
    endTime: Date,
    subjects: string[],
    organizationId: string
  ): Promise<ITeacher[]> {
    // First, get all potential substitutes
    const potentialSubstitutes = await Teacher.find({
      organizationId: new Types.ObjectId(organizationId),
      status: 'substitute',
      subjects: { $in: subjects }
    }).lean().exec();
  
    // Then filter out those who have conflicts
    const availableSubstitutes = (await Promise.all(
      potentialSubstitutes.map(async (teacher) => {
        const hasConflict = await ScheduleEntry.exists({
          $or: [
            { teacherId: teacher._id },
            { substituteId: teacher._id }
          ],
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        });
  
        return hasConflict ? null : teacher;
      })
    )).filter((teacher): teacher is ITeacher => teacher !== null);
  
    return availableSubstitutes;
  }

  static async checkAvailability(
    teacherId: string,
    date: Date,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return false;

    // Check day of week availability
    const dayOfWeek = date.getDay();
    const dayAvailability = teacher.availability.find(a => a.dayOfWeek === dayOfWeek);
    
    if (!dayAvailability) return false;

    // Check time range
    return startTime >= dayAvailability.startTime && endTime <= dayAvailability.endTime;
  }
}