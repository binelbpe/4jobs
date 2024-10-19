import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRecruiters,
  approveRecruiter,
} from "../../redux/slices/adminSlice";
import { RootState, AppDispatch } from "../../redux/store";
import { Navigate } from "react-router-dom";
import Header from "./AdminHeader";
import Sidebar from "./AdminSidebar";
import { FaCheck, FaDownload, FaChevronLeft, FaChevronRight, FaSearch, FaTimes } from "react-icons/fa";
import "../../styles/admin/RecruiterList.css";

const AdminRecruiterList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    recruiters: fetchedRecruiters,
    error,
    loading,
    isAuthenticatedAdmin,
    token,
  } = useSelector((state: RootState) => state.admin);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isAuthenticatedAdmin && token) {
      dispatch(fetchRecruiters());
    }
  }, [dispatch, isAuthenticatedAdmin, token]);

  const handleApprove = async (recruiterId: string) => {
    try {
      await dispatch(approveRecruiter(recruiterId)).unwrap();
      dispatch(fetchRecruiters());
    } catch (err) {
      console.error("Failed to approve recruiter", err);
    }
  };

  const handleDownloadGovernmentId = (url: string, recruiterName: string) => {
    const anchor = document.createElement("a");
    const fullurl = `http://localhost:5000/${url}`;
    anchor.href = fullurl;
    anchor.setAttribute("download", `${recruiterName}-government-id`);
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const totalPages = Math.ceil(fetchedRecruiters.length / itemsPerPage);
  const filteredRecruiters = fetchedRecruiters.filter((recruiter) =>
    recruiter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recruiter.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  if (!isAuthenticatedAdmin) {
    return <Navigate to="/admin/login" />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-2 sm:p-4 md:p-6 flex-grow overflow-auto">
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-purple-800">Recruiter List</h2>
            {loading && <p className="text-purple-600">Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <div className="mb-4 flex flex-col sm:flex-row">
              <div className="relative flex-grow mb-2 sm:mb-0 sm:mr-2">
                <input
                  type="text"
                  placeholder="Search recruiters..."
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

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white text-sm sm:text-base">
                <thead className="bg-purple-100">
                  <tr>
                    <th className="py-2 sm:py-3 px-3 sm:px-6 text-left text-xs sm:text-sm font-medium text-purple-800 uppercase tracking-wider">Name</th>
                    <th className="py-2 sm:py-3 px-3 sm:px-6 text-left text-xs sm:text-sm font-medium text-purple-800 uppercase tracking-wider">Email</th>
                    <th className="py-2 sm:py-3 px-3 sm:px-6 text-left text-xs sm:text-sm font-medium text-purple-800 uppercase tracking-wider">Phone</th>
                    <th className="py-2 sm:py-3 px-3 sm:px-6 text-left text-xs sm:text-sm font-medium text-purple-800 uppercase tracking-wider">Status</th>
                    <th className="py-2 sm:py-3 px-3 sm:px-6 text-left text-xs sm:text-sm font-medium text-purple-800 uppercase tracking-wider">Actions</th>
                    <th className="py-2 sm:py-3 px-3 sm:px-6 text-left text-xs sm:text-sm font-medium text-purple-800 uppercase tracking-wider">Government ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-200">
                  {filteredRecruiters.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((recruiter) => (
                    <tr key={recruiter._id} className="hover:bg-purple-50">
                      <td className="py-2 sm:py-4 px-3 sm:px-6">{recruiter.name}</td>
                      <td className="py-2 sm:py-4 px-3 sm:px-6">{recruiter.email}</td>
                      <td className="py-2 sm:py-4 px-3 sm:px-6">{recruiter.phone}</td>
                      <td className="py-2 sm:py-4 px-3 sm:px-6">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          recruiter.isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {recruiter.isApproved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="py-2 sm:py-4 px-3 sm:px-6">
                        {!recruiter.isApproved && (
                          <button
                            onClick={() => handleApprove(recruiter.id)}
                            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-1 sm:py-2 px-2 sm:px-4 rounded text-xs sm:text-sm inline-flex items-center"
                          >
                            <FaCheck className="mr-1 sm:mr-2" /> Approve
                          </button>
                        )}
                      </td>
                      <td className="py-2 sm:py-4 px-3 sm:px-6">
                        {recruiter.governmentId ? (
                          <button
                            onClick={() => handleDownloadGovernmentId(recruiter.governmentId, recruiter.name)}
                            className="bg-purple-400 hover:bg-purple-800 text-white font-bold py-1 sm:py-2 px-2 sm:px-4 rounded text-xs sm:text-sm inline-flex items-center"
                          >
                            <FaDownload className="mr-1 sm:mr-2" /> Download ID
                          </button>
                        ) : (
                          <span className="text-gray-500 text-xs sm:text-sm">No ID uploaded</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 sm:mt-6">
              <div className="flex space-x-2 mb-2 sm:mb-0">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="bg-purple-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded hover:bg-purple-600 disabled:opacity-50 flex items-center text-xs sm:text-sm"
                  disabled={currentPage === 1}
                >
                  <FaChevronLeft className="mr-1 sm:mr-2" /> Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="bg-purple-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded hover:bg-purple-600 disabled:opacity-50 flex items-center text-xs sm:text-sm"
                  disabled={currentPage === totalPages}
                >
                  Next <FaChevronRight className="ml-1 sm:ml-2" />
                </button>
              </div>
              <span className="text-xs sm:text-sm text-purple-600">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminRecruiterList;
