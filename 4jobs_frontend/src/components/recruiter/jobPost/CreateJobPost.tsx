import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../../redux/store';
import { createJobPost } from '../../../redux/slices/jobPostSlice';
import JobPostForm from './JobPostForm';
import { BasicJobPostFormData } from '../../../types/jobPostTypes';
import RecruiterHeader from '../RecruiterHeader';
import { toast } from 'react-toastify';
import { PlusCircle } from 'lucide-react';

const CreateJobPost: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { recruiter } = useSelector((state: RootState) => state.recruiter);

  const handleSubmit = async (formData: BasicJobPostFormData) => {
    if (recruiter && recruiter.id) {
      try {
        const jobPostData = {
          ...formData,
          recruiterId: recruiter.id,
        };
        await dispatch(createJobPost({ recruiterId: recruiter.id, postData: jobPostData })).unwrap();
        toast.success('Job post created successfully');
        navigate('/recruiter/jobs');
      } catch (error) {
        console.error('Failed to create job post:', error);
        toast.error('Failed to create job post. Please try again.');
      }
    } else {
      toast.error('Recruiter ID is not available. Please log in.');
    }
  };

  if (!recruiter) {
    return <div className="flex justify-center items-center h-screen text-purple-700">
      Please log in to create a job post.
    </div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <RecruiterHeader />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-purple-700 flex items-center">
            <PlusCircle className="mr-2" /> Create New Job Post
          </h2>
          <JobPostForm
            recruiterId={recruiter.id}
            isEditing={false}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateJobPost;