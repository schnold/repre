import { Types } from 'mongoose';
import { Schedule, Lesson, Teacher, ISchedule, ILesson, ITeacher } from '../db/schemas';
import { 
  LessonQuery, 
  ScheduleQuery,
  TeacherReferenceQuery,
  TimeRangeQuery 
} from '../db/types';

export class ScheduleService {
  static async createSchedule(data: Partial<ISchedule>): Promise<ISchedule> {
    const schedule = new Schedule(data);
    await schedule.save();
    return schedule;
  }

  static async getScheduleById(id: string): Promise<ISchedule | null> {
    return Schedule.findById(id)
      .populate('lessons')
      .populate('teachers')
      .exec();
  }

  static async getSchedulesByOrganization(organizationId: string): Promise<ISchedule[]> {
    const query: ScheduleQuery = { organizationId };
    return Schedule.find(query)
      .populate('lessons')
      .populate('teachers')
      .exec();
  }

  static async addLessonToSchedule(scheduleId: string, lessonData: Partial<ILesson>): Promise<ILesson> {
    const lesson = new Lesson(lessonData);
    await lesson.save();

    await Schedule.findByIdAndUpdate(
      scheduleId,
      { $push: { lessons: lesson._id } }
    );

    return lesson;
  }

  static async updateLesson(lessonId: string, updateData: Partial<ILesson>): Promise<ILesson | null> {
    return Lesson.findByIdAndUpdate(lessonId, updateData, { new: true }).exec();
  }

  static async deleteLesson(scheduleId: string, lessonId: string): Promise<void> {
    await Lesson.findByIdAndDelete(lessonId);
    await Schedule.findByIdAndUpdate(
      scheduleId,
      { $pull: { lessons: new Types.ObjectId(lessonId) } }
    );
  }

  static async addTeacherToSchedule(scheduleId: string, teacherData: Partial<ITeacher>): Promise<ITeacher> {
    const teacher = new Teacher(teacherData);
    await teacher.save();

    await Schedule.findByIdAndUpdate(
      scheduleId,
      { $push: { teachers: teacher._id } }
    );

    return teacher;
  }

  static async checkTeacherAvailability(
    teacherId: string,
    startTime: Date,
    endTime: Date,
    excludeLessonId?: string
  ): Promise<boolean> {
    const baseQuery: TeacherReferenceQuery & { $or: TimeRangeQuery[] } = {
      teacherId: new Types.ObjectId(teacherId),
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    };

    const query: LessonQuery = excludeLessonId
      ? { ...baseQuery, _id: { $ne: new Types.ObjectId(excludeLessonId) } }
      : baseQuery;

    const conflictingLessons = await Lesson.countDocuments(query);
    return conflictingLessons === 0;
  }

  static async getTeacherSchedule(
    teacherId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ILesson[]> {
    const timeQuery: LessonQuery = {
      startTime: { $gte: startDate },
      endTime: { $lte: endDate },
      $or: [
        { teacherId: new Types.ObjectId(teacherId) },
        { substituteTeacherId: new Types.ObjectId(teacherId) }
      ]
    };

    return Lesson.find(timeQuery)
      .populate('teacherId')
      .populate('substituteTeacherId')
      .exec();
  }
}