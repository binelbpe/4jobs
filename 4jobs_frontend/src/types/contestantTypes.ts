export interface Contestant {
  _id: string;
  name: string;
  email: string;
  appliedDate: string;
  resumeUrl: string;
}

export interface Experience {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
}

export interface Education {
  degree: string;
  field: string;
  institution: string;
  graduationYear: string;
}

export interface ContestantDetails extends Contestant {
  phone: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
}