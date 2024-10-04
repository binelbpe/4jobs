import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes, FaTachometerAlt, FaUserAlt, FaUsers, FaBriefcase, FaClipboard } from 'react-icons/fa';
import '../../styles/admin/Sidebar.css';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);


  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="md:hidden flex justify-between items-start bg-white-700 text-white p-4 absolute top-1">
        <button onClick={toggleSidebar}  style={{borderRadius: 10}}>
          {isOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-black text-3xl" />}
        </button>
      </div>
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-purple-700 text-white transform transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:relative md:z-auto shadow-lg`}
      >
        <div className="flex items-center justify-center h-16 border-b border-purple-600">
          <img src="../../logo.png" alt="4Jobs Logo" className="h-10" />
        </div>
        <nav className="mt-10">
          <ul className="space-y-4">
            <li>
              <Link to="/admin/dashboard" className="flex items-center space-x-4 px-4 py-2 hover:bg-purple-600 transition-colors duration-200">
                <FaTachometerAlt />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/user" className="flex items-center space-x-4 px-4 py-2 hover:bg-purple-600 transition-colors duration-200">
                <FaUserAlt />
                <span>User</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/recruiters" className="flex items-center space-x-4 px-4 py-2 hover:bg-purple-600 transition-colors duration-200">
                <FaUsers />
                <span>Recruiters</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/subscription" className="flex items-center space-x-4 px-4 py-2 hover:bg-purple-600 transition-colors duration-200">
                <FaClipboard />
                <span>Subscription</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/jobpost" className="flex items-center space-x-4 px-4 py-2 hover:bg-purple-600 transition-colors duration-200">
                <FaBriefcase />
                <span>Job Post</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Overlay to close sidebar when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40" // Overlay when sidebar is open
          onClick={toggleSidebar} // Closes sidebar when overlay is clicked
        ></div>
      )}
    </>
  );
};

export default Sidebar;









