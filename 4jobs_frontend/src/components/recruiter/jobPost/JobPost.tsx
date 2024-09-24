import React from 'react';
import { BasicJobPost } from '../../../types/jobPostTypes';


interface JobPostProps {
  jobPosts: BasicJobPost[];
  onDelete: (id: string) => Promise<void>;
  onEdit: (post: { _id: string }) => void;
  onToggleStatus: (post: BasicJobPost) => void;
}

const JobPost: React.FC<JobPostProps> = ({ jobPosts, onDelete, onEdit, onToggleStatus }) => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobPosts.map((post) => (
          <div key={post._id} className="border p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-bold mb-2">{post.title}</h3>
            <p className="mb-2 text-gray-600">{post.description.substring(0, 100)}...</p>
            <div className="mb-2">
              <span className="font-semibold">Company:</span> {post.company.name}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Location:</span> {post.location}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Salary Range:</span> ${post.salaryRange.min.toLocaleString()} - ${post.salaryRange.max.toLocaleString()}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Way of Work:</span> {post.wayOfWork}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Skills Required:</span> {post.skillsRequired.join(', ')}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Qualifications:</span> {post.qualifications.join(', ')}
            </div>
            <div className="mb-4">
              <span className={`font-semibold ${post.status === 'Open' ? 'text-green-600' : 'text-red-600'}`}>
                Status: {post.status}
              </span>
            </div>
            <div className="flex justify-between">
              <button 
                onClick={() => onEdit(post)} 
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600 transition-colors duration-300"
              >
                Edit
              </button>
              <button 
                onClick={() => onDelete(post._id)} 
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-300"
              >
                Delete
              </button>
              <button 
                onClick={() => onToggleStatus(post)} 
                className={`px-4 py-2 rounded transition-colors duration-300 ${
                  post.status === 'Open' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
                } text-white`}
              >
                {post.status === 'Open' ? 'Close' : 'Reopen'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobPost;
