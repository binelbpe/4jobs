import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import {
  fetchUserPosts,
  blockUserPost,
} from "../../redux/slices/adminUserPostSlice";
import Sidebar from "./AdminSidebar";
import Header from "./AdminHeader";
import ConfirmationModal from "../common/ConfirmationModal";

const ITEMS_PER_PAGE = 10;

interface UserPost {
  id: string;
  userName: string;
  userEmail: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  isBlocked: boolean;
}

const AdminUserPostManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userPosts, loading, error, totalPages, currentPage } = useSelector(
    (state: RootState) => state.userPosts
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<UserPost | null>(null);
  const [showContent, setShowContent] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchUserPosts({ page: currentPage, limit: ITEMS_PER_PAGE }));
  }, [dispatch, currentPage]);

  const handleBlockPost = (post: UserPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const confirmBlockPost = () => {
    if (selectedPost) {
      dispatch(blockUserPost(selectedPost.id));
      setIsModalOpen(false);
      setSelectedPost(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(fetchUserPosts({ page: newPage, limit: ITEMS_PER_PAGE }));
    }
  };

  const toggleContent = (postId: string) => {
    if (showContent === postId) {
      setShowContent(null);
    } else {
      setShowContent(postId);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!userPosts || userPosts.length === 0) return <div>No user posts found.</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            User Post Management
          </h1>
          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Post ID
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User Name
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User Email
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Media
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {userPosts.map((post: UserPost) => (
                  <tr key={post.id}>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      {post.id}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      {post.userName}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      {post.userEmail}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <button
                        onClick={() => toggleContent(post.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {showContent === post.id
                          ? "Hide Content"
                          : "Show Content"}
                      </button>
                      {showContent === post.id && (
                        <div className="mt-2">{post.content}</div>
                      )}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      {post.imageUrl && (
                        <button
                          onClick={() => window.open(post.imageUrl, "_blank")}
                          className="text-green-600 hover:text-green-900 mr-2"
                        >
                          View Image
                        </button>
                      )}
                      {post.videoUrl && (
                        <button
                          onClick={() => window.open(post.videoUrl, "_blank")}
                          className="text-green-600 hover:text-green-900"
                        >
                          View Video
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <button
                        onClick={() => handleBlockPost(post)}
                        className={`${
                          post.isBlocked
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-red-500 hover:bg-red-600"
                        } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
                      >
                        {post.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div>
              <span>
                Page {currentPage} of {totalPages}
              </span>
            </div>
            <div>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 mr-2 bg-purple-500 text-white rounded disabled:bg-gray-300"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-purple-500 text-white rounded disabled:bg-gray-300"
              >
                Next
              </button>
            </div>
          </div>
        </main>
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmBlockPost}
        title={`${selectedPost?.isBlocked ? "Unblock" : "Block"} User Post`}
        message={`Are you sure you want to ${
          selectedPost?.isBlocked ? "unblock" : "block"
        } this post by ${selectedPost?.userName}?`}
      />
    </div>
  );
};

export default AdminUserPostManagement;
