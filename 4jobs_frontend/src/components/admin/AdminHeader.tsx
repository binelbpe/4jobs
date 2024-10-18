import React, { useState } from 'react';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutAdmin } from '../../redux/slices/adminSlice';
import { AppDispatch } from '../../redux/store';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutAdmin());
    navigate('/admin/login');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const goToProfile = () => {
    navigate('/admin/profile'); 
  };

  return (
    <header className="bg-white shadow-md flex justify-end items-center px-2 sm:px-4 py-2 sm:py-4">
      <div className="relative">
        <button
          className="flex items-center bg-white space-x-2 cursor-pointer text-gray-600"
          onClick={toggleDropdown}
        >
          <FaUserCircle className="text-xl sm:text-2xl" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-md shadow-lg z-50">
            <ul className="py-1">
              <li
                onClick={goToProfile} 
                className="px-3 sm:px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 cursor-pointer text-sm sm:text-base"
              >
                <FaUserCircle />
                <span>Profile</span>
              </li>
              <li
                onClick={handleLogout}
                className="px-3 sm:px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 cursor-pointer text-sm sm:text-base"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
