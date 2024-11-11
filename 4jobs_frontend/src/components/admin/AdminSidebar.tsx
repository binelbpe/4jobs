import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaTachometerAlt,
  FaUserAlt,
  FaUsers,
  FaBriefcase,
  FaClipboard,
  FaNewspaper,
} from "react-icons/fa";

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 z-50 p-2 sm:p-4">
        <button
          onClick={toggleSidebar}
          className="bg-purple-700 text-white p-1 sm:p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
        >
          {isOpen ? (
            <FaTimes className="text-lg sm:text-2xl" />
          ) : (
            <FaBars className="text-lg sm:text-2xl" />
          )}
        </button>
      </div>
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-purple-700 text-white transform transition-transform duration-300 ease-in-out overflow-y-auto z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:sticky md:top-0 md:z-0 shadow-lg`}
      >
        <div className="flex items-center justify-center h-16 border-b border-purple-600">
          <img src="../../logo.png" alt="4Jobs Logo" className="h-8 sm:h-10" />
        </div>
        <nav className="mt-8 pb-16 md:pb-0">
          <ul className="space-y-2 sm:space-y-4">
            <li>
              <Link
                to="/admin/dashboard"
                className="flex items-center space-x-2 sm:space-x-4 px-4 py-2 hover:bg-purple-600 transition-colors duration-200 text-sm sm:text-base"
              >
                <FaTachometerAlt />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/user"
                className="flex items-center space-x-2 sm:space-x-4 px-4 py-2 hover:bg-purple-600 transition-colors duration-200 text-sm sm:text-base"
              >
                <FaUserAlt />
                <span>User</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/recruiters"
                className="flex items-center space-x-2 sm:space-x-4 px-4 py-2 hover:bg-purple-600 transition-colors duration-200 text-sm sm:text-base"
              >
                <FaUsers />
                <span>Recruiters</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/subscription"
                className="flex items-center space-x-2 sm:space-x-4 px-4 py-2 hover:bg-purple-600 transition-colors duration-200 text-sm sm:text-base"
              >
                <FaClipboard />
                <span>Subscription</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/jobpost"
                className="flex items-center space-x-2 sm:space-x-4 px-4 py-2 hover:bg-purple-600 transition-colors duration-200 text-sm sm:text-base"
              >
                <FaBriefcase />
                <span>Job Post</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/userposts"
                className="flex items-center space-x-2 sm:space-x-4 px-4 py-2 hover:bg-purple-600 transition-colors duration-200 text-sm sm:text-base"
              >
                <FaNewspaper />
                <span>User Posts</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
