import React, { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Sidebar from "./AdminSidebar";
import Header from "./AdminHeader";
import AdminRecruiterList from "./AdminRecruiterList";
import AdminJobPost from "./AdminJobPost";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { loading, error, isAuthenticatedAdmin } = useSelector(
    (state: RootState) => state.admin
  );

  useEffect(() => {
    if (!isAuthenticatedAdmin) {
      navigate("/admin/login");
    }
  }, [isAuthenticatedAdmin, navigate]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen">
        Error: {error}
      </div>
    );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-100 md:ml-0">
        <Header />
        <div className="p-4 flex-1 overflow-auto">
          <Routes>
            <Route path="recruiters" element={<AdminRecruiterList />} />
            <Route path="jobpost" element={<AdminJobPost />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;