import React, { useState } from 'react';
import UserConversationList from './UserConversationList';
import UserConversation from './UserConversation';
import Header from './Header';

const UserMessaging: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-grow overflow-hidden">
        <UserConversationList onSelectConversation={setSelectedConversation} />
        <div className="w-2/3 flex flex-col">
          {selectedConversation ? (
            <UserConversation conversationId={selectedConversation} />
          ) : (
            <div className="flex-grow flex items-center justify-center text-gray-500">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserMessaging;
