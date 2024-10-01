import React from 'react';
import { BasicJobPost } from '../../../types/jobPostTypes';
import { Briefcase, MapPin, IndianRupee, Users, Edit, Trash2, ToggleLeft, ToggleRight, Eye } from 'lucide-react';

interface JobPostProps {
  jobPosts: BasicJobPost[];
  onDelete: (id: string) => Promise<void>;
  onEdit: (post: { _id: string }) => void;
  onToggleStatus: (post: BasicJobPost) => Promise<void>;
  onViewContestants: (postId: string) => void;
}

const JobPost: React.FC<JobPostProps> = ({ jobPosts, onDelete, onEdit, onToggleStatus, onViewContestants }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobPosts.map((post) => (
        <div key={post._id} className="bg-white border border-purple-200 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-xl font-bold mb-3 text-purple-800">{post.title}</h3>
          <p className="mb-4 text-gray-600">{post.description.substring(0, 100)}...</p>
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-700">
              <Briefcase size={18} className="mr-2 text-purple-600" />
              <span>{post.company.name}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <MapPin size={18} className="mr-2 text-purple-600" />
              <span>{post.location}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <IndianRupee size={18} className="mr-2 text-purple-600" />
              <span>₹{post.salaryRange.min.toLocaleString()} - ₹{post.salaryRange.max.toLocaleString()}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Users size={18} className="mr-2 text-purple-600" />
              <span>{post.wayOfWork}</span>
            </div>
          </div>
          <div className="mb-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              post.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {post.status === 'Open' ? <ToggleRight size={14} className="mr-1" /> : <ToggleLeft size={14} className="mr-1" />}
              {post.status}
            </span>
          </div>
          <div className="flex flex-wrap justify-between mt-4 gap-2">
            <button 
              onClick={() => onEdit(post)} 
              className="flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 transition-colors duration-300"
            >
              <Edit size={16} className="mr-1" />
              Edit
            </button>
            <button 
              onClick={() => onDelete(post._id)} 
              className="flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 transition-colors duration-300"
            >
              <Trash2 size={16} className="mr-1" />
              Delete
            </button>
            <button 
              onClick={() => onToggleStatus(post)} 
              className={`flex items-center px-3 py-1 rounded transition-colors duration-300 ${
                post.status === 'Open' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              {post.status === 'Open' ? <ToggleLeft size={16} className="mr-1" /> : <ToggleRight size={16} className="mr-1" />}
              {post.status === 'Open' ? 'Close' : 'Reopen'}
            </button>
            <button 
              onClick={() => onViewContestants(post._id)} 
              className="flex items-center bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 transition-colors duration-300"
            >
              <Eye size={16} className="mr-1" />
              View Applicants
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobPost;