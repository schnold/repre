// src/lib/db/types.ts
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
  substituteId?: Types.ObjectId;
}

export interface ScheduleEntryQuery extends TeacherReferenceQuery {
  _id?: MongoIdQuery;
  startTime?: MongoDateQuery;
  endTime?: MongoDateQuery;
  scheduleId?: Types.ObjectId;
  status?: 'scheduled' | 'cancelled' | 'substituted';
  $or?: Array<TimeRangeQuery | TeacherReferenceQuery>;
}

export interface TeacherQuery {
  _id?: Types.ObjectId | MongoIdQuery;
  organizationId?: Types.ObjectId;
  status?: 'active' | 'inactive' | 'substitute';
  subjects?: string | { $in: string[] };
}

export interface ScheduleQuery {
  _id?: Types.ObjectId;
  organizationId: Types.ObjectId;
  academicYear?: string;
  term?: string;
}