import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/recruiterSlice'; 
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()); 
    navigate('/recruiter/login'); 
  };

  return (
    <header className="flex justify-between items-center p-6 bg-white shadow-md w-full">
      <div className="text-purple-600 text-3xl font-bold">4 Jobs</div>

      {/* Center Search Bar */}
      <div className="flex-1 mx-4">
        <input
          type="text"
          className="w-full max-w-md border border-gray-300 rounded-lg p-2 focus:outline-none"
          placeholder="Search"
        />
      </div>

      {/* Right-side Icons */}
      <div className="flex items-center space-x-6">
        <button className="bg-purple-600 text-white py-2 px-4 rounded-lg">ADD JOBS</button>

        {/* Message Icon */}
        <button className="text-black">✉️</button>

        {/* Notification Icon */}
        <button className="text-black">🔔</button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="text-purple-600">
            👤
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
              <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">View profile</a>
              <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Settings and privacy</a>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
