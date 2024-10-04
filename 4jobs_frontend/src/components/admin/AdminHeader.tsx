import React, { useState } from 'react';
import { FaSearch, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
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
    <header className="bg-white shadow-md flex justify-between items-center px-4 py-4 md:px-8">
      <div className="flex-grow mx-20 max-w-md">
        <div className="relative">
          <input
            type="text"
            className="w-full bg-gray-100 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Search something here"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-500" />
        </div>
      </div>

      <div className="relative">
        <button
          className="flex items-center bg-white space-x-2 cursor-pointer text-gray-600"
          onClick={toggleDropdown}
        >
          <FaUserCircle className="text-2xl" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
            <ul className="py-1">
              <li
                onClick={goToProfile} 
                className="px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 cursor-pointer"
              >
                <FaUserCircle />
                <span>Profile</span>
              </li>
              <li
                onClick={handleLogout}
                className="px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 cursor-pointer"
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
