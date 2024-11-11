import React from "react";
import { BasicJobPost } from "../../../types/jobPostTypes";
import {
  Briefcase,
  MapPin,
  IndianRupee,
  Users,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface JobPostProps {
  jobPosts: BasicJobPost[];
  onDelete: (id: string) => Promise<void>;
  onEdit: (post: { _id: string }) => void;
  onToggleStatus: (post: BasicJobPost) => Promise<void>;
  onViewContestants: (postId: string) => void;
}

const JobPost: React.FC<JobPostProps> = ({
  jobPosts,
  onDelete,
  onEdit,
  onToggleStatus,
  onViewContestants,
}) => {
  const navigate = useNavigate();

  const handleViewDetails = (postId: string) => {
    navigate(`/recruiter/jobPost/${postId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {jobPosts.map((post) => (
        <div
          key={post._id}
          className={`bg-white border ${
            post.isBlock ? "border-red-500" : "border-purple-200"
          } p-4 md:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300`}
        >
          <h3 className="text-lg md:text-xl font-bold mb-2 text-purple-800">
            {post.title}
          </h3>
          {post.isBlock && (
            <div className="flex items-center text-red-500 mb-2">
              <AlertTriangle size={18} className="mr-2" />
              <span className="font-semibold text-sm md:text-base">
                Blocked by Admin
              </span>
            </div>
          )}
          <p className="mb-2 text-gray-600 text-sm md:text-base">
            {post.description.substring(0, 100)}...
          </p>
          <div className="space-y-1 mb-2">
            <div className="flex items-center text-gray-700 text-sm md:text-base">
              <Briefcase size={18} className="mr-1 text-purple-600" />
              <span>{post.company?.name}</span>
            </div>
            <div className="flex items-center text-gray-700 text-sm md:text-base">
              <MapPin size={18} className="mr-1 text-purple-600" />
              <span>{post.location}</span>
            </div>
            <div className="flex items-center text-gray-700 text-sm md:text-base">
              <IndianRupee size={18} className="mr-1 text-purple-600" />
              <span>
                ₹{post.salaryRange.min.toLocaleString()} - ₹
                {post.salaryRange.max.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center text-gray-700 text-sm md:text-base">
              <Users size={18} className="mr-1 text-purple-600" />
              <span>{post.wayOfWork}</span>
            </div>
          </div>
          <div className="mb-2">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                post.status === "Open"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {post.status === "Open" ? (
                <ToggleRight size={14} className="mr-1" />
              ) : (
                <ToggleLeft size={14} className="mr-1" />
              )}
              {post.status}
            </span>
          </div>
          <div className="flex flex-wrap justify-between mt-2 gap-2">
            <button
              onClick={() => onEdit(post)}
              className="flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 transition-colors duration-300 text-sm md:text-base"
            >
              <Edit size={16} className="mr-1" />
              Edit
            </button>
            <button
              onClick={() => onDelete(post._id)}
              className="flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 transition-colors duration-300 text-sm md:text-base"
            >
              <Trash2 size={16} className="mr-1" />
              Delete
            </button>
            <button
              onClick={() => onToggleStatus(post)}
              className={`flex items-center px-3 py-1 rounded transition-colors duration-300 text-sm md:text-base ${
                post.status === "Open"
                  ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                  : "bg-purple-100 text-purple-700 hover:bg-purple-200"
              }`}
            >
              {post.status === "Open" ? (
                <ToggleLeft size={16} className="mr-1" />
              ) : (
                <ToggleRight size={16} className="mr-1" />
              )}
              {post.status === "Open" ? "Close" : "Reopen"}
            </button>
            <button
              onClick={() => onViewContestants(post._id)}
              className="flex items-center bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 transition-colors duration-300 text-sm md:text-base"
            >
              <Eye size={16} className="mr-1" />
              View Applicants
            </button>
            <button
              onClick={() => handleViewDetails(post._id)}
              className="flex items-center bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 transition-colors duration-300 text-sm md:text-base"
            >
              <Eye size={16} className="mr-1" />
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobPost;
