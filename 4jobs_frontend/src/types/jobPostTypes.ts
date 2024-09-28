export interface CompanyDetails {
  name: string;
  website?: string;
  logo?: string;
}

export interface SalaryRange {
  min: number;
  max: number;
  currency?: string;
}

export interface BasicJobPost {
  _id: string;
  title: string;
  description: string;
  company: CompanyDetails;
  location: string;
  salaryRange: SalaryRange;
  wayOfWork: string;
  skillsRequired: string[];
  qualifications: string[];
  recruiterId: string;
  jobPriority?: string;
  status: string;
  tags?: string[];
  postedDate?: string;
  lastUpdatedDate?: string;
  applicants?: string[];
  isApplied?: boolean;
  createdAt: string; 
  updatedAt: string;
}

export interface BasicJobPostFormData extends Omit<BasicJobPost, '_id'> {}

export interface CreateBasicJobPostParams {
  recruiterId: string;
  postData: BasicJobPostFormData;
}

export interface UpdateBasicJobPostParams {
  id: string;
  postData: Partial<BasicJobPostFormData>;
}