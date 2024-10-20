import { injectable, inject } from "inversify";
import TYPES from "../../../types";
import { IJobPostRepository } from "../../../domain/interfaces/repositories/recruiter/IJobPostRepository";
import {
  JobPost,
  CreateJobPostParams,
  UpdateJobPostParams,
} from "../../../domain/entities/jobPostTypes";
import { User } from "../../../domain/entities/User";
import { IUserRepository } from "../../../domain/interfaces/repositories/user/IUserRepository";
import { S3Service } from "../../../infrastructure/services/S3Service";
import { PDFExtractor } from "../../../infrastructure/services/PDFExtractor";

@injectable()
export class JobPostUseCase {
  constructor(
    @inject(TYPES.JobPostRepository) private jobPostRepository: IJobPostRepository,
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    @inject(TYPES.S3Service) private s3Service: S3Service,
    @inject(TYPES.PDFExtractor) private pdfExtractor: PDFExtractor
  ) {}

  async getApplicantsByJobId(
    jobId: string,
    page: number,
    limit: number
  ): Promise<{ applicants: User[]; totalPages: number; totalCount: number }> {
    return this.jobPostRepository.findApplicantsByJobId(jobId, page, limit);
  }
  async createJobPost(params: CreateJobPostParams): Promise<JobPost> {
    return await this.jobPostRepository.create(params);
  }

  async getJobPostById(id: string): Promise<JobPost | null> {
    return await this.jobPostRepository.findById(id);
  }

  async getApplicantsById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async getJobPostsByRecruiterId(recruiterId: string): Promise<JobPost[]> {
    return await this.jobPostRepository.findByRecruiterId(recruiterId);
  }

  async updateJobPost(
    id: string,
    params: UpdateJobPostParams
  ): Promise<JobPost | null> {
    return await this.jobPostRepository.update(id, params);
  }

  async deleteJobPost(id: string): Promise<boolean> {
    return await this.jobPostRepository.delete(id);
  }

  async getAllJobPosts(): Promise<JobPost[]> {
    return await this.jobPostRepository.findAll();
  }

  async getFilteredApplicants(jobId: string): Promise<(User & { matchPercentage: number })[]> {
    console.log(`Starting getFilteredApplicants for jobId: ${jobId}`);
    const jobPost = await this.jobPostRepository.findById(jobId);
    if (!jobPost) {
      console.log(`Job post not found for jobId: ${jobId}`);
      throw new Error("Job post not found");
    }
    console.log(`Job post found: ${JSON.stringify(jobPost)}`);

    const applicants = await Promise.all(
      (jobPost.applicants || []).map(id => this.userRepository.findById(id.toString()))
    );
    console.log(`Found ${applicants.length} applicants`);

    const requiredSkills = jobPost.skillsRequired || [];
    console.log(`Required skills: ${JSON.stringify(requiredSkills)}`);

    const filteredApplicants = await Promise.all(
      applicants.map(async (applicant) => {
        if (!applicant || !applicant.resume) {
          console.log(`Skipping applicant ${applicant?.id || 'unknown'}: No resume`);
          return null;
        }

        try {
          console.log(`Processing applicant ${applicant.id}`);
          const resumeBuffer = await this.s3Service.getFile(applicant.resume);
          console.log(`Resume fetched for applicant ${applicant.id}. Buffer length: ${resumeBuffer.length}`);
          const resumeText = await this.pdfExtractor.extractText(resumeBuffer);
          console.log(`Resume text extracted for applicant ${applicant.id}. Text length: ${resumeText.length}`);
          console.log(`First 200 characters of resume text: ${resumeText.substring(0, 200)}`);

          if (resumeText.trim().length === 0) {
            console.log(`Skipping applicant ${applicant.id}: Empty resume text`);
            return null;
          }

          const matchPercentage = this.calculateSkillMatch(requiredSkills, resumeText);
          console.log(`Match percentage for applicant ${applicant.id}: ${matchPercentage}%`);

          return matchPercentage >= 75 ? { ...applicant, matchPercentage } : null;
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.warn(`Failed to process resume for applicant ${applicant.id}: ${error.message}`);
          } else {
            console.warn(`Failed to process resume for applicant ${applicant.id}: Unknown error`);
          }
          return null;
        }
      })
    );

    const result = filteredApplicants.filter((applicant): applicant is User & { matchPercentage: number } => applicant !== null);
    console.log(`Filtered applicants: ${result.length}`);
    return result;
  }

  private calculateSkillMatch(requiredSkills: string[], resumeText: string): number {
    const resumeWords = resumeText.toLowerCase().split(/\s+/);
    console.log(`Resume words: ${resumeWords.slice(0, 20).join(', ')}...`);
    
    const matchedSkills = requiredSkills.filter(skill => {
      const skillWords = skill.toLowerCase().split(/\s+/);
      const isMatched = skillWords.every(word => 
        resumeWords.some(resumeWord => resumeWord.includes(word))
      );
      console.log(`Skill "${skill}" matched: ${isMatched}`);
      return isMatched;
    });

    const matchPercentage = (matchedSkills.length / requiredSkills.length) * 100;
    console.log(`Matched skills: ${matchedSkills.length}/${requiredSkills.length} (${matchPercentage}%)`);
    return matchPercentage;
  }
}
