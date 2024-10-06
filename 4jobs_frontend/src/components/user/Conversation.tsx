import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { sendMessage, markMessageAsRead, getConversation } from '../../redux/slices/messageSlice';
import { Message } from '../../types/messageType';

interface ConversationProps {
  messages: Message[];
  currentUserId: string;
  recipientId: string;
  onBackToList: () => void;
  onSendMessage: () => void;
}

const Conversation: React.FC<ConversationProps> = ({ messages, currentUserId, recipientId, onBackToList, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    messages.forEach(message => {
      if (!message.isRead && message.sender.id !== currentUserId) {
        dispatch(markMessageAsRead(message.id));
      }
    });
  }, [messages, currentUserId, dispatch]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      await dispatch(sendMessage({
        senderId: currentUserId,
        recipientId: recipientId,
        content: newMessage.trim()
      }));
      setNewMessage('');
      dispatch(getConversation({ userId1: currentUserId, userId2: recipientId }));
      onSendMessage(); // Call the callback to refresh the conversation list
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getOtherUserName = () => {
    if (messages.length === 0) return "Chat";
    const otherUser = messages[0].sender.id === currentUserId ? messages[0].recipient : messages[0].sender;
    return otherUser.name;
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="p-4 bg-white border-b flex justify-between items-center shadow-sm">
        <button onClick={onBackToList} className="md:hidden text-gray-600 hover:text-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-800">{getOtherUserName()}</h2>
        <div className="w-6 md:hidden"></div>
      </div>
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex mb-4 ${
              message.sender.id === currentUserId ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg shadow ${
                message.sender.id === currentUserId
                  ? 'bg-purple-500 text-white rounded-br-none'
                  : 'bg-white text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="break-words">{message.content}</p>
              <div className={`text-xs mt-1 ${
                message.sender.id === currentUserId ? 'text-purple-200' : 'text-gray-500'
              }`}>
                {formatTimestamp(message.createdAt)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
        <div className="flex rounded-full border overflow-hidden shadow-sm">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow p-2 pl-4 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-purple-500 text-white p-2 px-4 hover:bg-purple-600 transition duration-300"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Conversation;