import React, { useEffect, useCallback, useState } from "react";
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
import { Plus, Loader, AlertCircle } from "lucide-react";
import RecruiterHeader from "../RecruiterHeader";
import ConfirmationModal from "./ConfirmationModal";

const JobPostWrapper: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { posts, loading, error } = useSelector(
    (state: RootState) => state.jobPosts
  );
  const { recruiter } = useSelector((state: RootState) => state.recruiter);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (recruiter && recruiter._id) {
      dispatch(fetchJobPosts(recruiter._id));
    }
  }, [dispatch, recruiter]);

  const handleDelete = useCallback(async (id: string): Promise<void> => {
    setPostToDelete(id);
    setIsModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async (): Promise<void> => {
    if (postToDelete) {
      try {
        await dispatch(deleteJobPost(postToDelete)).unwrap();
      } catch (error) {
        console.error("Failed to delete job post:", error);
      }
    }
    setIsModalOpen(false);
    setPostToDelete(null);
  }, [dispatch, postToDelete]);

  const handleEdit = useCallback(
    (post: { _id: string }) => {
      navigate(`/recruiter/jobs/edit/${post._id}`);
    },
    [navigate]
  );

  const handleCreate = useCallback(() => {
    navigate("/recruiter/jobs/create");
  }, [navigate]);

  const handleToggleStatus = useCallback(
    (post: BasicJobPost): Promise<void> => {
      const updatedPost = {
        ...post,
        status: post.status === "Open" ? "Closed" : "Open",
      };
      return dispatch(
        updateJobPost({ id: post._id, postData: updatedPost })
      ).unwrap();
    },
    [dispatch]
  );

  const handleViewContestants = useCallback(
    (postId: string) => {
      navigate(`/recruiter/job-applicants/${postId}`);
    },
    [navigate]
  );

  if (!recruiter) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <AlertCircle size={48} className="text-yellow-500 mb-4" />
        <p className="text-xl text-gray-800 font-semibold mb-2">
          Access Restricted
        </p>
        <p className="text-gray-600">Please log in to view job posts.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <RecruiterHeader />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-purple-900">
              Job Posts
            </h2>
            <div className="flex space-x-4">
              <button
                onClick={handleCreate}
                className="bg-purple-600 text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-purple-700 transition duration-300 flex items-center shadow-md text-sm sm:text-base"
              >
                <Plus size={20} className="mr-2" />
                Create New Job Post
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader className="animate-spin h-12 w-12 text-purple-500" />
            </div>
          ) : error ? (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md"
              role="alert"
            >
              <div className="flex items-center">
                <AlertCircle className="h-6 w-6 mr-2" />
                <p className="font-bold">Error</p>
              </div>
              <p className="mt-2">{error}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <AlertCircle size={48} className="text-yellow-500 mx-auto mb-4" />
              <p className="text-xl text-gray-800 font-semibold mb-2">
                No Job Posts Available
              </p>
              <p className="text-gray-600 mb-4">
                Click 'Create New Job Post' to add your first job listing.
              </p>
              <button
                onClick={handleCreate}
                className="bg-purple-600 text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-purple-700 transition duration-300 inline-flex items-center text-sm sm:text-base"
              >
                <Plus size={20} className="mr-2" />
                Create New Job Post
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <JobPost
                jobPosts={posts}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
                onViewContestants={handleViewContestants}
              />
            </div>
          )}
        </div>
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Job Post"
          message="Are you sure you want to delete this job post? This action cannot be undone."
        />
      </div>
    </div>
  );
};

export default JobPostWrapper;
