import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { fetchMessages, recruiterSendMessage } from '../../redux/slices/recruiterMessageSlice';
import { RootState, AppDispatch } from '../../redux/store';
import { Message } from '../../types/recruiterMessageType';

interface ConversationProps {
  conversationId: string;
}

const selectMessages = createSelector(
  (state: RootState) => state.recruiterMessages.RecruiterMessages,
  (state: RootState, conversationId: string) => conversationId,
  (messages, conversationId) => messages[conversationId] || []
);

const Conversation: React.FC<ConversationProps> = React.memo(({ conversationId }) => {
  console.log('Rendering RecruiterConversation', conversationId);

  const dispatch = useDispatch<AppDispatch>();
  const messages = useSelector((state: RootState) => selectMessages(state, conversationId));
  const loading = useSelector((state: RootState) => state.recruiterMessages.recruiterLoading);
  const error = useSelector((state: RootState) => state.recruiterMessages.recruiterError);
  const recruiterId = useSelector((state: RootState) => state.recruiter.recruiter?.id);
  const [newMessage, setNewMessage] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const prevMessagesRef = useRef<Message[]>([]);
  const messageListRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, []);

  const fetchMessagesCallback = useCallback(() => {
    if (conversationId) {
      dispatch(fetchMessages(conversationId));
    }
  }, [dispatch, conversationId]);

  useEffect(() => {
    console.log('Fetching messages for conversation', conversationId);
    fetchMessagesCallback();
  }, [fetchMessagesCallback]);

  useEffect(() => {
    if (messages.length !== prevMessagesRef.current.length || 
        messages[messages.length - 1]?.id !== prevMessagesRef.current[prevMessagesRef.current.length - 1]?.id) {
      console.log('Messages updated', messages.length);
      prevMessagesRef.current = messages;
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom();
    }
  }, [loading, messages, scrollToBottom]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      try {
        console.log('Sending message', newMessage);
        await dispatch(recruiterSendMessage({ conversationId, content: newMessage })).unwrap();
        setNewMessage('');
        setSendError(null);
      } catch (error) {
        console.error('Error sending message:', error);
        setSendError('Failed to send message. Please try again.');
      }
    }
  }, [dispatch, conversationId, newMessage]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  }, []);

  if (loading) return <div>Loading messages...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex-1 flex flex-col">
      <div ref={messageListRef} className="flex-1 overflow-y-auto p-4">
        {messages.map((message: Message) => {
          const isRecruiterMessage = message.senderId === recruiterId;
          return (
            <div key={message.id} className={`mb-4 flex ${isRecruiterMessage ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-2 rounded-lg ${
                isRecruiterMessage 
                  ? 'bg-purple-500 text-white rounded-br-none' 
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}>
                {message.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="border-t p-4">
        <div className="flex flex-col">
          <div className="flex">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              className="flex-1 border rounded-l-lg p-2"
              placeholder="Type a message..."
            />
            <button type="submit" className="bg-purple-500 text-white rounded-r-lg px-4 py-2">Send</button>
          </div>
          {sendError && <div className="text-red-500 mt-2">{sendError}</div>}
        </div>
      </form>
    </div>
  );
});

export default Conversation;
