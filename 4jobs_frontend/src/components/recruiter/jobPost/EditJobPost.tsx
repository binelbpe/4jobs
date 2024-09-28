import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { updateJobPost } from '../../../redux/slices/jobPostSlice';
import JobPostForm from './JobPostForm';
import { BasicJobPostFormData } from '../../../types/jobPostTypes';
import RecruiterHeader from '../RecruiterHeader';
import Toast from './Toast';
import { Edit } from 'lucide-react';

const EditJobPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { posts } = useSelector((state: RootState) => state.jobPosts);
  const { recruiter } = useSelector((state: RootState) => state.recruiter);
  const [jobPost, setJobPost] = useState<BasicJobPostFormData | null>(null);

  useEffect(() => {
    const post = posts.find(p => p._id === id);
    if (post) {
      setJobPost(post);
    } else {
      Toast({ message: 'Job post not found.', type: 'error' });
      navigate('/recruiter/jobs');
    }
  }, [id, posts, navigate]);

  const handleSubmit = async (formData: BasicJobPostFormData) => {
    if (id && recruiter?.id) {
      try {
        await dispatch(updateJobPost({ id, postData: formData })).unwrap();
        Toast({ message: 'Job post updated successfully', type: 'success' });
        navigate('/recruiter/jobs');
      } catch (error) {
        console.error('Failed to update job post:', error);
        Toast({ message: 'Failed to update job post. Please try again.', type: 'error' });
      }
    } else {
      Toast({ message: 'Recruiter ID is not available.', type: 'error' });
    }
  };

  if (!jobPost) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
    </div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <RecruiterHeader />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-purple-700 flex items-center">
            <Edit className="mr-2" /> Edit Job Post
          </h2>
          <JobPostForm
            initialData={jobPost}
            recruiterId={recruiter?.id || ''}
            isEditing={true}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default EditJobPost;