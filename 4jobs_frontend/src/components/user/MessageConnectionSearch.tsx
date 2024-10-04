import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchConnectionsMessage, searchConnectionsMessage } from '../../redux/slices/connectionSlice';
import { User, UserConnection } from '../../types/auth';

interface MessageConnectionSearchProps {
  onSelectUser: (userId: string) => void;
}

const isUserConnection = (user: User | UserConnection): user is UserConnection => {
  return '_id' in user;
};

const getUserId = (user: User | UserConnection): string => {
  return isUserConnection(user) ? user._id : user.id;
};

const MessageConnectionSearch: React.FC<MessageConnectionSearchProps> = ({ onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const connections = useSelector((state: RootState) => state.connections.messageConnections);
  const searchResults = useSelector((state: RootState) => state.connections.messageSearchResults);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const loading = useSelector((state: RootState) => state.connections.loading);
  const error = useSelector((state: RootState) => state.connections.error);

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchConnectionsMessage(getUserId(currentUser)));
    }
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (searchTerm && currentUser) {
      dispatch(searchConnectionsMessage({ userId: getUserId(currentUser), query: searchTerm }));
    }
  }, [dispatch, searchTerm, currentUser]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectUser = (userId: string) => {
    onSelectUser(userId);
    setSearchTerm('');
  };

  const displayConnections: (User | UserConnection)[] = searchTerm ? searchResults : connections;
console.log("displayConnections",displayConnections)
  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Search connections..."
        value={searchTerm}
        onChange={handleSearch}
        className="w-full p-2 border rounded mb-4"
      />
      <ul className="space-y-2">
        {displayConnections.map((connection: User | UserConnection) => {
          const userId = getUserId(connection);
          return (
            <li
              key={userId}
              onClick={() => handleSelectUser(userId)}
              className="cursor-pointer hover:bg-gray-100 p-2 rounded"
            >
              <div className="flex items-center">
                <img
                  src={`${connection.profileImage}`}
                  alt={connection.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <span>{connection.name}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default MessageConnectionSearch;