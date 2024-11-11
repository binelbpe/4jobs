import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import {
  fetchConnections,
  searchConnections,
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeConnection,
} from "../../redux/slices/connectionSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faUserCheck,
  faUserTimes,
  faEnvelope,
  faPhone,
  faBriefcase,
  faCalendarAlt,
  faVenusMars,
} from "@fortawesome/free-solid-svg-icons";
import UserHeader from "./Header";
import { User } from "../../types/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { selectMemoizedConnections } from "../../redux/store";

interface ConnectionRequest {
  _id: string;
  requester: {
    _id: string;
    name: string;
    profileImage: string;
    bio?: string;
  };
  recipient: string;
  status: string;
  createdAt: string;
}

const Connections: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, connections, connectionRequests, loading, error } = useSelector(
    (state: RootState) => ({
      user: state.auth.user,
      connections: selectMemoizedConnections(state),
      connectionRequests: state.connections.connectionRequests,
      loading: state.connections.loading,
      error: state.connections.error,
    })
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [localLoading, setLocalLoading] = useState<{ [key: string]: boolean }>(
    {}
  );
  const navigate = useNavigate();

  const fetchData = useCallback(() => {
    if (user) {
      dispatch(fetchConnections(user.id))
        .unwrap()
        .catch((err) => {
          toast.error("Failed to fetch connections. Please try again later.");
        });
    }
  }, [dispatch, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = useCallback(() => {
    if (user) {
      dispatch(searchConnections({ userId: user.id, query: searchQuery }))
        .unwrap()
        .catch((err) => {
          toast.error("Search failed. Please try again.");
        });
    }
  }, [dispatch, user, searchQuery]);

  const handleAccept = async (requestId: string) => {
    if (user && requestId) {
      setLocalLoading((prev) => ({ ...prev, [requestId]: true }));
      try {
        await dispatch(
          acceptConnectionRequest({ requestId, userId: user.id })
        ).unwrap();
        toast.success("Connection request accepted successfully.");
        fetchData();
      } catch (error) {
        toast.error("Failed to accept connection request. Please try again.");
      } finally {
        setLocalLoading((prev) => ({ ...prev, [requestId]: false }));
      }
    }
  };

  const handleReject = async (requestId: string) => {
    if (user) {
      setLocalLoading((prev) => ({ ...prev, [requestId]: true }));
      try {
        await dispatch(
          rejectConnectionRequest({ requestId, userId: user.id })
        ).unwrap();
        toast.success("Connection request rejected successfully.");
        fetchData();
      } catch (error) {
        toast.error("Failed to reject connection request. Please try again.");
      } finally {
        setLocalLoading((prev) => ({ ...prev, [requestId]: false }));
      }
    }
  };

  const handleRemove = async (connectionId: string) => {
    if (user) {
      try {
        await dispatch(
          removeConnection({ userId: user.id, connectionId })
        ).unwrap();
        toast.success("Connection removed successfully.");
        fetchData();
      } catch (error) {
        toast.error("Failed to remove connection. Please try again.");
      }
    }
  };

  const truncateBio = (bio: string | undefined, wordLimit: number = 10) => {
    if (!bio) return "No bio available";
    const words = bio.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : bio;
  };

  useEffect(() => {
    if (error) {
      toast.error(`An error occurred: ${error}`);
    }
  }, [error]);

  return (
    <div className="bg-gray-100 min-h-screen">
      <UserHeader />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-purple-800">
          My Network
        </h1>

        <div className="mb-4">
          <div className="flex items-center max-w-md mx-auto w-full">
            <input
              type="text"
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow px-1 py-1 text-xs border border-purple-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Search connections"
            />
            <button
              onClick={handleSearch}
              className="bg-purple-600 text-white px-1 py-1 text-xs rounded-r-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <FontAwesomeIcon icon={faSearch} className="h-3 w-3" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          </div>
        ) : (
          <>
            <div className="bg-white mb-4">
              <h2 className="text-lg sm:text-xl font-semibold mb-2 text-purple-800">
                Connection Requests
              </h2>
              {connectionRequests.length === 0 ? (
                <p className="text-xs text-gray-600">
                  No pending connection requests.
                </p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {connectionRequests.map((request: ConnectionRequest) => (
                    <li
                      key={request._id}
                      className="py-2 flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <img
                          src={
                            request.requester.profileImage ||
                            "/default-avatar.png"
                          }
                          alt={request.requester.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="ml-1">
                          <h3 className="text-xs font-semibold text-purple-800">
                            {request.requester.name}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {truncateBio(request.requester.bio)}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          className="bg-purple-600 text-white px-1 py-1 rounded hover:bg-purple-700 transition duration-300 flex items-center text-xs"
                          onClick={() => handleAccept(request._id)}
                          disabled={localLoading[request._id]}
                        >
                          <FontAwesomeIcon
                            icon={faUserCheck}
                            className="mr-1 h-3 w-3"
                          />
                          {localLoading[request._id]
                            ? "Processing..."
                            : "Accept"}
                        </button>
                        <button
                          className="bg-gray-300 text-gray-700 px-1 py-1 rounded hover:bg-gray-400 transition duration-300 flex items-center text-xs"
                          onClick={() => handleReject(request._id)}
                          disabled={localLoading[request._id]}
                        >
                          <FontAwesomeIcon
                            icon={faUserTimes}
                            className="mr-1 h-3 w-3"
                          />
                          {localLoading[request._id]
                            ? "Processing..."
                            : "Decline"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white">
              <h2 className="text-lg sm:text-xl font-semibold mb-2 text-purple-800">
                Your Connections
              </h2>
              {connections?.length === 0 ? (
                <p className="text-xs text-gray-600">
                  You don't have any connections yet.
                </p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {connections?.map((connection: User) => (
                    <li key={connection._id} className="py-2 flex items-start">
                      <img
                        src={connection.profileImage || "/default-avatar.png"}
                        alt={connection.name}
                        className="w-10 h-10 rounded-full object-cover mr-2"
                      />
                      <div className="flex-grow">
                        <h3
                          className="text-xs font-semibold text-purple-800 cursor-pointer"
                          onClick={() =>
                            navigate(`/connection/profile/${connection._id}`)
                          }
                        >
                          {connection.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-1">
                          {truncateBio(connection.bio)}
                        </p>
                        <div className="flex flex-wrap gap-1 text-xs text-gray-500">
                          {connection.email && (
                            <span className="flex items-center">
                              <FontAwesomeIcon
                                icon={faEnvelope}
                                className="mr-1 h-3 w-3"
                              />
                              {connection.email}
                            </span>
                          )}
                          {connection.phone && (
                            <span className="flex items-center">
                              <FontAwesomeIcon
                                icon={faPhone}
                                className="mr-1 h-3 w-3"
                              />
                              {connection.phone}
                            </span>
                          )}
                          {connection.experiences &&
                            connection.experiences.length > 0 && (
                              <span className="flex items-center">
                                <FontAwesomeIcon
                                  icon={faBriefcase}
                                  className="mr-1 h-3 w-3"
                                />
                                {connection.experiences[0].company}
                              </span>
                            )}
                          {connection.dateOfBirth && (
                            <span className="flex items-center">
                              <FontAwesomeIcon
                                icon={faCalendarAlt}
                                className="mr-1 h-3 w-3"
                              />
                              {new Date(
                                connection.dateOfBirth
                              ).toLocaleDateString()}
                            </span>
                          )}
                          {connection.gender && (
                            <span className="flex items-center">
                              <FontAwesomeIcon
                                icon={faVenusMars}
                                className="mr-1 h-3 w-3"
                              />
                              {connection.gender}
                            </span>
                          )}
                        </div>
                        {connection.skills && connection.skills.length > 0 && (
                          <div className="mt-1">
                            <h4 className="text-xs font-semibold text-gray-700">
                              Skills:
                            </h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {connection.skills.map((skill, index) => (
                                <span
                                  key={`${connection._id}-skill-${index}`}
                                  className="bg-purple-100 text-purple-800 text-xs px-1 py-0.5 rounded"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <button className="ml-2 bg-purple-100 text-purple-700 px-2 py-1 rounded-full hover:bg-purple-200 transition duration-300 text-xs flex items-center">
                        <FontAwesomeIcon
                          icon={faUserCheck}
                          className="mr-1 h-3 w-3"
                        />{" "}
                        Connected
                      </button>
                      <button
                        className="ml-2 bg-red-600 text-white px-2 py-1 rounded-full hover:bg-red-700 transition duration-300 text-xs flex items-center"
                        onClick={() => handleRemove(connection._id!)}
                      >
                        <FontAwesomeIcon
                          icon={faUserTimes}
                          className="mr-1 h-3 w-3"
                        />{" "}
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Connections;
