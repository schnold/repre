import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Teacher } from "@/lib/types/teacher" // <--- import the interface here



interface TeacherStore {
  teachers: Teacher[];
  addTeacher: (teacherData: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, updatedData: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
  // Possibly more actions
}

export const useTeacherStore = create<TeacherStore>()(
    persist(
      (set /*, get */) => ({
        teachers: [],
        addTeacher: (teacherData) => {
          const newTeacher: Teacher = {
            id: crypto.randomUUID(),
            ...teacherData,
          }
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
      }),
      {
        name: "teacher-store",
      }
    )
  )
