import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { logout } from '../../redux/slices/recruiterSlice';
import { useNavigate } from 'react-router-dom';
import Header from './RecruiterHeader';
import Sidebar from './RecruiterSidebar';
import MainContent from './RecruiterMain';
import Connections from './RecruiterConnections';

const Dashboard: React.FC = () => {
  const { isApproved } = useSelector((state: RootState) => state.recruiter);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()); // Dispatch the logout action
    navigate('/recruiter/login'); // Navigate to the login page
  };

  if (!isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold text-purple-600">Approval Pending</h1>
          <p className="text-gray-600 mt-4">Your recruiter account is under review. You will be able to access the dashboard once approved.</p>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="mt-6 bg-purple-600 text-white py-2 px-4 rounded-lg shadow hover:bg-purple-700 transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header />

      {/* Body Grid Layout */}
      <div className="grid grid-cols-12 gap-4 flex-1 p-4">
        {/* Left Sidebar (hidden below 800px) */}
        <div className="hidden md:block md:col-span-2">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <main className="col-span-12 md:col-span-8 bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4 text-purple-600">Welcome, Recruiter!</h1>
          <div className="bg-white p-4 shadow-md rounded-lg mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-purple-200"></div>
              <input
                type="text"
                className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none"
                placeholder="Write about something"
              />
            </div>
            <div className="flex space-x-4 mt-4">
              <button className="text-purple-600">Add media</button>
              <button className="text-purple-600">Write article</button>
            </div>
          </div>
          <MainContent/>
        </main>

        {/* Right Sidebar (hidden below 800px) */}
        <div className="hidden md:block md:col-span-2">
          <Connections />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
