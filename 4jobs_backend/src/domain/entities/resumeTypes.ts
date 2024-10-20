export interface ResumeData {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  profileSummary: string;
  skills: string[];
  projects: {
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }[];
  experience: {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
  }[];
}
