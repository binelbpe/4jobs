import React, { useState } from "react";
import MessageList from "./RecruiterMessageList";
import Conversation from "./RecruiterConversation";
import RecruiterHeader from "./RecruiterHeader";

const RecruiterMessaging: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);

  return (
    <div className="flex flex-col h-screen">
      <RecruiterHeader />
     
        <div className="flex flex-1 overflow-hidden">
          <MessageList
            onSelectConversation={setSelectedConversation}
            selectedConversationId={selectedConversation}
          />
          {selectedConversation ? (
            <Conversation conversationId={selectedConversation} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
  );
};

export default RecruiterMessaging;
