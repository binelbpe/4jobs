import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { 
  fetchConnections, 
  searchConnections, 
  acceptConnectionRequest, 
  rejectConnectionRequest
} from '../../redux/slices/connectionSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUserCheck, faUserTimes, faEnvelope, faPhone, faBriefcase, faCalendarAlt, faVenusMars } from '@fortawesome/free-solid-svg-icons';
import UserHeader from './Header';
import { User, RecommendationUser } from '../../types/auth';

const Connections: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, connections, connectionRequests, loading, error } = useSelector((state: RootState) => ({
    user: state.auth.user,
    ...state.connections
  }));
  const [searchQuery, setSearchQuery] = useState('');
  const [localLoading, setLocalLoading] = useState<{ [key: string]: boolean }>({});

  const fetchData = useCallback(() => {
    if (user) {
      dispatch(fetchConnections(user.id));
    }
  }, [dispatch, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = useCallback(() => {
    if (user) {
      dispatch(searchConnections({ userId: user.id, query: searchQuery }));
    }
  }, [dispatch, user, searchQuery]);

  const handleAccept = async (requestId: string) => {
    if (user) {
      setLocalLoading(prev => ({ ...prev, [requestId]: true }));
      try {
        await dispatch(acceptConnectionRequest({ requestId, userId: user.id })).unwrap();
      } catch (error) {
        console.error("Error accepting request:", error);
      } finally {
        setLocalLoading(prev => ({ ...prev, [requestId]: false }));
      }
    }
  };

  const handleReject = async (requestId: string) => {
    if (user) {
      setLocalLoading(prev => ({ ...prev, [requestId]: true }));
      try {
        await dispatch(rejectConnectionRequest({ requestId, userId: user.id })).unwrap();
      } catch (error) {
        console.error("Error rejecting request:", error);
      } finally {
        setLocalLoading(prev => ({ ...prev, [requestId]: false }));
      }
    }
  };

  if (error) return <div className="text-red-600 text-center mt-8">Error: {error}</div>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <UserHeader />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-purple-800">My Network</h1>
        
        <div className="mb-8">
          <div className="flex items-center max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow px-4 py-2 border border-purple-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Search connections"
            />
            <button
              onClick={handleSearch}
              className="bg-purple-600 text-white px-4 py-2 rounded-r-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          </div>
        ) : (
          <>
            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-purple-800">Connection Requests</h2>
              {connectionRequests.length === 0 ? (
                <p className="text-gray-600">No pending connection requests.</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {connectionRequests.map((request: RecommendationUser) => (
                    <li key={request.id} className="py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <img src={request.profileImage || '/default-avatar.png'} alt={request.name} className="w-12 h-12 rounded-full object-cover" />
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-purple-800">{request.name}</h3>
                          <p className="text-sm text-gray-600">{request.bio || 'No bio available'}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition duration-300 flex items-center"
                          onClick={() => handleAccept(request.id)}
                          disabled={localLoading[request.id]}
                        >
                          <FontAwesomeIcon icon={faUserCheck} className="mr-1" /> 
                          {localLoading[request.id] ? 'Processing...' : 'Accept'}
                        </button>
                        <button 
                          className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400 transition duration-300 flex items-center"
                          onClick={() => handleReject(request.id)}
                          disabled={localLoading[request.id]}
                        >
                          <FontAwesomeIcon icon={faUserTimes} className="mr-1" /> 
                          {localLoading[request.id] ? 'Processing...' : 'Decline'}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-purple-800">Your Connections</h2>
              {connections?.length === 0 ? (
                <p className="text-gray-600">You don't have any connections yet.</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {connections?.map((connection: User) => (
                    <li key={connection.id} className="py-6 flex flex-col sm:flex-row items-start sm:items-center">
                      <img src={connection.profileImage || '/default-avatar.png'} alt={connection.name} className="w-20 h-20 rounded-full object-cover mb-4 sm:mb-0 sm:mr-6" />
                      <div className="flex-grow">
                        <h3 className="text-xl font-semibold text-purple-800">{connection.name}</h3>
                        <p className="text-gray-600 mb-2">{connection.bio || 'No bio available'}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          {connection.email && (
                            <span className="flex items-center">
                              <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                              {connection.email}
                            </span>
                          )}
                          {connection.phone && (
                            <span className="flex items-center">
                              <FontAwesomeIcon icon={faPhone} className="mr-2" />
                              {connection.phone}
                            </span>
                          )}
                          {connection.experiences && connection.experiences.length > 0 && (
                            <span className="flex items-center">
                              <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
                              {connection.experiences[0].company}
                            </span>
                          )}
                          {connection.dateOfBirth && (
                            <span className="flex items-center">
                              <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                              {new Date(connection.dateOfBirth).toLocaleDateString()}
                            </span>
                          )}
                          {connection.gender && (
                            <span className="flex items-center">
                              <FontAwesomeIcon icon={faVenusMars} className="mr-2" />
                              {connection.gender}
                            </span>
                          )}
                        </div>
                        {connection.skills && connection.skills.length > 0 && (
                          <div className="mt-2">
                            <h4 className="text-sm font-semibold text-gray-700">Skills:</h4>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {connection.skills.map((skill, index) => (
                                <span key={index} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <button className="mt-4 sm:mt-0 bg-purple-100 text-purple-700 px-4 py-2 rounded-full hover:bg-purple-200 transition duration-300 text-sm flex items-center">
                        <FontAwesomeIcon icon={faUserCheck} className="mr-2" /> Connected
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