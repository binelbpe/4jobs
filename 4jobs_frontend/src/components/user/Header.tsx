import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faComments, faBell, faUser, faSearch, faBars } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom'; 
import { logout } from '../../redux/slices/authSlice';
import { RootState } from '../../redux/store';

const UserHeader: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const goToProfile = () => {
    if (user) {
      navigate(`/profile/${user.id}`);
    }
  };

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      {/* Logo Section */}
      <div className="flex items-center">
        <Link to="/">
          <img src="../../../logo.png" alt="Logo" className="h-20 w-20" />
        </Link>
        <span className="text-purple-700 font-semibold text-lg ml-2">4 Jobs</span>
      </div>

      {/* Search Bar Section */}
      <div className="flex-grow mx-10">
        <div className="relative w-full max-w-lg mx-auto">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-3 text-gray-500" />
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button className="md:hidden text-gray-600 focus:outline-none" onClick={() => setMenuOpen(!menuOpen)}>
        <FontAwesomeIcon icon={faBars} className="h-6 w-6" />
      </button>

      {/* Navigation Items for larger screens */}
      <nav className="hidden md:flex space-x-6 items-center">
        <button className="flex items-center text-purple-600 hover:text-gray-600 mb-2">
          <FontAwesomeIcon icon={faBriefcase} className="h-6 w-6 mr-2" />
          <span>Jobs</span>
        </button>
        <button className="flex items-center text-purple-600 hover:text-gray-600 mb-2">
          <FontAwesomeIcon icon={faComments} className="h-6 w-6 mr-2" />
          <span>Messages</span>
        </button>
        <button className="flex items-center text-purple-600 hover:text-gray-600 mb-2">
          <FontAwesomeIcon icon={faBell} className="h-6 w-6 mr-2" />
          <span>Notifications</span>
        </button>
        <button className="text-purple-600 hover:text-gray-600" onClick={goToProfile}>
          <FontAwesomeIcon icon={faUser} className="h-6 w-6" />
          <span className="text-xs">Profile</span>
        </button>
        <button className="text-purple-600 hover:text-gray-600" onClick={handleLogout}>
          <FontAwesomeIcon icon={faUser} className="h-6 w-6" />
          <span className="text-xs">Logout</span>
        </button>
      </nav>

      {/* Dropdown Menu for Small Screens */}
      {menuOpen && (
        <div className="absolute top-16 right-0 w-48 bg-white shadow-lg rounded-md p-4 md:hidden">
          <button className="flex items-center text-purple-600 hover:text-gray-600 mb-2">
            <FontAwesomeIcon icon={faBriefcase} className="h-6 w-6 mr-2" />
            <span>Jobs</span>
          </button>
          <button className="flex items-center text-purple-600 hover:text-gray-600 mb-2">
            <FontAwesomeIcon icon={faComments} className="h-6 w-6 mr-2" />
            <span>Messages</span>
          </button>
          <button className="flex items-center text-purple-600 hover:text-gray-600 mb-2">
            <FontAwesomeIcon icon={faBell} className="h-6 w-6 mr-2" />
            <span>Notifications</span>
          </button>
          <button className="text-gray-600 hover:text-purple-600 mb-2" onClick={goToProfile}>
            <FontAwesomeIcon icon={faUser} className="h-6 w-6 mr-2" />
            <span>Profile</span>
          </button>
          <button 
            className="flex items-center text-purple-600 hover:text-gray-600"
            onClick={handleLogout}
          >
            <FontAwesomeIcon icon={faUser} className="h-6 w-6 mr-2" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default UserHeader;
