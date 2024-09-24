import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchJobPosts, deleteJobPost, updateJobPost } from '../../../redux/slices/jobPostSlice';
import JobPost from './JobPost';
import { BasicJobPost } from '../../../types/jobPostTypes';
import RecruiterHeader from '../RecruiterHeader'; 

const JobPostWrapper: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { posts, loading, error } = useSelector((state: RootState) => state.jobPosts);
  const { recruiter } = useSelector((state: RootState) => state.recruiter);
  
  useEffect(() => {
    if (recruiter && recruiter._id) {
      dispatch(fetchJobPosts(recruiter._id));
    }
  }, [dispatch, recruiter]);

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this job post?')) {
      try {
        await dispatch(deleteJobPost(id)).unwrap();
      } catch (error) {
        console.error('Failed to delete job post:', error);
      }
    }
  };

  const handleEdit = (post: { _id: string }) => {
    navigate(`/recruiter/jobs/edit/${post._id}`);
  };

  const handleCreate = () => {
    navigate('/recruiter/jobs/create');
  };

  const handleToggleStatus = (post: BasicJobPost) => {
    const updatedPost = { ...post, status: post.status === 'Open' ? 'Closed' : 'Open' };
    dispatch(updateJobPost({ id: post._id, postData: updatedPost }));
  };

  if (!recruiter) return <p>Please log in to view job posts.</p>;
  if (loading) return <p>Loading job posts...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
  <div>
     <RecruiterHeader />
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Job Posts</h2>
        <button 
          onClick={handleCreate}
          className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300"
        >
          Create New Job Post
        </button>
      </div>
      {posts.length === 0 ? (
        <p className="text-gray-600">No job posts available. Click 'Create New Job Post' to add one.</p>
      ) : (
        <JobPost 
          jobPosts={posts} 
          onDelete={handleDelete} 
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
        />
      )}
    </div>
    </div>
  );
};

export default JobPostWrapper;