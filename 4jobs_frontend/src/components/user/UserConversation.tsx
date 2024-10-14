import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchUserRecruiterMessages, sendUserRecruiterMessage } from '../../redux/slices/userRecruiterMessageSlice';
import { URMessage } from '../../types/userRecruiterMessage';

interface ConversationProps {
  conversationId: string;
}

const UserConversation: React.FC<ConversationProps> = ({ conversationId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const messages = useSelector((state: RootState) => state.userRecruiterMessages.messages[conversationId] || []);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [newMessage, setNewMessage] = useState('');
  const messageListRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    dispatch(fetchUserRecruiterMessages(conversationId));
  }, [dispatch, conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && currentUser) {
      await dispatch(sendUserRecruiterMessage({ conversationId, content: newMessage, senderId: currentUser.id }));
      setNewMessage('');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div ref={messageListRef} className="flex-1 overflow-y-auto p-4">
        {messages.map((message: URMessage) => (
          <div key={message.id} className={`mb-4 flex ${message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-2 rounded-lg ${
              message.senderId === currentUser?.id
                ? 'bg-purple-500 text-white rounded-br-none'
                : 'bg-gray-200 text-gray-800 rounded-bl-none'
            }`}>
              {message.content}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="border-t p-4">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 border rounded-l-lg p-2"
            placeholder="Type a message..."
          />
          <button type="submit" className="bg-purple-500 text-white rounded-r-lg px-4 py-2">Send</button>
        </div>
      </form>
    </div>
  );
};

export default UserConversation;
