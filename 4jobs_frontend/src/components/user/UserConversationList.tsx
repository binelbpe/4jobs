import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchUserRecruiterConversations } from '../../redux/slices/userRecruiterMessageSlice';
import { URConversation } from '../../types/userRecruiterMessage';

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
}

const UserConversationList: React.FC<ConversationListProps> = ({ onSelectConversation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const conversations = useSelector((state: RootState) => state.userRecruiterMessages.conversations);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchUserRecruiterConversations(currentUser.id));
    }
  }, [dispatch, currentUser]);

  const RecruiterIcon = () => (
    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  return (
    <div className="w-1/3 border-r">
      <h2 className="text-xl font-semibold p-4 border-b">Conversations</h2>
      <ul>
        {conversations.map((conversation: URConversation) => (
          <li 
            key={conversation.id} 
            className="p-4 border-b hover:bg-gray-100 cursor-pointer flex items-center"
            onClick={() => onSelectConversation(conversation.id)}
          >
            <div className="w-12 h-12 rounded-full overflow-hidden mr-4 flex-shrink-0 bg-gray-200 flex items-center justify-center">
              <RecruiterIcon />
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

export default UserConversationList;
