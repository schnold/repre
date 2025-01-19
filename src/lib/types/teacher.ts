interface Availability {
    dayOfWeek: number
    startTime: string
    endTime: string
  }
  
  export interface Teacher {
    _id: string;
    name: string;
    subjects: string[];
    availability?: Availability[];
    color: string;
  }
  