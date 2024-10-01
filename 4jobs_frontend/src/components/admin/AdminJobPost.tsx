import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchJobPosts, blockJobPost, unblockJobPost } from '../../redux/slices/adminJobPostSlice';
import { BasicJobPost } from '../../types/jobPostTypes';
import { FaExclamationTriangle, FaUserFriends, FaEye, FaBan, FaUnlock, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Header from '../admin/AdminHeader';
import Sidebar from '../admin/AdminSidebar';

const ITEMS_PER_PAGE = 10;

const AdminJobPost: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { jobPosts, loading, error } = useSelector((state: RootState) => state.adminJobPost);
  const [selectedPost, setSelectedPost] = useState<BasicJobPost | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ type: 'block' | 'unblock', postId: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [localJobPosts, setLocalJobPosts] = useState<BasicJobPost[]>([]);

  useEffect(() => {
    dispatch(fetchJobPosts());
  }, [dispatch]);

  useEffect(() => {
    // Sort job posts by reported count (descending) and update date (descending)
    const sortedPosts = [...jobPosts].sort((a, b) => {
      const aReportCount = a.reportedBy?.length || 0;
      const bReportCount = b.reportedBy?.length || 0;
      if (bReportCount !== aReportCount) {
        return bReportCount - aReportCount;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    setLocalJobPosts(sortedPosts);
  }, [jobPosts]);

  const handleViewDetails = (post: BasicJobPost) => {
    setSelectedPost(post);
  };

  const handleBlockPost = (postId: string) => {
    setConfirmAction({ type: 'block', postId });
  };

  const handleUnblockPost = (postId: string) => {
    setConfirmAction({ type: 'unblock', postId });
  };

  const confirmBlockUnblock = () => {
    if (confirmAction) {
      if (confirmAction.type === 'block') {
        dispatch(blockJobPost(confirmAction.postId));
      } else {
        dispatch(unblockJobPost(confirmAction.postId));
      }
      // Update local state
      setLocalJobPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === confirmAction.postId
            ? { ...post, isBlock: confirmAction.type === 'block' }
            : post
        )
      );
      setConfirmAction(null);
    }
  };

  const filteredPosts = localJobPosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <Header />
        <div className="p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)]">
          <h1 className="text-2xl font-bold mb-4 text-purple-800">Job Posts</h1>
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search job posts..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-purple-400" />
            </div>
          </div>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-purple-200">
              <thead className="bg-purple-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider hidden md:table-cell">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider hidden lg:table-cell">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider hidden xl:table-cell">Applicants</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider hidden sm:table-cell">Reported By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Block Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-purple-200">
                {paginatedPosts.map((post) => (
                  <tr key={post._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{post.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">{post.company.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">{post.location}</td>
                    <td className="px-6 py-4 hidden xl:table-cell">
                      <div className="flex items-center">
                        <FaUserFriends className="mr-2 text-purple-500" />
                        <span>{post.applicants?.length || 0}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {post.applicants?.slice(0, 3).join(', ')}
                        {post.applicants && post.applicants.length > 3 ? '...' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      {post.reportedBy && post.reportedBy.length > 0 ? (
                        <div className="flex items-center text-red-500">
                          <FaExclamationTriangle className="mr-2" />
                          <span>{post.reportedBy.length} user(s)</span>
                        </div>
                      ) : (
                        <span className="text-green-500">No reports</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        post.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        post.isBlock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {post.isBlock ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <button
                          onClick={() => handleViewDetails(post)}
                          className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors duration-200"
                          title="View Details"
                        >
                          <FaEye className="inline mr-1" /> View
                        </button>
                        {!post.isBlock ? (
                          <button
                            onClick={() => handleBlockPost(post._id)}
                            className="bg-red-100 text-red-800 px-3 py-1 rounded-full hover:bg-red-200 transition-colors duration-200"
                            title="Block Post"
                          >
                            <FaBan className="inline mr-1" /> Block
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnblockPost(post._id)}
                            className="bg-green-100 text-green-800 px-3 py-1 rounded-full hover:bg-green-200 transition-colors duration-200"
                            title="Unblock Post"
                          >
                            <FaUnlock className="inline mr-1" /> Unblock
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-2 sm:mb-0">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredPosts.length)} of {filteredPosts.length} entries
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-purple-100 text-purple-800 disabled:opacity-50"
              >
                <FaChevronLeft />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded ${
                    currentPage === page
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-purple-100 text-purple-800 disabled:opacity-50"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-purple-800">{selectedPost.title}</h2>
            <p className="mb-2"><strong>Company:</strong> {selectedPost.company.name}</p>
            <p className="mb-2"><strong>Location:</strong> {selectedPost.location}</p>
            <p className="mb-2"><strong>Way of Work:</strong> {selectedPost.wayOfWork}</p>
            <p className="mb-2"><strong>Salary Range:</strong> ${selectedPost.salaryRange.min} - ${selectedPost.salaryRange.max}</p>
            <p className="mb-2"><strong>Description:</strong> {selectedPost.description}</p>
            <p className="mb-2"><strong>Skills Required:</strong> {selectedPost.skillsRequired.join(', ')}</p>
            <p className="mb-2"><strong>Qualifications:</strong> {selectedPost.qualifications.join(', ')}</p>
            <p className="mb-2"><strong>Status:</strong> {selectedPost.status}</p>
            <p className="mb-2"><strong>Block Status:</strong> {selectedPost.isBlock ? 'Blocked' : 'Active'}</p>
            <p className="mb-2"><strong>Applicants:</strong> {selectedPost.applicants?.join(', ') || 'None'}</p>
            {selectedPost.reportedBy && selectedPost.reportedBy.length > 0 && (
              <p className="mb-2 text-red-500"><strong>Reported By:</strong> {selectedPost.reportedBy.join(', ')}</p>
            )}
            <button
              onClick={() => setSelectedPost(null)}
              className="mt-4 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
     {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Action</h2>
            <p className="mb-4">Are you sure you want to {confirmAction.type} this job post?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmBlockUnblock}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobPost;