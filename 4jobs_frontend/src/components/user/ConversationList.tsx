import React from 'react';
import { UserConnection } from '../../types/auth';
import { Message } from '../../types/messageType';

interface ConversationListProps {
  conversations: Record<string, Message[]>;
  connectionList: UserConnection[];
  onSelectUser: (userId: string) => void;
  selectedUserId: string | null;
  currentUserId: string;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  connectionList,
  onSelectUser,
  selectedUserId,
  currentUserId
}) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (!Array.isArray(connectionList) || connectionList.length === 0) {
    return <div className="p-4 text-center text-gray-500">No connections available</div>;
  }

  // Sort the connectionList based on lastMessageDate
  const sortedConnections = [...connectionList].sort((a, b) => {
    const dateA = new Date(a.lastMessageDate || 0);
    const dateB = new Date(b.lastMessageDate || 0);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="overflow-y-auto">
      {sortedConnections.map((connection) => {
        if (!connection || !connection._id) {
          return null; // Skip invalid connections
        }

        return (
          <div
            key={connection._id}
            className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${
              selectedUserId === connection._id ? 'bg-blue-100' : ''
            }`}
            onClick={() => onSelectUser(connection._id)}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0">
                {connection.profileImage && (
                  <img
                    src={connection.profileImage}
                    alt={connection.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                )}
              </div>
              <div className="ml-4 flex-grow overflow-hidden">
                <h3 className="font-semibold text-gray-800">{connection.name || 'Unnamed User'}</h3>
                <p className="text-sm text-gray-600 truncate">
                  {connection.lastMessage}
                </p>
              </div>
              <div className="text-xs text-gray-500">
                {connection.lastMessageDate && formatTimestamp(connection.lastMessageDate)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;