import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { fetchMessages, markAllMessagesAsLocallyRead } from "../../redux/slices/recruiterMessageSlice";
import { Message } from "../../types/recruiterMessageType";
import { userRecruiterSocketService } from "../../services/userRecruiterSocketService";
import { format, isValid } from "date-fns";
import ConversationHeader from "../shared/ConversationHeader";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import VideoCall from '../shared/VideoCall';

interface ConversationProps {
  conversationId: string;
}

const RecruiterConversation: React.FC<ConversationProps> = ({
  conversationId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const messages = useSelector(
    (state: RootState) =>
      state.recruiterMessages.RecruiterMessages[conversationId] || []
  );
  const currentRecruiter = useSelector(
    (state: RootState) => state.recruiter.recruiter
  );
  const typingStatus = useSelector(
    (state: RootState) =>
      state.recruiterMessages.typingStatus[conversationId] || {}
  );
  const conversation = useSelector((state: RootState) =>
    state.recruiterMessages.RecruiterConversations.find(
      (conv) => conv.id === conversationId
    )
  );
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onlineStatus = useSelector(
    (state: RootState) => state.recruiterMessages.onlineStatus
  );
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);

  const scrollToBottom = useCallback(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    dispatch(fetchMessages(conversationId));
    dispatch(markAllMessagesAsLocallyRead(conversationId));
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
    if (newMessage.trim() && currentRecruiter) {
      userRecruiterSocketService.sendMessage(
        conversationId,
        newMessage,
        currentRecruiter.id
      );
      setNewMessage("");
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      userRecruiterSocketService.emitTyping(conversationId);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      userRecruiterSocketService.emitStoppedTyping(conversationId);
    }, 3000);
  };

  const handleMessageRead = (messageId: string) => {
    if (currentRecruiter) {
      userRecruiterSocketService.markMessageAsRead(messageId, conversationId);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isValid(date)) {
      return format(date, "HH:mm");
    }
    return "Invalid Date";
  };

  const isParticipantTyping = Object.values(typingStatus).some(
    (status) => status
  );

  const handleStartVideoCall = () => {
    console.log("Starting video call to:", conversation?.participant.id);
    setIsVideoCallActive(true);
  };

  const handleEndVideoCall = () => {
    setIsVideoCallActive(false);
    userRecruiterSocketService.emitEndCall(conversation?.participant.id || "");
  };

  useEffect(() => {
    userRecruiterSocketService.onCallEnded(() => {
      setIsVideoCallActive(false);
    });

    return () => {
      // Clean up any listeners if necessary
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <ConversationHeader
        participantName={conversation?.participant.name || "Unknown"}
        isOnline={onlineStatus[conversation?.participant.id || ""] || false}
      >
        <button
          onClick={handleStartVideoCall}
          className="ml-2 p-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-colors"
        >
          <FontAwesomeIcon icon={faVideo} />
        </button>
      </ConversationHeader>
      <div ref={messageListRef} className="flex-1 overflow-y-auto p-4">
        {messages.map((message: Message) => (
          <div
            key={message.id}
            className={`mb-4 flex ${
              message.senderId === currentRecruiter?.id
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] p-2 rounded-lg ${
                message.senderId === currentRecruiter?.id
                  ? "bg-purple-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
              onMouseEnter={() => {
                if (
                  message.senderId !== currentRecruiter?.id &&
                  !message.isRead
                ) {
                  handleMessageRead(message.id);
                }
              }}
            >
              <div>{message.content}</div>
              <div className="text-xs mt-1 flex justify-between items-center">
                <span className="text-gray-500">
                  {formatMessageTime(message.timestamp)}
                </span>
                {message.senderId === currentRecruiter?.id && (
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
      <div className="border-t p-4">
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
          >
            Send
          </button>
        </form>
      </div>
      {isVideoCallActive && (
        <VideoCall
          isRecruiter={true}
          recipientId={conversation?.participant.id || ""}
          onEndCall={handleEndVideoCall}
        />
      )}
    </div>
  );
};

export default RecruiterConversation;
