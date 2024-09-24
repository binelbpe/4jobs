import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../../redux/store';
import { createJobPost } from '../../../redux/slices/jobPostSlice';
import JobPostForm from './JobPostForm';
import { BasicJobPostFormData } from '../../../types/jobPostTypes';
import RecruiterHeader from '../RecruiterHeader'; // Import the header

const CreateJobPost: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { recruiter } = useSelector((state: RootState) => state.recruiter);

  const handleSubmit = async (formData: BasicJobPostFormData) => {
    if (recruiter && recruiter.id) {
      try {
        // Ensure all required fields are included
        const jobPostData = {
          ...formData,
          recruiterId: recruiter.id,
        };

        await dispatch(createJobPost({ recruiterId: recruiter.id, postData: jobPostData })).unwrap();
        navigate('/recruiter/jobs'); // Navigate back to job list after successful creation
      } catch (error) {
        console.error('Failed to create job post:', error);
        // Handle error (e.g., show error message to user)
      }
    } else {
      console.error('Recruiter ID is not available');
      // Handle error (e.g., show error message to user or redirect to login)
    }
  };

  if (!recruiter) {
    return <p>Please log in to create a job post.</p>;
  }

  return (
    <div>
      <RecruiterHeader /> {/* Render the header component */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Create New Job Post</h2>
        <JobPostForm recruiterId={recruiter._id} onSubmit={handleSubmit} isEditing={false} />
      </div>
    </div>
  );
};

export default CreateJobPost;
