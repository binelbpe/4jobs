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
      setTimeout(() => setNewMessageNotification(null),0); 
    }
  }, [conversations, selectedConversationId]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setNewMessageNotification(null);
  };

  return (
    <div className="flex flex-col h-screen">
      <UserHeader />
      <div className="flex flex-1 overflow-hidden">
        <UserConversationList onSelectConversation={handleSelectConversation} selectedConversationId={selectedConversationId} />
        <div className="flex-1 flex flex-col">
          {newMessageNotification && (
            <div className="bg-purple-500 text-white p-2 text-center">
              {newMessageNotification}
            </div>
          )}
          {selectedConversationId ? (
            <UserConversation conversationId={selectedConversationId} />
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

export default UserMessaging;
