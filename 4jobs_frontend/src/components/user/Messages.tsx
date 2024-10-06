import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { 
  selectConversations, 
  getConversation, 
  fetchConnectionsList, 
  selectConnectionList, 
  clearMessageState,
  refreshConversationList
} from '../../redux/slices/messageSlice';
import ConversationList from './ConversationList';
import Conversation from './Conversation';
import MessageConnectionSearch from './MessageConnectionSearch';
import Header from './Header';
import { Message } from '../../types/messageType';

const Messages: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const conversations = useSelector(selectConversations);
  const connectionList = useSelector(selectConnectionList);
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileConversation, setShowMobileConversation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadInitialData = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      try {
        await dispatch(fetchConnectionsList(user.id));
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [dispatch, user]);

  useEffect(() => {
    loadInitialData();
    return () => {
      dispatch(clearMessageState());
    };
  }, [dispatch, loadInitialData]);

  useEffect(() => {
    if (user && selectedUserId) {
      dispatch(getConversation({ userId1: user.id, userId2: selectedUserId }));
    }
  }, [dispatch, user, selectedUserId]);

  const handleSelectUser = useCallback((userId: string) => {
    setSelectedUserId(userId);
    setShowSearch(false);
    setShowMobileConversation(true);
  }, []);

  const handleBackToList = useCallback(() => {
    setShowMobileConversation(false);
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (user) {
      await dispatch(refreshConversationList(user.id));
    }
  }, [dispatch, user]);

  if (!user) return null;

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

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
              connectionList={connectionList}
              onSelectUser={handleSelectUser}
              selectedUserId={selectedUserId}
              currentUserId={user.id}
            />
          )}
        </div>
        <div className={`w-full md:w-2/3 ${showMobileConversation ? '' : 'hidden md:block'}`}>
          {selectedUserId && conversations[selectedUserId] ? (
            <Conversation
              messages={conversations[selectedUserId] as Message[]}
              currentUserId={user.id}
              recipientId={selectedUserId}
              onBackToList={handleBackToList}
              onSendMessage={handleSendMessage}
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