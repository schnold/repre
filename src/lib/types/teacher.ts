interface Availability {
    dayOfWeek: number
    startTime: string
    endTime: string
  }
  
  export interface Teacher {
    id: string
    name: string
    subjects: string[]
    availability?: Availability[]
    color: string 
  }
  