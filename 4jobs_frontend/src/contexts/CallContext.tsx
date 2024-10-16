import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { socketService } from '../services/socketService';

interface CallContextType {
  isIncomingCall: boolean;
  incomingCallData: { callerId: string; offer: string } | null;
  isCallActive: boolean;
  handleIncomingCall: (data: { callerId: string; offer: string }) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  setupVideoCall: (recipientId: string) => void;
  endCall: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

interface CallProviderProps {
  children: ReactNode;
}

export const CallProvider: React.FC<CallProviderProps> = ({ children }) => {
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState<{ callerId: string; offer: string } | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);

  const handleIncomingCall = useCallback((data: { callerId: string; offer: string }) => {
    console.log("Incoming call from:", data.callerId);
    setIsIncomingCall(true);
    setIncomingCallData(data);
  }, []);

  const acceptCall = useCallback(() => {
    console.log("Call accepted in CallContext");
    setIsIncomingCall(false);
    setIsCallActive(true);
    console.log("isCallActive set to true");
  }, []);

  const rejectCall = useCallback(() => {
    if (incomingCallData) {
      socketService.emit("rejectCall", { callerId: incomingCallData.callerId });
      setIsIncomingCall(false);
      setIncomingCallData(null);
    }
  }, [incomingCallData]);

  const setupVideoCall = useCallback((recipientId: string) => {
    console.log(`Setting up video call with ${recipientId}`);
    setIsCallActive(true);
  }, []);

  const endCall = useCallback(() => {
    console.log("Call ended");
    setIsCallActive(false);
    setIncomingCallData(null);
  }, []);

  return (
    <CallContext.Provider value={{ 
      isIncomingCall, 
      incomingCallData, 
      isCallActive,
      handleIncomingCall, 
      acceptCall, 
      rejectCall,
      setupVideoCall,
      endCall
    }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};
