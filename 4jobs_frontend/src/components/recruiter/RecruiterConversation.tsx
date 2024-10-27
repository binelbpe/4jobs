import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import {
  fetchMessages,
  markAllMessagesAsLocallyRead,
  setMessageSending,
} from "../../redux/slices/recruiterMessageSlice";
import { Message } from "../../types/recruiterMessageType";
import { userRecruiterSocketService } from "../../services/userRecruiterSocketService";
import { format, isValid } from "date-fns";
import ConversationHeader from "../shared/ConversationHeader";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faVideo } from "@fortawesome/free-solid-svg-icons";
import VideoCall from "../shared/VideoCall";
import { toast } from "react-toastify";

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
  const [error, setError] = useState<string | null>(null);


  const scrollToBottom = useCallback(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    const fetchMessagesAndJoinConversation = async () => {
      try {
        await dispatch(fetchMessages(conversationId)).unwrap();
        dispatch(markAllMessagesAsLocallyRead(conversationId));
        userRecruiterSocketService.joinConversation(conversationId);
      } catch (error) {
        setError("Failed to load messages. Please try again.");
        toast.error("Failed to load messages. Please try again.");
      }
    };

    fetchMessagesAndJoinConversation();

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
      try {
        dispatch(setMessageSending(true));
        await userRecruiterSocketService.sendMessage(
          conversationId,
          newMessage,
          currentRecruiter.id
        );
        setNewMessage("");
      } catch (error) {
        setError("Failed to send message. Please try again.");
        toast.error("Failed to send message. Please try again.");
      } finally {
        dispatch(setMessageSending(false));
      }
    }
  };


  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      userRecruiterSocketService.emitTyping(
        conversationId,
        conversation?.participant.id || ""
      );
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      userRecruiterSocketService.emitStoppedTyping(
        conversationId,
        conversation?.participant.id || ""
      );
    }, 3000);
  };

  const handleMessageRead = (messageId: string) => {
    if (currentRecruiter) {
      userRecruiterSocketService.markMessageAsRead(messageId, conversationId);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return isValid(date) ? format(date, "HH:mm") : "Invalid Date";
  };

  const isParticipantTyping = Object.values(typingStatus).some(
    (status) => status
  );

  // const handleStartVideoCall = () => {
  //   setIsVideoCallActive(true);
  // };

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
    <div className="flex-1 flex flex-col h-full p-4">
      <ConversationHeader
        participantName={conversation?.participant.name || "Unknown"}
        isOnline={onlineStatus[conversation?.participant.id || ""] || false}
      >
        {/* <button
          onClick={handleStartVideoCall}
          className="ml-2 p-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-colors text-sm md:text-base"
        >
          <FontAwesomeIcon icon={faVideo} className="text-lg md:text-xl" />
        </button> */}
      </ConversationHeader>
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div
        ref={messageListRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message: Message) => (
          <div
            key={`${message.id}-${message.timestamp}`}
            className={`flex ${
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
              <div className="break-words">{message.content}</div>
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
            className="flex-1 border rounded-l-lg p-2 w-full text-sm md:text-base"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="bg-purple-500 text-white rounded-r-lg px-4 py-2 whitespace-nowrap text-sm md:text-base"
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
