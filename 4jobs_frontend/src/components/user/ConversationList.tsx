import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

interface ConversationListProps {
  onSelectConversation: (userId: string) => void;
  currentUserId: string;
}

const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  currentUserId,
}) => {
  const connections = useSelector(
    (state: RootState) => state.messages.connections
  );

  // Filter out the current user's conversation
  const filteredConnections = connections.filter(
    (connection) => connection.user.id !== currentUserId
  );

  return (
    <div className="overflow-y-auto h-full">
      {filteredConnections.map((connection) => (
        <div
          key={connection.user.id}
          className="p-4 border-b border-gray-200 cursor-pointer hover:bg-purple-50 transition duration-300"
          onClick={() => onSelectConversation(connection.user.id)}
        >
          <div className="flex items-center">
            <div className="relative">
              <img
                src={connection.user.profileImage || "/default-avatar.png"}
                alt={connection.user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              {connection.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div className="ml-4 flex-grow">
              <h3 className="text-lg font-semibold text-purple-800">
                {connection.user.name}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {connection.lastMessage?.content || "No messages yet"}
              </p>
            </div>
            <div className="text-xs text-gray-500">
              {connection.lastMessage && new Date(connection.lastMessage.createdAt).toLocaleTimeString(
                [],
                { hour: "2-digit", minute: "2-digit" }
              )}
            </div>
          </div>
          {connection.isTyping && (
            <p className="text-sm text-gray-500 mt-1">Typing...</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ConversationList;
