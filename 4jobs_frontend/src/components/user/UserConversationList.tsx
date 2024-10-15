import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { fetchUserRecruiterConversations } from "../../redux/slices/userRecruiterMessageSlice";
import { URConversation } from "../../types/userRecruiterMessage";
import { userRecruiterSocketService } from "../../services/userRecruiterSocketService";

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId: string | null;
}

const UserConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  selectedConversationId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const conversations = useSelector(
    (state: RootState) => state.userRecruiterMessages.conversations
  );
  const messages = useSelector(
    (state: RootState) => state.userRecruiterMessages.messages
  );
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const onlineStatus = useSelector(
    (state: RootState) => state.userRecruiterMessages.onlineStatus
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      if (currentUser?.id) {
        setIsLoading(true);
        await dispatch(fetchUserRecruiterConversations(currentUser.id));
        userRecruiterSocketService.connect(currentUser.id, "user");
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [dispatch, currentUser]);

  const getUnreadCount = (conversationId: string) => {
    const conversationMessages = messages[conversationId] || [];
    return conversationMessages.filter(
      (msg) => !msg.isRead && !msg.locallyRead && msg.senderId !== currentUser?.id
    ).length;
  };

  if (isLoading) {
    return <div>Loading conversations...</div>;
  }

  if (conversations.length === 0) {
    return <div>No conversations found.</div>;
  }

  return (
    <div className="w-1/3 border-r">
      <h2 className="text-xl font-semibold p-4 border-b">Conversations</h2>
      <ul>
        {conversations.map((conversation: URConversation) => {
          const unreadCount = getUnreadCount(conversation.id);
          return (
            <li
              key={conversation.id}
              className={`p-4 border-b hover:bg-gray-100 cursor-pointer flex items-center ${
                conversation.id === selectedConversationId ? "bg-gray-100" : ""
              }`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="relative mr-4">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center">
                  {conversation.participant.profileImage ? (
                    <img
                      src={conversation.participant.profileImage}
                      alt={conversation.participant.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-2xl font-bold text-gray-600">
                      {conversation.participant.name.charAt(0)}
                    </div>
                  )}
                </div>
                {onlineStatus[conversation.participant.id] && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white transform translate-x-1 translate-y-1"></div>
                )}
              </div>
              <div className="flex-grow min-w-0">
                <h3 className="font-semibold truncate">
                  {conversation.participant.name}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {conversation.lastMessage}
                </p>
              </div>
              {unreadCount > 0 && (
                <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs ml-2">
                  {unreadCount}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default UserConversationList;