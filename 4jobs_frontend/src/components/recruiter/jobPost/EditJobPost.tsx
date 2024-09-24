import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { updateJobPost } from '../../../redux/slices/jobPostSlice';
import JobPostForm from './JobPostForm';
import { BasicJobPostFormData } from '../../../types/jobPostTypes';
import RecruiterHeader from '../RecruiterHeader';

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
      console.error('Job post not found');
      navigate('/recruiter/jobs');
    }
  }, [id, posts, navigate]);

  const handleSubmit = async (formData: BasicJobPostFormData) => {
    if (id && recruiter?.id) {
      try {
        await dispatch(updateJobPost({ id, postData: formData })).unwrap();
        navigate('/recruiter/jobs');
      } catch (error) {
        console.error('Failed to update job post:', error);
      }
    }
  };
  

  if (!jobPost) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <RecruiterHeader /> {/* Render the RecruiterHeader */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">Edit Job Post</h2>
        <JobPostForm
          initialData={jobPost}
          recruiterId={recruiter?._id || ''}
          isEditing={true}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default EditJobPost;
