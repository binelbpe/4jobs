import React from "react";
import { BasicJobPost } from "../../types/jobPostTypes";
import { Link } from "react-router-dom";
import { Briefcase, MapPin, IndianRupee, Clock } from "lucide-react";

interface JobListProps {
  jobs: BasicJobPost[];
}

const JobList: React.FC<JobListProps> = ({ jobs }) => {
  return (
    <div className="space-y-6">
      {jobs.map((job) => (
        <div
          key={job._id}
          className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow duration-300 border-l-4 border-purple-600"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-purple-800 mb-2">
                {job.title}
              </h3>
              <p className="text-purple-600 mb-2">{job.company?.name}</p>
              <div className="flex flex-wrap gap-4 text-sm text-purple-500 mb-4">
                <div className="flex items-center">
                  <MapPin size={16} className="mr-1" />
                  {job.location}
                </div>
                <div className="flex items-center">
                  <Briefcase size={16} className="mr-1" />
                  {job.wayOfWork}
                </div>
                <div className="flex items-center">
                  <IndianRupee size={16} className="mr-1" />₹
                  {job.salaryRange.min.toLocaleString()} - ₹
                  {job.salaryRange.max.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="text-sm text-purple-500 flex items-center">
              Posted on : <Clock size={16} className="mr-1" />
              {new Date(job.createdAt || "").toLocaleDateString()}
            </div>
          </div>
          <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {job.skillsRequired.slice(0, 5).map((skill, index) => (
              <span
                key={index}
                className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded"
              >
                {skill}
              </span>
            ))}
            {job.skillsRequired.length > 5 && (
              <span className="text-purple-500 text-xs">
                +{job.skillsRequired.length - 5} more
              </span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <Link
              to={`/recruiter/jobPost/${job._id}`}
              className="text-purple-600 hover:text-purple-800 font-medium text-sm"
            >
              View Details
            </Link>
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                job.status === "Open"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {job.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobList;
