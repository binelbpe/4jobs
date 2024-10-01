import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faComments,
  faBell,
  faUser,
  faSearch,
  faBars,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../redux/slices/authSlice";
import { RootState, AppDispatch } from "../../redux/store";
import { fetchJobPostsAsync } from "../../redux/slices/authSlice";
import {
  fetchNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
} from "../../redux/slices/notificationSlice";
import { socketService } from "../../services/socketService";

const UserHeader: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const notifications = useSelector(
    (state: RootState) => state.notifications.items
  );
  const unreadCount = useSelector(
    (state: RootState) => state.notifications.unreadCount
  );

  useEffect(() => {
    if (user) {
      console.log("Connecting socket for user:", user.id);
      if (!socketService.isConnected()) {
        socketService.connect(user.id);
      }
      dispatch(fetchNotifications(user.id));

      const handleNewNotification = (notification: any) => {
        console.log("New notification received:", notification);
        dispatch(addNotification(notification));
      };

      socketService.on('newNotification', handleNewNotification);

      // Add this debug logging
      const checkConnectionStatus = setInterval(() => {
        const status = socketService.getConnectionStatus();
        console.log('Current socket connection status:', status);
      }, 5000);

      return () => {
        console.log("Disconnecting socket");
        socketService.disconnect();
        clearInterval(checkConnectionStatus);
        socketService.off('newNotification', handleNewNotification);
      };
    }
  }, [user, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const goToProfile = () => {
    if (user) {
      navigate(`/profile/${user.id}`);
    }
  };

  const goToJobs = () => {
    dispatch(
      fetchJobPostsAsync({
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
        filter: {},
      })
    );
    navigate("/jobs");
  };

  const goHome = () => {
    navigate("/dashboard");
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      dispatch(markAllAsRead());
      notifications.forEach((notification) => {
        socketService.markNotificationAsRead(notification._id);
        dispatch(markAsRead(notification._id));
      });
    }
  };

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      {/* Logo Section */}
      <div className="flex items-center">
        <button onClick={goHome}>
          <img src="../../../logo.png" alt="Logo" className="h-20 w-20" />
        </button>
        <span className="text-purple-700 font-semibold text-lg ml-2">
          4 Jobs
        </span>
      </div>

      {/* Search Bar Section */}
      <div className="flex-grow mx-10">
        <div className="relative w-full max-w-lg mx-auto">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute right-3 top-3 text-gray-500"
          />
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-gray-600 focus:outline-none"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <FontAwesomeIcon icon={faBars} className="h-6 w-6" />
      </button>

      {/* Navigation Items for larger screens */}
      <nav className="hidden md:flex space-x-6 items-center">
        <button
          className="flex items-center text-purple-600 hover:text-gray-600 mb-2"
          onClick={goToJobs}
        >
          <FontAwesomeIcon icon={faBriefcase} className="h-6 w-6 mr-2" />
          <span>Jobs</span>
        </button>
        <button className="flex items-center text-purple-600 hover:text-gray-600 mb-2">
          <FontAwesomeIcon icon={faComments} className="h-6 w-6 mr-2" />
          <span>Messages</span>
        </button>
        <div className="relative">
        <button
          className="flex items-center text-purple-600 hover:text-gray-600 mb-2"
          onClick={toggleNotifications}
        >
          <FontAwesomeIcon icon={faBell} className="h-6 w-6 mr-2" />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
              {unreadCount}
            </span>
          )}
        </button>
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
            <div className="p-2 border-b border-gray-200 font-bold">
              Notifications
            </div>
            {notifications.length === 0 ? (
              <div className="p-2">No new notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className="p-2 border-b border-gray-100 hover:bg-gray-50"
                >
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
        <button
          className="flex items-center text-purple-600 hover:text-gray-600 mb-2"
          onClick={goToProfile}
        >
          <FontAwesomeIcon icon={faUser} className="h-6 w-6 mr-2" />
          <span>Profile</span>
        </button>
        <button
          className="flex items-center text-purple-600 hover:text-gray-600 mb-2"
          onClick={handleLogout}
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="h-6 w-6 mr-2" />
          <span>Logout</span>
        </button>
      </nav>
    </header>
  );
};

export default UserHeader;