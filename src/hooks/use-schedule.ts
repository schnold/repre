"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ISchedule } from '@/lib/db/schema/schedule';

interface ScheduleStore {
  selectedSchedule: (ISchedule & { _id: string }) | null;
  setSelectedSchedule: (schedule: (ISchedule & { _id: string }) | null) => void;
}

const useScheduleStore = create<ScheduleStore>()(
  persist(
    (set) => ({
      selectedSchedule: null,
      setSelectedSchedule: (schedule) => set({ selectedSchedule: schedule }),
    }),
    {
      name: 'schedule-storage',
    }
  )
);

export function useSchedule() {
  const { selectedSchedule, setSelectedSchedule } = useScheduleStore();

  return {
    selectedSchedule,
    setSelectedSchedule,
  };
} 