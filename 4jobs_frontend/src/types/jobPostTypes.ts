import { WorkType } from '../constants/jobConstants';

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
  company?: CompanyDetails;
  description: string;
  isApplied?: boolean;
  location: string;
  salaryRange: SalaryRange;
  wayOfWork: WorkType;
  skillsRequired: string[];
  qualifications: string[];
  recruiterId?: {
    _id: string;
    name: string;
    email: string;
  };
  jobPriority?: string;
  status: string;
  tags?: string[];
  postedDate?: string;
  lastUpdatedDate?: string;
  applicants?: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  reports?: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
    };
    reason: string;
    createdAt: string;
  }>;
  createdAt: string; 
  updatedAt: string;
  isBlock?: boolean;
}

export interface JobPost {
  _id: string;
  title: string;
  company?: CompanyDetails;
  description: string;
  isApplied?: boolean;
  location: string;
  salaryRange: SalaryRange;
  wayOfWork: WorkType;
  skillsRequired: string[];
  qualifications: string[];
  recruiterId?: string[]
  jobPriority?: string;
  status: string;
  tags?: string[];
  postedDate?: string;
  lastUpdatedDate?: string;
  applicants?: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  reports?: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
    };
    reason: string;
    createdAt: string;
  }>;
  createdAt: string; 
  updatedAt: string;
  isBlock?: boolean;
}

export interface BasicJobPostAdmin {
  _id: string;
  title: string;
  description: string;
  company: {
    name: string;
    website?: string;
    logo?: string;
  };
  location: string;
  salaryRange: {
    min: number;
    max: number;
  };
  wayOfWork: WorkType;
  skillsRequired: string[];
  qualifications: string[];
  status: 'Open' | 'Closed';
  recruiterId: {
    _id: string;
    name: string;
    email: string;
  };
  applicants: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  reports: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
    };
    reason: string;
    createdAt: string;
  }>;
  isBlock: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface BasicJobPostFormData extends Omit<BasicJobPost, '_id'> {
  wayOfWork: WorkType;
}

export interface CreateBasicJobPostParams {
  recruiterId: string;
  postData: BasicJobPostFormData;
}

export interface UpdateBasicJobPostParams {
  id: string;
  postData: Partial<BasicJobPostFormData>;
}
