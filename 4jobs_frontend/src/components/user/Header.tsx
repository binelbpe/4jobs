import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faComments,
  faBell,
  faUser,
  faSearch,
  faBars,
  faSignOutAlt,
  faUserPlus,
  faHome,
  faTimes,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, fetchJobPostsAsync } from "../../redux/slices/authSlice";
import { RootState, AppDispatch } from "../../redux/store";
import {
  fetchNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
} from "../../redux/slices/notificationSlice";
import { fetchConnectionRequests } from "../../redux/slices/connectionSlice";
import { getUnreadMessageCount, selectUnreadCount } from "../../redux/slices/messageSlice";
import { socketService } from "../../services/socketService";

const UserHeader: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const notifications = useSelector((state: RootState) => state.notifications.items);
  const unreadCount = useSelector((state: RootState) => state.notifications.unreadCount);
  const connectionRequests = useSelector((state: RootState) => state.connections.connectionRequests);

  const pendingConnectionRequests = connectionRequests.filter(
    (request) => request.status === "pending"
  );

  const unreadMessageCount = useSelector(selectUnreadCount);

  useEffect(() => {
    if (user) {
      dispatch(getUnreadMessageCount(user.id));
    }
  }, [dispatch, user]);

  const navigateToMessages = useCallback(() => {
    navigateTo("/messages");
  }, []);

  const totalNotificationCount = unreadCount + pendingConnectionRequests.length;

  useEffect(() => {
    if (user) {
      const controller = new AbortController();
      
      if (!socketService.isConnected()) {
        socketService.connect(user.id);
      }
      
      dispatch(fetchNotifications(user.id));
      dispatch(fetchConnectionRequests(user.id));

      const handleNewNotification = (notification: any) => {
        dispatch(addNotification(notification));
      };

      socketService.on('newNotification', handleNewNotification);

      return () => {
        controller.abort();
        socketService.disconnect();
        socketService.off('newNotification', handleNewNotification);
      };
    }
  }, [user, dispatch]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate("/login");
  }, [dispatch, navigate]);

  const navigateTo = useCallback((path: string) => {
    navigate(path);
    setMenuOpen(false);
    setShowNotifications(false);
  }, [navigate]);

  const goToJobs = useCallback(() => {
    dispatch(
      fetchJobPostsAsync({
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
        filter: {},
      })
    );
    navigateTo("/jobs");
  }, [dispatch, navigateTo]);

  const toggleNotifications = useCallback(() => {
    setShowNotifications((prev) => {
      if (!prev) {
        dispatch(markAllAsRead());
        notifications.forEach((notification) => {
          socketService.markNotificationAsRead(notification._id);
          dispatch(markAsRead(notification._id));
        });
      }
      return !prev;
    });
  }, [dispatch, notifications]);

  const openConnectionRequests = useCallback(() => {
    navigateTo("/connections");
  }, [navigateTo]);

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
    setShowNotifications(false);
    setShowSearch(false);
  }, []);

  const toggleSearch = useCallback(() => {
    setShowSearch((prev) => !prev);
    setMenuOpen(false);
  }, []);

  const renderNavItem = useCallback((icon: any, text: string, onClick: () => void, badge?: number) => (
    <button
      className="flex items-center text-purple-600 hover:text-gray-600 px-4 py-2"
      onClick={onClick}
    >
      <FontAwesomeIcon icon={icon} className="h-5 w-5 mr-2" />
      <span>{text}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
          {badge}
        </span>
      )}
    </button>
  ), []);

  return (
    <header className="bg-white shadow-md p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center">
            <button onClick={() => navigateTo("/dashboard")} className="flex items-center">
              <img src="/logo.png" alt="Logo" className="h-10 w-10 mr-2" />
              <span className="text-purple-700 font-semibold text-lg hidden sm:inline">
                4 Jobs
              </span>
            </button>
          </div>

          {/* Search Bar Section */}
          <div className="flex-grow mx-4 hidden md:block">
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

          {/* Navigation Items for larger screens */}
          <nav className="hidden md:flex space-x-6 items-center">
            {renderNavItem(faHome, "Home", () => navigateTo("/dashboard"))}
            {renderNavItem(faBriefcase, "Jobs", goToJobs)}
            {renderNavItem(faComments, "Messages", navigateToMessages, unreadMessageCount)}
            {renderNavItem(faUsers, "Connections", openConnectionRequests, pendingConnectionRequests.length)}
            <div className="relative">
              {renderNavItem(faBell, "Notifications", toggleNotifications, unreadCount)}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                  <div className="p-4 border-b border-gray-200 font-bold text-purple-700">
                    Notifications
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {pendingConnectionRequests.length > 0 && (
                      <div
                        className="p-4 border-b border-gray-100 hover:bg-purple-50 cursor-pointer transition duration-300"
                        onClick={openConnectionRequests}
                      >
                        <p className="text-sm flex items-center text-purple-600">
                          <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                          {pendingConnectionRequests.length} pending connection request(s)
                        </p>
                      </div>
                    )}
                    {notifications.map((notification) => (
                      <div key={notification._id} className="p-4 border-b border-gray-100 hover:bg-purple-50 transition duration-300">
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                    {notifications.length === 0 && pendingConnectionRequests.length === 0 && (
                      <div className="p-4 text-gray-500">No new notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {renderNavItem(faUser, "Profile", () => navigateTo(`/profile/${user?.id}`))}
            {renderNavItem(faSignOutAlt, "Logout", handleLogout)}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleSearch}
              className="text-purple-600 mr-4"
              aria-label="Search"
            >
              <FontAwesomeIcon icon={faSearch} className="h-6 w-6" />
            </button>
            <button
              className="text-purple-600 focus:outline-none"
              onClick={toggleMenu}
            >
              <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4 mt-4">
            <div className="space-y-4">
              {renderNavItem(faHome, "Home", () => navigateTo("/dashboard"))}
              {renderNavItem(faBriefcase, "Jobs", goToJobs)}
              {renderNavItem(faComments, "Messages", navigateToMessages, unreadMessageCount)}
              {renderNavItem(faUsers, "Connections", openConnectionRequests, pendingConnectionRequests.length)}
              {renderNavItem(faBell, "Notifications", toggleNotifications, unreadCount)}
              {renderNavItem(faUser, "Profile", () => navigateTo(`/profile/${user?.id}`))}
              {renderNavItem(faSignOutAlt, "Logout", handleLogout)}
            </div>
          </div>
        )}

        {/* Search Bar (Mobile) */}
        {showSearch && (
          <div className="md:hidden py-4 mt-4">
            <div className="relative">
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
        )}
      </div>
    </header>
  );
};

export default UserHeader;