import React from 'react';
import { Message } from '../../types/messageType';
import {  User } from '../../types/auth';

interface ConversationListProps {
  conversations: Record<string, Message[]>;
  onSelectUser: (userId: string) => void;
  selectedUserId: string | null;
  currentUserId: string;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  onSelectUser,
  selectedUserId,
  currentUserId,
}) => {
  const getOtherUser = (messages: Message[]): User => {
    const lastMessage = messages[messages.length - 1];
    return lastMessage.sender.id === currentUserId ? lastMessage.recipient : lastMessage.sender;
  };

  return (
    <div className="h-full overflow-y-auto">
      {Object.entries(conversations).map(([userId, messages]) => {
        if (messages.length === 0) return null;
        const otherUser = getOtherUser(messages);
        const lastMessage = messages[messages.length - 1];

        return (
          <div
            key={userId}
            className={`p-4 border-b cursor-pointer hover:bg-purple-100 transition duration-300 ${
              selectedUserId === userId ? 'bg-purple-200' : ''
            }`}
            onClick={() => onSelectUser(userId)}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-purple-300 mr-3 flex-shrink-0">
                {otherUser.profileImage && (
                  <img
                    src={`${otherUser.profileImage}`}
                    alt={otherUser.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                )}
              </div>
              <div className="flex-grow min-w-0">
                <div className="font-semibold text-purple-800 truncate">{otherUser.name}</div>
                <div className="text-sm text-purple-600 truncate">{lastMessage.content}</div>
              </div>
              <div className="text-xs text-purple-400 whitespace-nowrap ml-2">
                {new Date(lastMessage.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;