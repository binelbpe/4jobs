import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/recruiterSlice'; 
import { useNavigate } from 'react-router-dom';

const RecruiterHeader = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()); 
    navigate('/recruiter/login'); 
  };

  const handleViewProfile = () => {
    navigate('/recruiter/profile');
    setDropdownOpen(false); 
  };

  const handleAddJobs = () => {
    navigate('/recruiter/jobs');
  };
  return (
    <header className="flex justify-between items-center p-4 lg:p-6 bg-white shadow-md w-full">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <img 
          src="../../logo.png" // Ensure to replace this with your actual logo path
          alt="Logo"
          className="h-8 lg:h-12"
        />
        <span className="text-purple-700 font-semibold text-lg lg:text-2xl">4 Jobs</span>
      </div>

      {/* Center Search Bar */}
      <div className="hidden md:flex flex-1 mx-4">
        <input
          type="text"
          className="w-full max-w-md border border-gray-300 rounded-lg p-2 focus:outline-none"
          placeholder="Search"
        />
      </div>

      {/* Right-side Icons */}
      
      <div className="flex items-center space-x-4 lg:space-x-6">
        <button 
          onClick={handleAddJobs}
          className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-300"
        >
          ADD JOBS
        </button>

        {/* Message Icon */}
        <button className="text-black text-xl hover:text-gray-600 transition duration-300">✉️</button>

        {/* Notification Icon */}
        <button className="text-black text-xl hover:text-gray-600 transition duration-300">🔔</button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="text-purple-600 text-2xl hover:text-purple-700 transition duration-300">
            👤
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button 
                onClick={handleViewProfile} 
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition duration-300">
                View Profile
              </button>
              <button
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition duration-300">
                Settings and Privacy
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition duration-300">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Responsive Mobile Search */}
      <div className="flex md:hidden mt-4 w-full">
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none"
          placeholder="Search"
        />
      </div>
    </header>
  );
};

export default RecruiterHeader;
