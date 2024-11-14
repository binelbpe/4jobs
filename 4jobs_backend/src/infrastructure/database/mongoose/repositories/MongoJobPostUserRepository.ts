import { injectable } from "inversify";
import JobPostModel from "../models/jobPostModel";
import { UserModel } from "../models/UserModel";
import { IJobPostUserRepository } from "../../../../domain/interfaces/repositories/user/IJobPostUserRepository";
import mongoose from "mongoose";
import {
  JobPost,
  CreateJobPostParams,
  UpdateJobPostParams,
} from "../../../../domain/entities/jobPostTypes";
import { User } from "../../../../domain/entities/User";
import { AdvancedSearchFilters, AdvancedSearchResult, JobPostWithMatch } from "../../../../domain/entities/AdvancedSearchTypes";

@injectable()
export class MongoJobPostUserRepository implements IJobPostUserRepository {
  async findById(id: string): Promise<JobPost | null> {
    return await JobPostModel.findOne({ _id: id, isBlock: false }).lean();
  }
  
  async update(
    id: string,
    userId: string
  ): Promise<JobPost | null> {
    let updatedJobPost = await JobPostModel.findOneAndUpdate(
      { _id: id, isBlock: false },
      { $addToSet: { applicants: userId } },
      { new: true }
    );


    return updatedJobPost
  }

  async findAll(
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: string,
    filter: any
  ): Promise<{ jobPosts: JobPost[]; totalPages: number; totalCount: number }> {
    const skip = (page - 1) * limit;
    const sort: { [key: string]: 1 | -1 } = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const blockFilter = { ...filter, isBlock: false };

    const totalCount = await JobPostModel.countDocuments(blockFilter);
    const totalPages = Math.ceil(totalCount / limit);

    const jobPosts = await JobPostModel.find(blockFilter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      jobPosts: jobPosts,
      totalPages,
      totalCount,
    };
  }

  async reportJob(userId: string, jobId: string, reason: string): Promise<JobPost | null> {
    const updatedJobPost = await JobPostModel.findByIdAndUpdate(
      jobId,
      {
        $push: {
          reports: {
            userId: new mongoose.Types.ObjectId(userId),
            reason: reason,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    );

    return updatedJobPost;
  }

  async advancedSearch(
    filters: AdvancedSearchFilters,
    page: number,
    limit: number
  ): Promise<AdvancedSearchResult> {
    const skip = (page - 1) * limit;
    const baseQuery: any = { isBlock: false, status: "Open" };

    const isMatch = (searchTerm: string, target: string): boolean => {
      return target.toLowerCase().includes(searchTerm.toLowerCase());
    };


    const calculateMatchPercentage = (job: JobPost) => {
      let matchedCriteria = 0;
      let totalCriteria = 0;

 
      if (filters.title) {
        totalCriteria++;
        if (isMatch(filters.title, job.title)) {
          matchedCriteria++;
        }
      }

      if (filters.company) {
        totalCriteria++;
        if (isMatch(filters.company, job.company.name)) {
          matchedCriteria++;
        }
      }

      if (filters.location) {
        totalCriteria++;
        if (isMatch(filters.location, job.location)) {
          matchedCriteria++;
        }
      }

      if (filters.wayOfWork) {
        totalCriteria++;
        if (job.wayOfWork === filters.wayOfWork) {
          matchedCriteria++;
        }
      }

      if (filters.salaryMin || filters.salaryMax) {
        totalCriteria++;
        if (
          (!filters.salaryMin || job.salaryRange.max >= filters.salaryMin) &&
          (!filters.salaryMax || job.salaryRange.min <= filters.salaryMax)
        ) {
          matchedCriteria++;
        }
      }
 
      if (filters.skills && filters.skills.length > 0) {
        totalCriteria++;
        const matchedSkills = filters.skills.filter(searchSkill =>
          job.skillsRequired.some((jobSkill: string) =>
            isMatch(searchSkill, jobSkill)
          )
        );
        if (matchedSkills.length === filters.skills.length) {
          matchedCriteria++;
        }
      }


      const percentage = totalCriteria > 0 
        ? (matchedCriteria / totalCriteria) * 100 
        : 0;

      return {
        percentage: Math.round(percentage),
        matchedCriteria,
        totalCriteria
      };
    };


    const allJobs = await JobPostModel.find(baseQuery).lean() as JobPost[];
   
    let exactMatches: JobPostWithMatch[] = [];
    let similarMatches: JobPostWithMatch[] = [];

    allJobs.forEach(job => {
      const result = calculateMatchPercentage(job);
      const jobWithMatch: JobPostWithMatch = {
        ...job,
        matchPercentage: result.percentage
      };

      if (result.matchedCriteria === result.totalCriteria && result.totalCriteria > 0) {
        exactMatches.push(jobWithMatch);
      } else if (result.percentage >= 50) {
        similarMatches.push(jobWithMatch);
      }
    });


    exactMatches.sort((a, b) => b.matchPercentage - a.matchPercentage);
    similarMatches.sort((a, b) => b.matchPercentage - a.matchPercentage);
    const paginatedExactMatches = exactMatches.slice(skip, skip + limit);
    const paginatedSimilarMatches = similarMatches.slice(skip, skip + limit);

    return {
      exactMatches: paginatedExactMatches.map(match => ({
        ...match,
        _id: match._id?.toString() || undefined
      })),
      similarMatches: paginatedSimilarMatches.map(match => ({
        ...match,
        _id: match._id?.toString() || undefined
      })),
      totalPages: Math.ceil(Math.max(exactMatches.length, similarMatches.length) / limit),
      currentPage: page,
      totalExactCount: exactMatches.length,
      totalSimilarCount: similarMatches.length
    };
  }
}
