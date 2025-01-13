export interface TeacherFormData {
  name: string;
  email: string;
  phoneNumber: string;
  subjects: string[];
  role: 'fulltime' | 'parttime' | 'substitute';
  maxHoursPerWeek: number;
  qualifications: string[];
  availability: Array<{
    dayOfWeek: number;
    timeSlots: Array<{
      start: string;
      end: string;
    }>;
  }>;
}

export interface TeacherListItem {
  id: string;
  name: string;
  email: string;
  role: string;
  subjects: string[];
  status: 'active' | 'inactive' | 'substitute';
} 