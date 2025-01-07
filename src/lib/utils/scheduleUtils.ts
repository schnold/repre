// src/lib/utils/scheduleUtils.ts
import { Types } from 'mongoose';
import {
    ChangeHistory,
    ISchedule,
    IScheduleEntry,
    Schedule,
    ScheduleEntry
} from '../db/schemas';
import {
    ScheduleEntryQuery,
    ScheduleQuery,
    TeacherReferenceQuery,
    TimeRangeQuery
} from '../db/types';

export class ScheduleService {
  // Schedule Management
  static async createSchedule(data: Partial<ISchedule>): Promise<ISchedule> {
    const schedule = new Schedule(data);
    await schedule.save();
    return schedule;
  }

  static async getScheduleById(id: string): Promise<ISchedule | null> {
    return Schedule.findById(id)
      .populate('organizationId')
      .exec();
  }

  static async getSchedulesByOrganization(organizationId: string): Promise<ISchedule[]> {
    const query: ScheduleQuery = { 
      organizationId: new Types.ObjectId(organizationId) 
    };
    return Schedule.find(query)
      .populate('organizationId')
      .exec();
  }

  static async updateSchedule(id: string, data: Partial<ISchedule>): Promise<ISchedule | null> {
    return Schedule.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  static async deleteSchedule(id: string): Promise<void> {
    // Delete all schedule entries first
    await ScheduleEntry.deleteMany({ scheduleId: new Types.ObjectId(id) });
    // Then delete the schedule
    await Schedule.findByIdAndDelete(id);
  }

  // Schedule Entry Management
  static async addScheduleEntry(scheduleId: string, entryData: Partial<IScheduleEntry>): Promise<IScheduleEntry> {
    const entry = new ScheduleEntry({
      ...entryData,
      scheduleId: new Types.ObjectId(scheduleId)
    });
    await entry.save();

    // Create change history
    await ChangeHistory.create({
      scheduleEntryId: entry._id,
      type: 'creation',
      userId: entryData.teacherId, // Assuming the teacher is creating the entry
      timestamp: new Date(),
      changes: [{
        field: 'all',
        oldValue: null,
        newValue: entry.toObject()
      }]
    });

    return entry;
  }

  static async updateScheduleEntry(
    entryId: string, 
    updateData: Partial<IScheduleEntry>,
    userId: string
  ): Promise<IScheduleEntry | null> {
    const oldEntry = await ScheduleEntry.findById(entryId);
    const updatedEntry = await ScheduleEntry.findByIdAndUpdate(
      entryId,
      updateData,
      { new: true }
    );

    if (oldEntry && updatedEntry) {
      // Create change history
      const changes = Object.keys(updateData).map(field => ({
        field,
        oldValue: oldEntry[field as keyof IScheduleEntry],
        newValue: updatedEntry[field as keyof IScheduleEntry]
      }));

      await ChangeHistory.create({
        scheduleEntryId: new Types.ObjectId(entryId),
        type: 'modification',
        userId: new Types.ObjectId(userId),
        timestamp: new Date(),
        changes
      });
    }

    return updatedEntry;
  }

  static async deleteScheduleEntry(entryId: string, userId: string): Promise<void> {
    const entry = await ScheduleEntry.findById(entryId);
    
    if (entry) {
      await ChangeHistory.create({
        scheduleEntryId: entry._id,
        type: 'cancellation',
        userId: new Types.ObjectId(userId),
        timestamp: new Date(),
        changes: [{
          field: 'status',
          oldValue: entry.status,
          newValue: 'cancelled'
        }]
      });

      await ScheduleEntry.findByIdAndDelete(entryId);
    }
  }

  // Teacher Availability & Scheduling
  static async checkTeacherAvailability(
    teacherId: string,
    startTime: Date,
    endTime: Date,
    excludeEntryId?: string
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

    const query: ScheduleEntryQuery = excludeEntryId
      ? { ...baseQuery, _id: { $ne: new Types.ObjectId(excludeEntryId) } }
      : baseQuery;

    const conflictingEntries = await ScheduleEntry.countDocuments(query);
    return conflictingEntries === 0;
  }

  static async getTeacherSchedule(
    teacherId: string,
    startDate: Date,
    endDate: Date
  ): Promise<IScheduleEntry[]> {
    const query: ScheduleEntryQuery = {
      $or: [
        { teacherId: new Types.ObjectId(teacherId) },
        { substituteId: new Types.ObjectId(teacherId) }
      ],
      startTime: { $gte: startDate },
      endTime: { $lte: endDate }
    };

    return ScheduleEntry.find(query)
      .populate('teacherId')
      .populate('substituteId')
      .populate('scheduleId')
      .exec();
  }

  // Substitution Management
  static async assignSubstitute(
    entryId: string,
    substituteId: string,
    reason: string,
    userId: string
  ): Promise<IScheduleEntry | null> {
    const entry = await ScheduleEntry.findById(entryId);
    
    if (!entry) {
      return null;
    }

    const updatedEntry = await ScheduleEntry.findByIdAndUpdate(
      entryId,
      {
        substituteId: new Types.ObjectId(substituteId),
        substitutionReason: reason,
        status: 'substituted',
        'notificationsSent.substitute': false
      },
      { new: true }
    );

    if (updatedEntry) {
      await ChangeHistory.create({
        scheduleEntryId: entry._id,
        type: 'substitution',
        userId: new Types.ObjectId(userId),
        timestamp: new Date(),
        changes: [{
          field: 'substituteId',
          oldValue: entry.substituteId,
          newValue: substituteId
        }]
      });
    }

    return updatedEntry;
  }

  // Change History
  static async getEntryHistory(entryId: string) {
    return ChangeHistory.find({
      scheduleEntryId: new Types.ObjectId(entryId)
    })
      .sort({ timestamp: -1 })
      .populate('userId')
      .lean()  // Convert to plain JavaScript object
      .exec();
  }
}