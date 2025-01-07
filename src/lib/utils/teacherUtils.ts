import { Types } from 'mongoose';
import { ITeacher, Lesson, Teacher } from '../db/schemas';
import { TeacherQuery } from '../db/types';

export class TeacherService {
    static async createTeacher(data: Partial<ITeacher>): Promise<ITeacher> {
      const teacher = new Teacher(data);
      await teacher.save();
      return teacher;
    }
  
    static async updateTeacher(id: string, data: Partial<ITeacher>): Promise<ITeacher | null> {
      return Teacher.findByIdAndUpdate(id, data, { new: true }).exec();
    }
  
    static async deleteTeacher(id: string): Promise<void> {
      await Teacher.findByIdAndDelete(id);
      
      // Update lessons that reference this teacher as main teacher
      await Lesson.updateMany(
        { teacherId: new Types.ObjectId(id) },
        { $unset: { teacherId: 1 } }
      );
      
      // Update lessons that reference this teacher as substitute
      await Lesson.updateMany(
        { substituteTeacherId: new Types.ObjectId(id) },
        { $unset: { substituteTeacherId: 1 } }
      );
    }
  
    static async getTeacherById(id: string): Promise<ITeacher | null> {
      const query: TeacherQuery = { _id: new Types.ObjectId(id) };
      return Teacher.findOne(query).exec();
    }
  
    static async getAllTeachers(): Promise<ITeacher[]> {
      return Teacher.find().exec();
    }
  
    static async findTeachersBySubjects(subjects: string[]): Promise<ITeacher[]> {
      const query: TeacherQuery = {
        subjects: { $in: subjects }
      };
      return Teacher.find(query).exec();
    }
  }