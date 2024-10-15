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
        <main className="p-4 flex-grow overflow-auto">
          <div className="bg-white p-4 rounded-md shadow-md">
            <h2 className="text-xl font-semibold mb-4">Recruiter List</h2>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border-collapse">
                <thead>
                  <tr>
                    <th className="border-b py-3 px-5 text-left text-sm font-semibold">
                      Name
                    </th>
                    <th className="border-b py-3 px-5 text-left text-sm font-semibold">
                      Email
                    </th>
                    <th className="border-b py-3 px-5 text-left text-sm font-semibold">
                      Phone
                    </th>
                    <th className="border-b py-3 px-5 text-left text-sm font-semibold">
                      Status
                    </th>
                    <th className="border-b py-3 px-5 text-left text-sm font-semibold">
                      Actions
                    </th>
                    <th className="border-b py-3 px-5 text-left text-sm font-semibold">
                      Government ID
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecruiters.map((recruiter) => (
                    <tr key={recruiter._id} className="hover:bg-gray-50">
                      <td className="border-b py-3 px-5 text-sm">
                        {recruiter.name}
                      </td>
                      <td className="border-b py-3 px-5 text-sm">
                        {recruiter.email}
                      </td>
                      <td className="border-b py-3 px-5 text-sm">
                        {recruiter.phone}
                      </td>
                      <td className="border-b py-3 px-5 text-sm">
                        {recruiter.isApproved ? "Approved" : "Pending"}
                      </td>
                      <td className="border-b py-3 px-5 text-sm">
                        {!recruiter.isApproved && (
                          <button
                            onClick={() => handleApprove(recruiter.id)}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                      <td className="border-b py-3 px-5 text-sm">
                        {recruiter.governmentId ? (
                          <button
                            onClick={() =>
                              handleDownloadGovernmentId(
                                recruiter.governmentId,
                                recruiter.name
                              )
                            }
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                          >
                            Download ID
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
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-2 sm:space-y-0">
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400 disabled:opacity-50"
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400 disabled:opacity-50"
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
              <span className="text-sm">
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
