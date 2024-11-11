import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { searchConnectionsMessage } from "../../redux/slices/connectionSlice";
import { UserConnection } from "../../types/auth";

interface MessageConnectionSearchProps {
  onSelectUser: (userId: string) => void;
}

const MessageConnectionSearch: React.FC<MessageConnectionSearchProps> = ({
  onSelectUser,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const searchResults = useSelector(
    (state: RootState) => state.connections.messageSearchResults
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && searchQuery.trim()) {
      dispatch(
        searchConnectionsMessage({ userId: user.id, query: searchQuery.trim() })
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={handleSearch} className="p-4 border-b">
        <div className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search connections..."
            className="flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="bg-purple-500 text-white p-2 rounded-r hover:bg-purple-600 transition duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </form>
      <div className="flex-grow overflow-y-auto">
        {searchResults.map((connection: UserConnection) => (
          <div
            key={connection._id}
            className="p-4 border-b cursor-pointer hover:bg-purple-100 transition duration-300"
            onClick={() => onSelectUser(connection._id)}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-purple-300 mr-3 flex-shrink-0">
                {connection.profileImage && (
                  <img
                    src={connection.profileImage}
                    alt={connection.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                )}
              </div>
              <div>
                <div className="font-semibold text-purple-800">
                  {connection.name}
                </div>
                <div className="text-sm text-purple-600">
                  {connection.email}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageConnectionSearch;
