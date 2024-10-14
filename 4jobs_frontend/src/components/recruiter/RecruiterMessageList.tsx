import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConversations } from '../../redux/slices/recruiterMessageSlice';
import { RootState, AppDispatch } from '../../redux/store';
import { Conversation } from '../../types/recruiterMessageType';

interface MessageListProps {
  onSelectConversation: (conversationId: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({ onSelectConversation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const conversations = useSelector((state: RootState) => state.recruiterMessages.RecruiterConversations);
  const loading = useSelector((state: RootState) => state.recruiterMessages.recruiterLoading);
  const error = useSelector((state: RootState) => state.recruiterMessages.recruiterError);
  const recruiterId = useSelector((state: RootState) => state.recruiter.recruiter?.id);

  useEffect(() => {
    if (recruiterId) {
      dispatch(fetchConversations(recruiterId));
    }
  }, [dispatch, recruiterId]);

  if (loading) return <div>Loading conversations...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-1/3 border-r">
      <h2 className="text-xl font-semibold p-4 border-b">Conversations</h2>
      <ul>
        {conversations.map((conversation: Conversation) => (
          <li 
            key={conversation.id} 
            className="p-4 border-b hover:bg-gray-100 cursor-pointer flex items-center"
            onClick={() => onSelectConversation(conversation.id)}
          >
            <div className="w-12 h-12 rounded-full overflow-hidden mr-4 flex-shrink-0">
              <img 
                src={conversation.participant.profileImage || '/default-avatar.png'} 
                alt={`${conversation.participant.name}'s avatar`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-grow min-w-0">
              <h3 className="font-semibold truncate">{conversation.participant.name}</h3>
              <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MessageList;
