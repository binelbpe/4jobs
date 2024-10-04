import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { selectConversations, getConversation } from '../../redux/slices/messageSlice';
import { fetchConnectionsMessage } from '../../redux/slices/connectionSlice';
import ConversationList from './ConversationList';
import Conversation from './Conversation';
import MessageConnectionSearch from './MessageConnectionSearch';
import Header from './Header';

const Messages: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const conversations = useSelector(selectConversations);
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileConversation, setShowMobileConversation] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchConnectionsMessage(user.id));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user && selectedUserId) {
      dispatch(getConversation({ userId1: user.id, userId2: selectedUserId }));
    }
  }, [dispatch, user, selectedUserId]);

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setShowSearch(false);
    setShowMobileConversation(true);
    if (user) {
      dispatch(getConversation({ userId1: user.id, userId2: userId }));
    }
  };

  const handleBackToList = () => {
    setShowMobileConversation(false);
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen bg-purple-50">
      <Header />
      <div className="flex flex-grow overflow-hidden">
        <div className={`w-full md:w-1/3 bg-white border-r flex flex-col ${showMobileConversation ? 'hidden md:flex' : ''}`}>
          <div className="p-4 border-b">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="w-full p-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition duration-300"
            >
              {showSearch ? 'Show Conversations' : 'Search Connections'}
            </button>
          </div>
          {showSearch ? (
            <MessageConnectionSearch onSelectUser={handleSelectUser} />
          ) : (
            <ConversationList
              conversations={conversations}
              onSelectUser={handleSelectUser}
              selectedUserId={selectedUserId}
              currentUserId={user.id}
            />
          )}
        </div>
        <div className={`w-full md:w-2/3 ${showMobileConversation ? '' : 'hidden md:block'}`}>
          {selectedUserId && conversations[selectedUserId] ? (
            <Conversation
              messages={conversations[selectedUserId]}
              currentUserId={user.id}
              recipientId={selectedUserId}
              onBackToList={handleBackToList}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a conversation or search for a connection to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;