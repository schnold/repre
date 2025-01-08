// /src/store/teacher-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Teacher } from '@/lib/types/teacher'

// Example pastel color palette:
const PASTEL_COLORS = [
  '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BFFCC6', '#BFD5FF', '#D7BFFF',
  // add more as desired
];

function getRandomColor() {
  return PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
}

interface TeacherStore {
  teachers: Teacher[];
  addTeacher: (teacherData: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, updatedData: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
  clearTeachers: () => void;
}

export const useTeacherStore = create<TeacherStore>()(
  persist(
    (set) => ({
      teachers: [],
      addTeacher: (teacherData) => {
        const newTeacher: Teacher = {
            id: crypto.randomUUID(),
            ...teacherData,
            color: teacherData.color ?? getRandomColor(), // if teacherData.color is undefined, use a random color
          };
        set((state) => ({
          teachers: [...state.teachers, newTeacher],
        }))
      },
      updateTeacher: (id, updatedData) => {
        set((state) => ({
          teachers: state.teachers.map((teacher) =>
            teacher.id === id ? { ...teacher, ...updatedData } : teacher
          ),
        }))
      },
      deleteTeacher: (id) => {
        set((state) => ({
          teachers: state.teachers.filter((teacher) => teacher.id !== id),
        }))
      },
      clearTeachers: () => set({ teachers: [] }),
    }),
    {
      name: 'teacher-store',
    }
  )
)
