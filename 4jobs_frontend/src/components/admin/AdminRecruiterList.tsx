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
import { FaCheck, FaDownload, FaChevronLeft, FaChevronRight } from "react-icons/fa";
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
  const currentRecruiters = fetchedRecruiters.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!isAuthenticatedAdmin) {
    return <Navigate to="/admin/login" />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6 flex-grow overflow-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-purple-800">Recruiter List</h2>
            {loading && <p className="text-purple-600">Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-purple-100">
                  <tr>
                    <th className="py-3 px-6 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Name</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Email</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Phone</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Actions</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Government ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-200">
                  {currentRecruiters.map((recruiter) => (
                    <tr key={recruiter._id} className="hover:bg-purple-50">
                      <td className="py-4 px-6 text-sm">{recruiter.name}</td>
                      <td className="py-4 px-6 text-sm">{recruiter.email}</td>
                      <td className="py-4 px-6 text-sm">{recruiter.phone}</td>
                      <td className="py-4 px-6 text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          recruiter.isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {recruiter.isApproved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        {!recruiter.isApproved && (
                          <button
                            onClick={() => handleApprove(recruiter.id)}
                            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                          >
                            <FaCheck className="mr-2" /> Approve
                          </button>
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        {recruiter.governmentId ? (
                          <button
                            onClick={() => handleDownloadGovernmentId(recruiter.governmentId, recruiter.name)}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                          >
                            <FaDownload className="mr-2" /> Download ID
                          </button>
                        ) : (
                          <span className="text-gray-500">No ID uploaded</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-6">
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50 flex items-center"
                  disabled={currentPage === 1}
                >
                  <FaChevronLeft className="mr-2" /> Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50 flex items-center"
                  disabled={currentPage === totalPages}
                >
                  Next <FaChevronRight className="ml-2" />
                </button>
              </div>
              <span className="text-sm text-purple-600">
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
