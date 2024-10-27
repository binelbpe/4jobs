import React, { useState } from "react";
import MessageList from "./RecruiterMessageList";
import RecruiterConversation from "./RecruiterConversation";
import RecruiterHeader from "./RecruiterHeader";

const RecruiterMessaging: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);

  const handleBackButtonClick = () => {
    setSelectedConversation(null);
  };

  return (
    <div className="flex flex-col h-screen">
      <RecruiterHeader />
      <div className="flex flex-1 overflow-hidden">
        {selectedConversation ? (
          <div className="flex-1 flex flex-col relative">
            <button 
              onClick={handleBackButtonClick} 
              className="absolute top-4 right-4 bg-gray-200 text-gray-800 rounded px-4 py-2 z-10"
              style={{ display: 'block', zIndex: 10 }} // Ensure it floats above other components
            >
              Back
            </button>
            <RecruiterConversation conversationId={selectedConversation} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <MessageList
              onSelectConversation={setSelectedConversation}
              selectedConversationId={selectedConversation}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterMessaging;
