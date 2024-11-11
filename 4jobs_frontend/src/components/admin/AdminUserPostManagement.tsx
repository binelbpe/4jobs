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
import {
  FaEye,
  FaBan,
  FaUnlock,
  FaImage,
  FaVideo,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

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
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredPosts = userPosts.filter(
    (post: UserPost) =>
      post.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!userPosts || userPosts.length === 0)
    return <div>No user posts found.</div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-2 sm:p-4 md:p-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-purple-800 mb-4 sm:mb-6">
            User Post Management
          </h1>
          <div className="mb-4 flex flex-col sm:flex-row">
            <div className="relative flex-grow mb-2 sm:mb-0 sm:mr-2">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg text-gray-700 focus:outline-none focus:border-purple-500"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
                >
                  <FaTimes className="text-sm sm:text-base" />
                </button>
              )}
            </div>
            <button className="bg-purple-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-600 text-sm sm:text-base">
              <FaSearch className="inline mr-1" /> Search
            </button>
          </div>
          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full leading-normal text-sm sm:text-base">
              <thead>
                <tr className="bg-purple-100">
                  <th className="px-3 sm:px-5 py-2 sm:py-3 border-b-2 border-purple-200 text-left text-xs sm:text-sm font-semibold text-purple-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-3 sm:px-5 py-2 sm:py-3 border-b-2 border-purple-200 text-left text-xs sm:text-sm font-semibold text-purple-700 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-3 sm:px-5 py-2 sm:py-3 border-b-2 border-purple-200 text-left text-xs sm:text-sm font-semibold text-purple-700 uppercase tracking-wider">
                    Media
                  </th>
                  <th className="px-3 sm:px-5 py-2 sm:py-3 border-b-2 border-purple-200 text-left text-xs sm:text-sm font-semibold text-purple-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post: UserPost) => (
                  <tr key={post.id} className="hover:bg-purple-50">
                    <td className="px-3 sm:px-5 py-3 sm:py-5 border-b border-purple-200">
                      <div className="flex items-center">
                        <div>
                          <p className="text-purple-900 whitespace-no-wrap font-semibold">
                            {post.userName}
                          </p>
                          <p className="text-purple-600 whitespace-no-wrap text-xs sm:text-sm">
                            {post.userEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-5 py-3 sm:py-5 border-b border-purple-200">
                      <button
                        onClick={() => toggleContent(post.id)}
                        className="text-purple-600 hover:text-purple-900 text-xs sm:text-sm"
                      >
                        <FaEye className="inline mr-1 sm:mr-2" />
                        {showContent === post.id
                          ? "Hide Content"
                          : "Show Content"}
                      </button>
                      {showContent === post.id && (
                        <div className="mt-2 text-purple-800 text-xs sm:text-sm">
                          {post.content}
                        </div>
                      )}
                    </td>
                    <td className="px-3 sm:px-5 py-3 sm:py-5 border-b border-purple-200">
                      {post.imageUrl && (
                        <button
                          onClick={() => window.open(post.imageUrl, "_blank")}
                          className="text-purple-600 hover:text-purple-900 mr-2 text-xs sm:text-sm"
                        >
                          <FaImage className="inline mr-1" /> View Image
                        </button>
                      )}
                      {post.videoUrl && (
                        <button
                          onClick={() => window.open(post.videoUrl, "_blank")}
                          className="text-purple-600 hover:text-purple-900 text-xs sm:text-sm"
                        >
                          <FaVideo className="inline mr-1" /> View Video
                        </button>
                      )}
                    </td>
                    <td className="px-3 sm:px-5 py-3 sm:py-5 border-b border-purple-200">
                      <button
                        onClick={() => handleBlockPost(post)}
                        className={`${
                          post.isBlocked
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-red-500 hover:bg-red-600"
                        } text-white font-bold py-1 sm:py-2 px-2 sm:px-4 rounded focus:outline-none focus:shadow-outline text-xs sm:text-sm`}
                      >
                        {post.isBlocked ? (
                          <FaUnlock className="inline mr-1 sm:mr-2" />
                        ) : (
                          <FaBan className="inline mr-1 sm:mr-2" />
                        )}
                        {post.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-2 sm:mb-0">
              <span className="text-purple-700 text-xs sm:text-sm">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            <div>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 sm:px-4 py-1 sm:py-2 mr-2 bg-purple-500 text-white rounded disabled:bg-purple-300 text-xs sm:text-sm"
              >
                <FaChevronLeft className="inline mr-1" /> Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 sm:px-4 py-1 sm:py-2 bg-purple-500 text-white rounded disabled:bg-purple-300 text-xs sm:text-sm"
              >
                Next <FaChevronRight className="inline ml-1" />
              </button>
            </div>
          </div>
        </main>
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmBlockPost}
        title={
          selectedPost?.isBlocked ? "Unblock User Post" : "Block User Post"
        }
        message={`Are you sure you want to ${
          selectedPost?.isBlocked ? "unblock" : "block"
        } this post by ${selectedPost?.userName}?`}
      />
    </div>
  );
};

export default AdminUserPostManagement;
