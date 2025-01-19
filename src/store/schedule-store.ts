import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ISchedule } from '@/lib/db/interfaces';

interface ScheduleState {
  schedules: ISchedule[];
  selectedSchedule: ISchedule | null;
  setSchedules: (schedules: ISchedule[]) => void;
  setSelectedSchedule: (schedule: ISchedule | null) => void;
  fetchSchedules: (organizationId: string) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      schedules: [],
      selectedSchedule: null,
      setSchedules: (schedules) => set({ schedules }),
      setSelectedSchedule: (schedule) => set({ selectedSchedule: schedule }),
      fetchSchedules: async (organizationId) => {
        try {
          const response = await fetch(`/api/organizations/${organizationId}/schedules`);
          if (!response.ok) throw new Error('Failed to fetch schedules');
          const data = await response.json();
          set({ schedules: data });
          
          // Set first schedule as selected if none selected and we have schedules
          if (!get().selectedSchedule && data.length > 0) {
            set({ selectedSchedule: data[0] });
          }
        } catch (error) {
          console.error('Error fetching schedules:', error);
        }
      },
    }),
    {
      name: 'schedule-storage',
    }
  )
); 