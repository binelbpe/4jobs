import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import {
  fetchJobPosts,
  blockJobPost,
  unblockJobPost,
} from "../../redux/slices/adminJobPostSlice";
import { BasicJobPost } from "../../types/jobPostTypes";
import {
  FaExclamationTriangle,
  FaUserFriends,
  FaEye,
  FaBan,
  FaUnlock,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBuilding,
} from "react-icons/fa";
import Header from "../admin/AdminHeader";
import Sidebar from "../admin/AdminSidebar";

const ITEMS_PER_PAGE = 10;

const AdminJobPost: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { jobPosts, loading, error } = useSelector(
    (state: RootState) => state.adminJobPost
  );
  const [selectedPost, setSelectedPost] = useState<BasicJobPost | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmAction, setConfirmAction] = useState<{
    type: "block" | "unblock";
    postId: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [localJobPosts, setLocalJobPosts] = useState<BasicJobPost[]>([]);
  const [sortCriteria, setSortCriteria] = useState<"reports" | "date">(
    "reports"
  );
  const [showApplicants, setShowApplicants] = useState(false);

  useEffect(() => {
    dispatch(fetchJobPosts());
  }, [dispatch]);

  useEffect(() => {
    const sortedPosts = [...jobPosts].sort((a, b) => {
      if (sortCriteria === "reports") {
        const aReportCount = a.reports?.length || 0;
        const bReportCount = b.reports?.length || 0;
        if (bReportCount !== aReportCount) {
          return bReportCount - aReportCount;
        }
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    setLocalJobPosts(sortedPosts);
  }, [jobPosts, sortCriteria]);

  const handleViewDetails = (post: BasicJobPost) => {
    setSelectedPost(post);
  };

  const handleBlockPost = (postId: string) => {
    setConfirmAction({ type: "block", postId });
  };

  const handleUnblockPost = (postId: string) => {
    setConfirmAction({ type: "unblock", postId });
  };

  const confirmBlockUnblock = () => {
    if (confirmAction) {
      if (confirmAction.type === "block") {
        dispatch(blockJobPost(confirmAction.postId));
      } else {
        dispatch(unblockJobPost(confirmAction.postId));
      }
      setLocalJobPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === confirmAction.postId
            ? { ...post, isBlock: confirmAction.type === "block" }
            : post
        )
      );
      setConfirmAction(null);
    }
  };

  const filteredPosts = localJobPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.company?.name
        ? post.company.name.toLowerCase().includes(searchTerm.toLowerCase())
        : false)
  );

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {error}
      </div>
    );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <Header />
        <div className="p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)]">
          <h1 className="text-2xl font-bold mb-4 text-purple-800">Job Posts</h1>
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-center">
            <div className="relative w-full sm:w-64 mb-2 sm:mb-0">
              <input
                type="text"
                placeholder="Search job posts..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-purple-400" />
            </div>
            <div className="flex items-center">
              <span className="mr-2 text-sm text-purple-600">Sort by:</span>
              <select
                value={sortCriteria}
                onChange={(e) =>
                  setSortCriteria(e.target.value as "reports" | "date")
                }
                className="border border-purple-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="reports">Reports</option>
                <option value="date">Date</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-purple-200">
              <thead className="bg-purple-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">
                    Job Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider hidden md:table-cell">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider hidden lg:table-cell">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider hidden xl:table-cell">
                    Posted Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">
                    Reports
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-purple-200">
                {paginatedPosts.map((post) => (
                  <tr
                    key={post._id}
                    className="hover:bg-purple-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-purple-900">
                        {post.title}
                      </div>
                      <div className="text-sm text-purple-500">
                        {post.company?.name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="flex items-center text-sm text-purple-600">
                        <FaBuilding className="mr-2" />
                        {post.company?.name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="flex items-center text-sm text-purple-600">
                        <FaMapMarkerAlt className="mr-2" />
                        {post.location || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden xl:table-cell">
                      <div className="flex items-center text-sm text-purple-600">
                        <FaCalendarAlt className="mr-2" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {post.reports && post.reports.length > 0 ? (
                        <div className="flex items-center text-red-500">
                          <FaExclamationTriangle className="mr-2" />
                          <span>{post.reports.length} report(s)</span>
                        </div>
                      ) : (
                        <span className="text-green-500">No reports</span>
                      )}
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
          <div className="mt-4 flex justify-between items-center">
            <span className="text-purple-800">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 disabled:bg-purple-300 disabled:cursor-not-allowed"
              >
                <FaChevronLeft className="inline mr-1" /> Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 disabled:bg-purple-300 disabled:cursor-not-allowed"
              >
                Next <FaChevronRight className="inline ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-purple-800">
              {selectedPost.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="mb-2">
                  <strong>Company:</strong>{" "}
                  {selectedPost.company?.name || "N/A"}
                </p>
                <p className="mb-2">
                  <strong>Location:</strong> {selectedPost.location || "N/A"}
                </p>
                <p className="mb-2">
                  <strong>Way of Work:</strong>{" "}
                  {selectedPost.wayOfWork || "N/A"}
                </p>
                <p className="mb-2">
                  <strong>Salary Range:</strong> ₹
                  {selectedPost.salaryRange?.min || "N/A"} - ₹
                  {selectedPost.salaryRange?.max || "N/A"}
                </p>
                <p className="mb-2">
                  <strong>Status:</strong> {selectedPost.status || "N/A"}
                </p>
                <p className="mb-2">
                  <strong>Block Status:</strong>{" "}
                  {selectedPost.isBlock ? "Blocked" : "Active"}
                </p>
              </div>
              <div>
                <p className="mb-2">
                  <strong>Posted Date:</strong>{" "}
                  {new Date(selectedPost.createdAt).toLocaleDateString()}
                </p>
                <p className="mb-2">
                  <strong>Last Updated:</strong>{" "}
                  {new Date(selectedPost.updatedAt).toLocaleDateString()}
                </p>
                <p className="mb-2">
                  <strong>Job Priority:</strong>{" "}
                  {selectedPost.jobPriority || "N/A"}
                </p>
                <p className="mb-2">
                  <strong>Recruiter:</strong>{" "}
                  {selectedPost.recruiterId?.name || "N/A"}-{" "}
                  {selectedPost.recruiterId?.email}
                </p>
                <p className="mb-2">
                  <strong>Applicants:</strong>{" "}
                  {selectedPost.applicants?.length || 0}
                </p>
                <button
                  onClick={() => setShowApplicants(true)}
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors duration-200"
                >
                  <FaUserFriends className="inline mr-1" /> View Applicants
                </button>
                <p className="mb-2">
                  <strong>Reports:</strong> {selectedPost.reports?.length || 0}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Description:</h3>
              <p className="mb-4 text-gray-700">
                {selectedPost.description || "N/A"}
              </p>
              <h3 className="text-lg font-semibold mb-2">Skills Required:</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedPost.skillsRequired?.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                )) || "N/A"}
              </div>
              <h3 className="text-lg font-semibold mb-2">Qualifications:</h3>
              <ul className="list-disc list-inside mb-4 text-gray-700">
                {selectedPost.qualifications?.map((qualification, index) => (
                  <li key={index}>{qualification}</li>
                )) || <li>N/A</li>}
              </ul>
              {selectedPost.reports && selectedPost.reports.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-red-600">
                    Reports:
                  </h3>
                  <ul className="list-disc list-inside mb-4 text-gray-700">
                    {selectedPost.reports.map((report, index) => (
                      <li key={index}>
                        <strong>{report.user?.name}</strong>: {report.reason}
                        <span className="text-sm text-gray-500 ml-2">
                          ({new Date(report.createdAt).toLocaleDateString()})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {showApplicants && selectedPost && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
                <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <h2 className="text-2xl font-bold mb-4 text-purple-800">
                    Applicants for {selectedPost.title}
                  </h2>
                  {selectedPost.applicants &&
                  selectedPost.applicants.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedPost.applicants.map((applicant, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {applicant.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {applicant.email}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-700">No applicants yet.</p>
                  )}
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setShowApplicants(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors duration-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="mt-6 flex justify-end space-x-2">
              {!selectedPost.isBlock ? (
                <button
                  onClick={() => {
                    setConfirmAction({
                      type: "block",
                      postId: selectedPost._id,
                    });
                    setSelectedPost(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
                >
                  Block Post
                </button>
              ) : (
                <button
                  onClick={() => {
                    setConfirmAction({
                      type: "unblock",
                      postId: selectedPost._id,
                    });
                    setSelectedPost(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
                >
                  Unblock Post
                </button>
              )}
              <button
                onClick={() => setSelectedPost(null)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-purple-800">
              Confirm Action
            </h2>
            <p className="mb-4">
              Are you sure you want to{" "}
              {confirmAction.type === "block" ? "block" : "unblock"} this job
              post?
              {confirmAction.type === "block"
                ? " This will prevent users from viewing or applying to this job."
                : " This will make the job post visible and allow users to apply again."}
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmBlockUnblock}
                className={`px-4 py-2 text-white rounded transition-colors duration-200 ${
                  confirmAction.type === "block"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Confirm {confirmAction.type === "block" ? "Block" : "Unblock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobPost;
