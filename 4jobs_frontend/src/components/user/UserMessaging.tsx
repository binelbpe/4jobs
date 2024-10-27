import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import UserHeader from './Header';
import UserConversationList from './UserConversationList';
import UserConversation from './UserConversation';

const UserMessaging: React.FC = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const conversations = useSelector((state: RootState) => state.userRecruiterMessages.conversations);
  const [newMessageNotification, setNewMessageNotification] = useState<string | null>(null);

  useEffect(() => {
    const latestConversation = conversations[0];
    if (latestConversation && latestConversation.id !== selectedConversationId && latestConversation.unreadCount > 0) {
      setNewMessageNotification(`New message from ${latestConversation.participant.name}`);
      setTimeout(() => setNewMessageNotification(null), 0); 
    }
  }, [conversations, selectedConversationId]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setNewMessageNotification(null);
  };

  const handleBackButtonClick = () => {
    setSelectedConversationId(null);
  };

  return (
    <div className="flex flex-col h-screen">
      <UserHeader />
      <div className="flex flex-1 overflow-hidden">
        {selectedConversationId ? (
          <div className="flex-1 flex flex-col relative">
            <button 
              onClick={handleBackButtonClick} 
              className="absolute top-4 right-4 bg-gray-200 text-gray-800 rounded px-4 py-2 z-10"
              style={{ display: 'block', zIndex: 10 }} // Ensure it floats above other components
            >
              Back
            </button>
            <UserConversation conversationId={selectedConversationId} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {newMessageNotification && (
              <div className="bg-purple-500 text-white p-2 text-center">
                {newMessageNotification}
              </div>
            )}
            <UserConversationList onSelectConversation={handleSelectConversation} selectedConversationId={selectedConversationId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMessaging;
