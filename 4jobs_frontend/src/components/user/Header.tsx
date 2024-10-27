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
  markAllAsRead,
} from "../../redux/slices/notificationSlice";
import { fetchConnectionRequests } from "../../redux/slices/connectionSlice";
import { resetUnreadCount } from "../../redux/slices/userMessageSlice";
import { socketService } from "../../services/socketService";
import {
  searchUsersAndJobs,
  clearSearch,
} from "../../redux/slices/userSearchSlice";
import { createSocketListener } from "../../utils/socketUtils";

const UserHeader: React.FC = () => {
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
  }, [user, dispatch]);

  useEffect(() => {
    const handleNewNotification = (notification: any) => {
      dispatch(addNotification(notification));
    };

    const removeNewNotificationListener = createSocketListener(
      "newNotification",
      handleNewNotification
    );

    return () => {
      removeNewNotificationListener();
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
      const unreadNotifications = notifications.filter(
        (notification) => !notification.isRead
      );
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

  const toggleSearch = useCallback(() => {
    setShowSearch((prev) => !prev);
    setShowMobileMenu(false);
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
        className="flex items-center text-purple-600 hover:text-gray-600 px-2 sm:px-3 md:px-4 py-1 sm:py-2 relative text-xs sm:text-sm md:text-base w-full md:w-auto"
        onClick={onClick}
      >
        <FontAwesomeIcon icon={icon} className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
        <span className="inline">{text}</span>
        {badge !== undefined && badge > 0 && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white rounded-full px-1 sm:px-2 py-0.5 text-xxs sm:text-xs">
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
  ];

  
  const [showMobileMenu, setShowMobileMenu] = useState(false);

 
  const toggleMobileMenu = useCallback(() => {
    setShowMobileMenu((prev) => !prev);
    setShowSearch(false);
  }, []);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    handleLogout();
    setShowLogoutModal(false);
  };

  return (
    <header className="bg-white shadow-md p-2 sm:p-3 md:p-4">
      <div className="container mx-auto">
        <div className="flex flex-wrap justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center justify-between w-full md:w-auto mb-2 md:mb-0">
            <button
              onClick={() => navigateTo("/dashboard")}
              className="flex items-center"
            >
              <img
                src="/logo.png"
                alt="Logo"
                className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 mr-1 sm:mr-2"
              />
              <span className="text-purple-700 font-semibold text-sm sm:text-base md:text-lg">
                4 Jobs
              </span>
            </button>
            <div className="flex md:hidden">
              <button
                onClick={toggleSearch}
                className="text-purple-600 mr-2 sm:mr-4"
                aria-label="Search"
              >
                <FontAwesomeIcon
                  icon={faSearch}
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
              </button>
              <button
                className="text-purple-600 focus:outline-none"
                onClick={toggleMobileMenu}
              >
                <FontAwesomeIcon
                  icon={showMobileMenu ? faTimes : faBars}
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
              </button>
            </div>
          </div>

          {/* Search Bar Section */}
          <div
            className={`w-full md:w-auto md:flex-grow mx-0 sm:mx-2 md:mx-4 mb-2 md:mb-0 order-3 md:order-2 ${
              showSearch || !showMobileMenu ? "block" : "hidden"
            } md:block`}
          >
            <div className="relative w-full max-w-lg mx-auto">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-8 sm:right-12 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <FontAwesomeIcon
                    icon={faTimes}
                    className="h-4 w-4 sm:h-5 sm:w-5"
                  />
                </button>
              )}
              <button
                onClick={handleSearch}
                className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-purple-500 hover:text-purple-700"
              >
                <FontAwesomeIcon
                  icon={faSearch}
                  className="h-4 w-4 sm:h-5 sm:w-5"
                />
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <nav
            className={`${
              showMobileMenu ? "block" : "hidden"
            } md:flex flex-col md:flex-row md:flex-wrap space-y-2 md:space-y-0 space-x-0 md:space-x-1 lg:space-x-2 xl:space-x-4 items-start md:items-center order-2 md:order-3 w-full md:w-auto mt-2 md:mt-0`}
          >
            {navItems.map((item) =>
              renderNavItem(item.icon, item.text, item.onClick)
            )}
            <button
              className="flex items-center text-purple-600 hover:text-gray-600"
              onClick={handleLogoutClick}
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="h-6 w-6 mr-2" />
              <span className="text-xs">Logout</span>
            </button>
          </nav>
        </div>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="fixed inset-0 z-50 md:absolute md:inset-auto md:right-4 md:top-16 mt-2 w-full md:w-80 bg-white border border-gray-200 rounded-md shadow-lg">
            <div className="flex justify-between items-center p-2 sm:p-4 border-b border-gray-200">
              <span className="font-bold text-purple-700 text-sm sm:text-base">
                Notifications
              </span>
              <button
                onClick={toggleNotifications}
                className="text-gray-500 hover:text-gray-700 sm:hidden"
              >
                <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[calc(100vh-10rem)] sm:max-h-96 overflow-y-auto">
              {pendingConnectionRequests.length > 0 && (
                <div
                  key="connection-requests"
                  className="p-2 sm:p-4 border-b border-gray-100 hover:bg-purple-50 cursor-pointer transition duration-300"
                  onClick={openConnectionRequests}
                >
                  <p className="text-xs sm:text-sm flex items-center text-purple-600">
                    <FontAwesomeIcon
                      icon={faUserPlus}
                      className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4"
                    />
                    {pendingConnectionRequests.length} pending connection
                    request(s)
                  </p>
                </div>
              )}
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className="p-2 sm:p-4 border-b border-gray-100 hover:bg-purple-50 transition duration-300"
                >
                  <p className="text-xs sm:text-sm">{notification.message}</p>
                  <p className="text-xxs sm:text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
              {notifications.length === 0 &&
                pendingConnectionRequests.length === 0 && (
                  <div className="p-2 sm:p-4 text-gray-500 text-xs sm:text-sm">
                    No new notifications
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Logout Confirmation Modal */}
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
      </div>
    </header>
  );
};

export default UserHeader;
