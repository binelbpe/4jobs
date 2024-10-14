import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import {
  fetchMessageConnections,
  setCurrentUserId,
} from "../../redux/slices/userMessageSlice";
import ConversationList from "./ConversationList";
import Conversation from "./Conversation";
import MessageConnectionSearch from "./MessageConnectionSearch";
import Header from "./Header";

const Messages: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchMessageConnections(user.id));
      dispatch(setCurrentUserId(user.id));
    }
  }, [dispatch, user?.id]);

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setShowSearch(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-grow overflow-hidden">
        <div className="w-1/3 flex flex-col bg-white border-r border-gray-300">
          <div className="p-4 border-b border-gray-300">
            <h2 className="text-2xl font-semibold text-purple-700">Messages</h2>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="mt-2 w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition duration-300"
            >
              {showSearch ? "Back to Conversations" : "New Message"}
            </button>
          </div>
          <div className="flex-grow overflow-y-auto">
            {showSearch ? (
              <MessageConnectionSearch onSelectUser={handleSelectUser} />
            ) : (
              <ConversationList
                onSelectConversation={handleSelectUser}
                currentUserId={user?.id || ""} // Pass the current user's ID
              />
            )}
          </div>
        </div>
        <div className="w-2/3 flex flex-col">
          {selectedUserId ? (
            <Conversation userId={selectedUserId} />
          ) : (
            <div className="flex-grow flex items-center justify-center text-gray-500">
              Select a conversation or start a new one
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
