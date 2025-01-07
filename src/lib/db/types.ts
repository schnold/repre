import { Types } from 'mongoose';

export interface MongoDateQuery {
  $gte?: Date;
  $lte?: Date;
  $lt?: Date;
  $gt?: Date;
}

export interface MongoIdQuery {
  $ne?: Types.ObjectId;
}

export interface TimeRangeQuery {
  startTime: { $lt: Date };
  endTime: { $gt: Date };
}

export interface TeacherReferenceQuery {
  teacherId?: Types.ObjectId;
  substituteTeacherId?: Types.ObjectId;
}

export interface LessonQuery extends TeacherReferenceQuery {
  _id?: MongoIdQuery;
  startTime?: MongoDateQuery;
  endTime?: MongoDateQuery;
  $or?: Array<TimeRangeQuery | TeacherReferenceQuery>;
}

export interface TeacherQuery {
  _id?: Types.ObjectId | MongoIdQuery;
  name?: string;
  subjects?: string | { $in: string[] };
}

export interface ScheduleQuery {
  _id?: Types.ObjectId;
  organizationId: string;
  ownerId?: string;
}