import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchJobPosts, deleteJobPost, updateJobPost } from '../../../redux/slices/jobPostSlice';
import JobPost from './JobPost';
import { BasicJobPost } from '../../../types/jobPostTypes';

const JobPostList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { posts, loading, error } = useSelector((state: RootState) => state.jobPosts);
  const { recruiter } = useSelector((state: RootState) => state.recruiter);

  useEffect(() => {
    if (recruiter && recruiter._id) {
      dispatch(fetchJobPosts(recruiter.id));
    }
  }, [dispatch, recruiter]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await dispatch(deleteJobPost(id)).unwrap();
    } catch (error) {
      console.error('Failed to delete job post:', error);
    }
  }, [dispatch]);

  const handleEdit = useCallback((post: { _id: string }) => {
    navigate(`/recruiter/jobs/edit/${post._id}`);
  }, [navigate]);

  const handleCreate = useCallback(() => {
    navigate('/recruiter/jobs/create');
  }, [navigate]);

  const handleToggleStatus = useCallback(async (post: BasicJobPost) => {
    const updatedPost = { ...post, status: post.status === 'Open' ? 'Closed' : 'Open' };
    console.log('Toggling status for post:', post._id);
    console.log('Updated post data:', updatedPost);
    try {
      const result = await dispatch(updateJobPost({ id: post._id, postData: updatedPost })).unwrap();
      console.log('Update result:', result);
      // Optionally, you can dispatch fetchJobPosts here to refresh the list
      await dispatch(fetchJobPosts(recruiter.id));
    } catch (error) {
      console.error('Failed to toggle job post status:', error);
      // Handle the error (e.g., show an error message to the user)
    }
  }, [dispatch, recruiter.id]);

  if (!recruiter) return <p>Please log in to view job posts.</p>;
  if (loading) return <p>Loading job posts...</p>;
  if (error) return <p>Error fetching job posts: {error}</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Job Posts</h2>
        <button 
          onClick={handleCreate}
          className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-300"
        >
          Create New Job Post
        </button>
      </div>
      {posts.length === 0 ? (
        <p>No job posts available.</p>
      ) : (
        <JobPost
          jobPosts={posts}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
        />
      )}
    </div>
  );
};

export default JobPostList;