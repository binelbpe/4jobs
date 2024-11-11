import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../../../redux/store";
import {
  fetchJobPosts,
  deleteJobPost,
  updateJobPost,
} from "../../../redux/slices/jobPostSlice";
import JobPost from "./JobPost";
import { BasicJobPost } from "../../../types/jobPostTypes";

const JobPostList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { posts, loading, error } = useSelector(
    (state: RootState) => state.jobPosts
  );
  const { recruiter } = useSelector((state: RootState) => state.recruiter);

  useEffect(() => {
    if (recruiter && recruiter._id) {
      dispatch(fetchJobPosts(recruiter._id));
    }
  }, [dispatch, recruiter]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await dispatch(deleteJobPost(id)).unwrap();
      } catch (error) {
        console.error("Failed to delete job post:", error);
      }
    },
    [dispatch]
  );

  const handleEdit = useCallback(
    (post: { _id: string }) => {
      navigate(`/recruiter/jobs/edit/${post._id}`);
    },
    [navigate]
  );

  const handleCreate = useCallback(() => {
    navigate("/recruiter/jobs/create");
  }, [navigate]);

  const handleApplicants = useCallback(
    (postId: string) => {
      navigate(`/recruiter/jobsContestants/${postId}`);
    },
    [navigate]
  );

  const handleToggleStatus = useCallback(
    async (post: BasicJobPost) => {
      const updatedPost = {
        ...post,
        status: post.status === "Open" ? "Closed" : "Open",
      };
      try {
        await dispatch(
          updateJobPost({ id: post._id, postData: updatedPost })
        ).unwrap();
        await dispatch(fetchJobPosts(recruiter._id));
      } catch (error) {
        console.error("Failed to toggle job post status:", error);
      }
    },
    [dispatch, recruiter?._id]
  );

  if (!recruiter) return <p>Please log in to view job posts.</p>;
  if (loading) return <p>Loading job posts...</p>;
  if (error) return <p>Error fetching job posts: {error}</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Job Posts</h2>
        <button
          onClick={handleCreate}
          className="bg-purple-600 text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-purple-700 transition duration-300 text-sm sm:text-base"
        >
          Create New Job Post
        </button>
      </div>
      {posts.length === 0 ? (
        <p className="text-sm md:text-base">No job posts available.</p>
      ) : (
        <JobPost
          jobPosts={posts}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onViewContestants={handleApplicants}
        />
      )}
    </div>
  );
};

export default JobPostList;
