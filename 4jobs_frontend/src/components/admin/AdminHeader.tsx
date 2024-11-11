import React, { useState } from "react";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutAdmin } from "../../redux/slices/adminSlice";
import { AppDispatch } from "../../redux/store";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    dispatch(logoutAdmin());
    navigate("/admin/login");
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const goToProfile = () => {
    navigate("/admin/profile");
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    handleLogout();
    setShowLogoutModal(false);
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
                onClick={handleLogoutClick}
                className="px-3 sm:px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 cursor-pointer text-sm sm:text-base"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </li>
            </ul>
          </div>
        )}
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-purple-500 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold">Confirm Logout</h2>
            <p>Are you sure you want to logout?</p>
            <div className="flex justify-end mt-4">
              <button
                className="bg-purple-600 text-white px-4 py-2 rounded mr-2"
                onClick={confirmLogout}
              >
                Yes
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setShowLogoutModal(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
