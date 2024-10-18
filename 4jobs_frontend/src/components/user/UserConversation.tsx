import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { 
  fetchUserRecruiterMessages,
  setMessageSending
} from "../../redux/slices/userRecruiterMessageSlice";
import { URMessage } from "../../types/userRecruiterMessage";
import { userRecruiterSocketService } from "../../services/userRecruiterSocketService";
import { format, isValid, parseISO } from "date-fns";
import ConversationHeader from "../shared/ConversationHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo, faPhone } from "@fortawesome/free-solid-svg-icons";
import VideoCall from "../shared/VideoCall";
import { videoCallService } from "../../services/RecruiterUservideoCallService";

interface ConversationProps {
  conversationId: string;
}

const UserConversation: React.FC<ConversationProps> = ({ conversationId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const messages = useSelector(
    (state: RootState) =>
      state.userRecruiterMessages.messages[conversationId] || []
  );
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const typingStatus = useSelector(
    (state: RootState) =>
      state.userRecruiterMessages.typingStatus[conversationId] || {}
  );
  const conversation = useSelector((state: RootState) =>
    state.userRecruiterMessages.conversations.find(
      (conv) => conv.id === conversationId
    )
  );
  const onlineStatus = useSelector(
    (state: RootState) => state.userRecruiterMessages.onlineStatus
  );
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [incomingCallOffer, setIncomingCallOffer] = useState<string | null>(
    null
  );
  const messageSending = useSelector((state: RootState) => state.userRecruiterMessages.messageSending);

  const scrollToBottom = useCallback(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    dispatch(fetchUserRecruiterMessages(conversationId));
    userRecruiterSocketService.joinConversation(conversationId);
    return () => {
      userRecruiterSocketService.leaveConversation(conversationId);
    };
  }, [dispatch, conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && currentUser) {
      dispatch(setMessageSending(true));
      userRecruiterSocketService.sendMessage(
        conversationId,
        newMessage,
        currentUser.id
      );
      setNewMessage("");
      // You might want to add a setTimeout to set messageSending back to false
      // in case the socket doesn't respond quickly enough
      setTimeout(() => dispatch(setMessageSending(false)), 2000);
    }
  };
  console.log("conversation",conversation)

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      userRecruiterSocketService.emitTyping(conversationId, conversation?.participant.id || "");
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      userRecruiterSocketService.emitStoppedTyping(conversationId, conversation?.participant.id || "");
    }, 3000);
  };

  const handleMessageRead = (messageId: string) => {
    userRecruiterSocketService.markMessageAsRead(messageId, conversationId);
  };

  const formatMessageTime = (dateString: string | undefined) => {
    if (!dateString) {
      console.error("Invalid date: undefined");
      return "Invalid Date";
    }

    let date: Date | null = null;

    // Try parsing as ISO string
    date = parseISO(dateString);

    // If parsing as ISO failed, try creating a new Date object
    if (!isValid(date)) {
      date = new Date(dateString);
    }

    // If both methods failed, return a default string
    if (!isValid(date)) {
      console.error(`Invalid date: ${dateString}`);
      return "Invalid Date";
    }

    return format(date, "HH:mm");
  };

  const isParticipantTyping = Object.values(typingStatus).some(
    (status) => status
  );

  useEffect(() => {
    const handleIncomingCall = (callerId: string, offerBase64: string) => {
      console.log("Handling incoming call:", { callerId, offerBase64 });
      setIncomingCall(true);
      setIncomingCallOffer(offerBase64);
      // You can play a ringtone here
    };

    userRecruiterSocketService.onIncomingCall(handleIncomingCall);

    return () => {
      userRecruiterSocketService.offIncomingCall(handleIncomingCall);
    };
  }, []);

  const handleAcceptCall = async () => {
    if (incomingCallOffer) {
      setIncomingCall(false);
      setIsVideoCallActive(true);
      const answer = await videoCallService.handleIncomingCall(
        incomingCallOffer
      );
      userRecruiterSocketService.emitCallAnswer(
        conversation?.participant.id || "",
        answer
      );
      setIncomingCallOffer(null);
    }
  };

  const handleRejectCall = () => {
    setIncomingCall(false);
    userRecruiterSocketService.emitCallRejected(
      conversation?.participant.id || ""
    );
  };

  const handleEndVideoCall = () => {
    setIsVideoCallActive(false);
    userRecruiterSocketService.emitEndCall(conversation?.participant.id || "");
  };

  // Add this before the return statement
  console.log("UserConversation render state:", {
    incomingCall,
    isVideoCallActive,
    incomingCallOffer,
  });

  useEffect(() => {
    userRecruiterSocketService.onCallEnded(() => {
      setIsVideoCallActive(false);
    });
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <ConversationHeader
        participantName={conversation?.participant.name || "Unknown"}
        isOnline={onlineStatus[conversation?.participant.id || ""] || false}
      />
      <div
        ref={messageListRef}
        className="flex-grow overflow-y-auto p-4"
        style={{ maxHeight: "calc(100vh - 200px)" }}
      >
        {messages.map((message: URMessage) => (
          <div
            key={`${message.id}-${message.timestamp}`}
            className={`mb-4 flex ${
              message.senderId === currentUser?.id
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] p-2 rounded-lg ${
                message.senderId === currentUser?.id
                  ? "bg-purple-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
              onMouseEnter={() => {
                if (message.senderId !== currentUser?.id && !message.isRead) {
                  handleMessageRead(message.id);
                }
              }}
            >
              <div>{message.content}</div>
              <div className="text-xs mt-1 flex justify-between items-center">
                <span className="text-gray-500">
                  {formatMessageTime(message.timestamp)}
                </span>
                {message.senderId === currentUser?.id && (
                  <span className="ml-2">
                    {message.isRead ? (
                      <span className="text-blue-400">✓✓</span>
                    ) : (
                      <span className="text-gray-400">✓</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t p-4 bg-white">
        {isParticipantTyping && (
          <div className="text-sm text-gray-500 italic mb-2">
            {conversation?.participant.name} is typing...
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            className="flex-1 border rounded-l-lg p-2"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="bg-purple-500 text-white rounded-r-lg px-4 py-2"
            disabled={messageSending}
          >
            {messageSending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
      {incomingCall && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Incoming Video Call</h2>
            <p className="mb-6">from {conversation?.participant.name}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleAcceptCall}
                className="p-3 rounded-full bg-green-500 text-white"
              >
                <FontAwesomeIcon icon={faVideo} className="text-xl" />
              </button>
              <button
                onClick={handleRejectCall}
                className="p-3 rounded-full bg-red-500 text-white"
              >
                <FontAwesomeIcon
                  icon={faPhone}
                  className="text-xl transform rotate-135"
                />
              </button>
            </div>
          </div>
        </div>
      )}
      {isVideoCallActive && (
        <VideoCall
          isRecruiter={false}
          recipientId={conversation?.participant.id || ""}
          onEndCall={handleEndVideoCall}
        />
      )}
    </div>
  );
};

export default UserConversation;
