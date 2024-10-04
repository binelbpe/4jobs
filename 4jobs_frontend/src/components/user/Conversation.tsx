import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { sendMessage, markMessageAsRead } from '../../redux/slices/messageSlice';
import { ConversationProps } from '../../types/messageType';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const Conversation: React.FC<ConversationProps> = ({ messages, currentUserId, recipientId, onBackToList }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    messages.forEach((message) => {
      if (!message.isRead && message.recipient.id === currentUserId) {
        dispatch(markMessageAsRead(message.id));
      }
    });
  }, [dispatch, messages, currentUserId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      dispatch(sendMessage({ senderId: currentUserId, recipientId, content: newMessage }));
      setNewMessage('');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="flex flex-col h-full bg-purple-50">
      <div className="bg-white p-4 border-b flex items-center">
        <button onClick={onBackToList} className="md:hidden mr-4 text-purple-600">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <div className="font-semibold text-purple-800">
          {messages.length > 0 ? messages[0].sender.name : 'Conversation'}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message, index) => {
            const isCurrentUser = message.sender.id === currentUserId;
            const isConsecutive = index > 0 && messages[index - 1].sender.id === message.sender.id;

            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${
                  isConsecutive ? 'mt-1' : 'mt-4'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isCurrentUser ? 'bg-purple-500 text-white' : 'bg-white text-purple-800'
                  }`}
                >
                  {message.content}
                  <div className="text-xs text-purple-300 mt-1">
                    {formatDate(message.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="bg-purple-500 text-white px-4 py-2 rounded-r-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Conversation;