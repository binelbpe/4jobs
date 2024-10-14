import React, { useState } from 'react';
import RecruiterHeader from './RecruiterHeader';
import MessageList from './RecruiterMessageList';
import Conversation from './RecruiterConversation';

const Messaging: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-100">
      <RecruiterHeader />
      <div className="container mx-auto mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex h-[calc(100vh-200px)]">
          <MessageList onSelectConversation={setSelectedConversation} />
          {selectedConversation ? (
            <Conversation conversationId={selectedConversation} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messaging;
