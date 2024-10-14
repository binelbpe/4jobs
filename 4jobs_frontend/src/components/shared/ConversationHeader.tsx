import React from 'react';

interface ConversationHeaderProps {
  participantName: string;
  isOnline: boolean;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({ participantName, isOnline }) => {
  return (
    <div className="bg-white border-b p-4 flex items-center">
      <div className="flex-1">
        <h2 className="text-lg font-semibold">{participantName}</h2>
        <p className={`text-sm ${isOnline ? 'text-green-500' : 'text-gray-500'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </p>
      </div>
    </div>
  );
};

export default ConversationHeader;
