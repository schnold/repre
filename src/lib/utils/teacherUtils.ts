// src/lib/utils/teacherUtils.ts
import { Types } from 'mongoose';
import { 
  ITeacher, 
  Teacher, 
  ScheduleEntry,
  IScheduleEntry,
} from '../db/schemas';

// Define base types for our domain models
type TeacherBase = Omit<ITeacher, 'metadata'> & {
  metadata?: Record<string, unknown>;
};

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
  static async createTeacher(data: Partial<TeacherBase>): Promise<TeacherBase> {
    try {
      const teacher = new Teacher(data);
      const savedTeacher = await teacher.save();
      return savedTeacher.toObject();
    } catch (error) {
      console.error('Error creating teacher:', error);
      throw new Error('Failed to create teacher');
    }
  }

  static async updateTeacher(id: string, data: Partial<TeacherBase>): Promise<TeacherBase | null> {
    try {
      const updatedTeacher = await Teacher
        .findByIdAndUpdate(
          id,
          { $set: data },
          { new: true, runValidators: true }
        )
        .populate('userId')
        .populate('organizationId')
        .lean()
        .exec();

      return updatedTeacher;
    } catch (error) {
      console.error('Error updating teacher:', error);
      throw new Error('Failed to update teacher');
    }
  }

  static async deleteTeacher(id: string): Promise<void> {
    try {
      const session = await Teacher.startSession();
      await session.withTransaction(async () => {
        // Delete the teacher
        await Teacher.findByIdAndDelete(id).session(session);
        
        // Update schedule entries that reference this teacher
        await ScheduleEntry.updateMany(
          { teacherId: new Types.ObjectId(id) },
          { $unset: { teacherId: 1 } }
        ).session(session);
        
        await ScheduleEntry.updateMany(
          { substituteId: new Types.ObjectId(id) },
          { $unset: { substituteId: 1 } }
        ).session(session);
      });
      
      await session.endSession();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      throw new Error('Failed to delete teacher');
    }
  }

  static async getTeacherById(id: string): Promise<TeacherBase | null> {
    try {
      const teacher = await Teacher
        .findById(id)
        .populate('userId')
        .populate('organizationId')
        .lean()
        .exec();

      return teacher;
    } catch (error) {
      console.error('Error fetching teacher:', error);
      throw new Error('Failed to fetch teacher');
    }
  }

  static async getAllTeachers(organizationId?: string): Promise<TeacherBase[]> {
    try {
      const query = organizationId ? 
        { organizationId: new Types.ObjectId(organizationId) } : 
        {};

      const teachers = await Teacher
        .find(query)
        .populate('userId')
        .populate('organizationId')
        .lean()
        .exec();

      return teachers;
    } catch (error) {
      console.error('Error fetching teachers:', error);
      throw new Error('Failed to fetch teachers');
    }
  }

  static async findTeachersBySubjects(subjects: string[]): Promise<TeacherBase[]> {
    try {
      const teachers = await Teacher
        .find({
          subjects: { $in: subjects },
          status: 'active'
        })
        .populate('userId')
        .populate('organizationId')
        .lean()
        .exec();

      return teachers;
    } catch (error) {
      console.error('Error finding teachers by subjects:', error);
      throw new Error('Failed to find teachers by subjects');
    }
  }

  static async getActiveSubstitutes(organizationId: string): Promise<TeacherBase[]> {
    try {
      const substitutes = await Teacher
        .find({
          organizationId: new Types.ObjectId(organizationId),
          status: 'substitute'
        })
        .populate('userId')
        .populate('organizationId')
        .lean()
        .exec();

      return substitutes;
    } catch (error) {
      console.error('Error fetching active substitutes:', error);
      throw new Error('Failed to fetch active substitutes');
    }
  }

  static async findAvailableSubstitutes(
    startTime: Date,
    endTime: Date,
    subjects: string[],
    organizationId: string
  ): Promise<TeacherBase[]> {
    try {
      // Get potential substitutes
      const substitutes = await Teacher
        .find({
          organizationId: new Types.ObjectId(organizationId),
          status: 'substitute',
          subjects: { $in: subjects }
        })
        .lean()
        .exec();

      // Check for conflicts
      const availableTeachers = await Promise.all(
        substitutes.map(async (teacher) => {
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
      );

      // Remove null values and return available teachers
      return availableTeachers
        .filter((teacher): teacher is NonNullable<typeof teacher> => 
          teacher !== null
        )
        .map(teacher => ({
          ...teacher,
          _id: teacher._id,
          userId: teacher.userId,
          organizationId: teacher.organizationId,
          name: teacher.name,
          email: teacher.email,
          subjects: teacher.subjects,
          color: teacher.color,
          availability: teacher.availability,
          status: teacher.status,
          qualifications: teacher.qualifications,
          preferredSubstitutes: teacher.preferredSubstitutes,
          metadata: teacher.metadata
        }));
    } catch (error) {
      console.error('Error finding available substitutes:', error);
      throw new Error('Failed to find available substitutes');
    }
  }

  static async getTeacherWorkload(
    teacherId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TeacherWorkload> {
    try {
      const scheduleEntries = await ScheduleEntry
        .find({
          $or: [
            { teacherId: new Types.ObjectId(teacherId) },
            { substituteId: new Types.ObjectId(teacherId) }
          ],
          startTime: { $gte: startDate },
          endTime: { $lte: endDate }
        })
        .lean()
        .exec();

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
    } catch (error) {
      console.error('Error getting teacher workload:', error);
      throw new Error('Failed to get teacher workload');
    }
  }

  static async getTeacherStatistics(
    teacherId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TeacherStatistics> {
    try {
      const scheduleEntries = await ScheduleEntry
        .find({
          $or: [
            { teacherId: new Types.ObjectId(teacherId) },
            { substituteId: new Types.ObjectId(teacherId) }
          ],
          startTime: { $gte: startDate },
          endTime: { $lte: endDate }
        })
        .sort({ startTime: 1 })
        .lean()
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
    } catch (error) {
      console.error('Error getting teacher statistics:', error);
      throw new Error('Failed to get teacher statistics');
    }
  }

  static async updateTeacherAvailability(
    teacherId: string,
    availability: TeacherBase['availability']
  ): Promise<TeacherBase | null> {
    try {
      const updatedTeacher = await Teacher
        .findByIdAndUpdate(
          teacherId,
          { $set: { availability } },
          { new: true, runValidators: true }
        )
        .lean()
        .exec();

      return updatedTeacher;
    } catch (error) {
      console.error('Error updating teacher availability:', error);
      throw new Error('Failed to update teacher availability');
    }
  }

  static async updatePreferredSubstitutes(
    teacherId: string,
    preferredSubstitutes: string[]
  ): Promise<TeacherBase | null> {
    try {
      const substituteIds = preferredSubstitutes.map(id => new Types.ObjectId(id));
      const updatedTeacher = await Teacher
        .findByIdAndUpdate(
          teacherId,
          { $set: { preferredSubstitutes: substituteIds } },
          { new: true, runValidators: true }
        )
        .lean()
        .exec();

      return updatedTeacher;
    } catch (error) {
      console.error('Error updating preferred substitutes:', error);
      throw new Error('Failed to update preferred substitutes');
    }
  }

  static async checkAvailability(
    teacherId: string,
    date: Date,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    try {
      const teacher = await Teacher.findById(teacherId);
      if (!teacher) return false;

      // Check day of week availability
      const dayOfWeek = date.getDay();
      const dayAvailability = teacher.availability.find(a => a.dayOfWeek === dayOfWeek);
      
      if (!dayAvailability) return false;

      // Check time range
      return startTime >= dayAvailability.startTime && endTime <= dayAvailability.endTime;
    } catch (error) {
      console.error('Error checking teacher availability:', error);
      throw new Error('Failed to check teacher availability');
    }
  }
}