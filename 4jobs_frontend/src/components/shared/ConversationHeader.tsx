import React from 'react';

interface ConversationHeaderProps {
  participantName: string;
  isOnline: boolean;
  children?: React.ReactNode;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({ participantName, isOnline, children }) => {
  return (
    <div className="bg-white border-b p-4 flex items-center justify-between">
      <div className="flex items-center">
        <div className="font-semibold">{participantName}</div>
        <div className={`ml-2 w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
      </div>
      {children}
    </div>
  );
};

export default ConversationHeader;
