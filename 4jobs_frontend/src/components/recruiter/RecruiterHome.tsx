import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { logout, selectRecruiter } from "../../redux/slices/recruiterSlice";
import { useNavigate } from "react-router-dom";
import Header from "./RecruiterHeader";
import Sidebar from "./RecruiterSidebar";
import MainContent from "./RecruiterMain";

const Dashboard: React.FC = () => {
  const { isApproved } = useSelector((state: RootState) => state.recruiter);
  const { recruiter } = useSelector(selectRecruiter);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/recruiter/login");
  };

  if (!isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-purple-600">
            Approval Pending
          </h1>
          <p className="text-gray-600 mt-4 text-sm md:text-base">
            Your recruiter account is under review. You will be able to access
            the dashboard once approved.
          </p>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="mt-6 bg-purple-600 text-white py-2 px-4 rounded-lg shadow hover:bg-purple-700 transition duration-200 text-sm md:text-base"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="grid grid-cols-12 gap-4 flex-1 p-4">
        <div className="hidden lg:block lg:col-span-2">
          <Sidebar />
        </div>

        <main className="col-span-12 lg:col-span-10 bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-purple-600">
            Welcome, {recruiter?.name}!
          </h1>
          <MainContent />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
