import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  markAsSeen,
} from "../../redux/slices/notificationSlice";
import { fetchConnectionRequests } from "../../redux/slices/connectionSlice";
import { resetUnreadCount } from "../../redux/slices/userMessageSlice";
import { socketService } from "../../services/socketService";
import { searchUsersAndJobs, clearSearch } from "../../redux/slices/userSearchSlice";

const UserHeader: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const notifications = useSelector(
    (state: RootState) => state.notifications.items
  );
  const unreadCount = useSelector(
    (state: RootState) => state.notifications.unreadCount
  );
  const connectionRequests = useSelector(
    (state: RootState) => state.connections.connectionRequests
  );

  const pendingConnectionRequests = useMemo(
    () => connectionRequests.filter((request) => request.status === "pending"),
    [connectionRequests]
  );

  const totalNotificationCount = useMemo(
    () => unreadCount + pendingConnectionRequests.length,
    [unreadCount, pendingConnectionRequests.length]
  );

  const navigateTo = useCallback(
    (path: string) => {
      navigate(path);
      setMenuOpen(false);
      setShowNotifications(false);
    },
    [navigate]
  );

  const navigateToMessages = useCallback(() => {
    dispatch(resetUnreadCount());
    navigateTo("/messages");
  }, [dispatch, navigateTo]);



  useEffect(() => {
    if (user) {
      const controller = new AbortController();

      if (socketService && !socketService.getConnectionStatus()) {
        socketService.connect(user.id);
      }

      dispatch(fetchNotifications(user.id));
      dispatch(fetchConnectionRequests(user.id));

      return () => {
        controller.abort();
        socketService?.disconnect();
      };
    }
  }, [user?.id, user, dispatch]);

  useEffect(() => {
    const handleNewNotification = (notification: any) => {
      dispatch(addNotification(notification));
    };

    socketService?.on("newNotification", handleNewNotification);

    return () => {
      socketService?.off("newNotification", handleNewNotification);
    };
  }, [dispatch]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate("/login");
  }, [dispatch, navigate]);

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
    setShowNotifications((prev) => !prev);
  }, []);

  useEffect(() => {
    if (showNotifications && notifications.length > 0) {
      const unreadNotifications = notifications.filter(notification => !notification.isRead);
      if (unreadNotifications.length > 0) {
        dispatch(markAllAsRead());
        unreadNotifications.forEach((notification) => {
          if (notification._id) {
            socketService.markNotificationAsRead(notification._id);
          }
        });
      }
    }
  }, [showNotifications, dispatch, notifications]);

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

  const handleSearch = useCallback(() => {
    if (searchQuery.length >= 3 && user) {
      dispatch(searchUsersAndJobs({ query: searchQuery, userId: user.id }));
      navigate("/search-results");
    }
  }, [searchQuery, dispatch, navigate, user]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    dispatch(clearSearch());
  }, [dispatch]);

  const renderNavItem = useCallback(
    (icon: any, text: string, onClick: () => void, badge?: number) => (
      <button
        key={text}
        className="flex items-center text-purple-600 hover:text-gray-600 px-4 py-2 relative"
        onClick={onClick}
      >
        <FontAwesomeIcon icon={icon} className="h-5 w-5 mr-2" />
        <span>{text}</span>
        {badge !== undefined && badge > 0 && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
            {badge}
          </span>
        )}
      </button>
    ),
    []
  );

  const navItems = [
    { icon: faHome, text: "Home", onClick: () => navigateTo("/dashboard") },
    { icon: faBriefcase, text: "Jobs", onClick: goToJobs },
    {
      icon: faComments,
      text: "Messages",
      onClick: navigateToMessages,
    },
    {
      icon: faUsers,
      text: "Connections",
      onClick: openConnectionRequests,
      badge: pendingConnectionRequests.length,
    },
    {
      icon: faBell,
      text: "Notifications",
      onClick: toggleNotifications,
      badge: totalNotificationCount,
    },
    {
      icon: faUser,
      text: "Profile",
      onClick: () => navigateTo(`/profile/${user?.id}`),
    },
    { icon: faSignOutAlt, text: "Logout", onClick: handleLogout },
  ];

  return (
    <header className="bg-white shadow-md p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center">
            <button
              onClick={() => navigateTo("/dashboard")}
              className="flex items-center"
            >
              <img src="/logo.png" alt="Logo" className="h-10 w-10 mr-2" />
              <span className="text-purple-700 font-semibold text-lg hidden sm:inline">
                4 Jobs
              </span>
            </button>
          </div>

          {/* Search Bar Section */}
          <div className="flex-grow mx-4 hidden lg:block">
            <div className="relative w-full max-w-lg mx-auto">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-12 top-2 text-gray-500 hover:text-gray-700"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
              <button
                onClick={handleSearch}
                className="absolute right-3 top-2 text-purple-500 hover:text-purple-700"
              >
                <FontAwesomeIcon icon={faSearch} />
              </button>
            </div>
          </div>

          {/* Navigation Items for larger screens */}
          <nav className="hidden lg:flex space-x-4 items-center">
            {navItems.map((item) =>
              renderNavItem(item.icon, item.text, item.onClick, item.badge)
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
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
              <FontAwesomeIcon
                icon={menuOpen ? faTimes : faBars}
                className="h-6 w-6"
              />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 py-4 mt-4">
            <div className="space-y-4">
              {navItems.map((item) =>
                renderNavItem(item.icon, item.text, item.onClick, item.badge)
              )}
            </div>
          </div>
        )}

        {/* Search Bar (Mobile) */}
        {showSearch && (
          <div className="lg:hidden py-4 mt-4">
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

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-20">
            <div className="p-4 border-b border-gray-200 font-bold text-purple-700">
              Notifications
            </div>
            <div className="max-h-96 overflow-y-auto">
              {pendingConnectionRequests.length > 0 && (
                <div
                  key="connection-requests"
                  className="p-4 border-b border-gray-100 hover:bg-purple-50 cursor-pointer transition duration-300"
                  onClick={openConnectionRequests}
                >
                  <p className="text-sm flex items-center text-purple-600">
                    <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                    {pendingConnectionRequests.length} pending connection
                    request(s)
                  </p>
                </div>
              )}
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className="p-4 border-b border-gray-100 hover:bg-purple-50 transition duration-300"
                >
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
              {notifications.length === 0 &&
                pendingConnectionRequests.length === 0 && (
                  <div className="p-4 text-gray-500">No new notifications</div>
                )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default UserHeader;
