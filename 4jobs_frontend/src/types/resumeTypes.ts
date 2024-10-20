export interface ResumeData {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  profileSummary: string;
  skills: string[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
}
