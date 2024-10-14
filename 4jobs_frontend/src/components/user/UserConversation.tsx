import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { fetchUserRecruiterMessages } from "../../redux/slices/userRecruiterMessageSlice";
import { URMessage } from "../../types/userRecruiterMessage";
import { userRecruiterSocketService } from "../../services/userRecruiterSocketService";
import { format, isValid, parseISO } from "date-fns";
import ConversationHeader from "../shared/ConversationHeader";

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
      userRecruiterSocketService.sendMessage(
        conversationId,
        newMessage,
        currentUser.id
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

  return (
    <div className="flex flex-col h-full">
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
            key={message.id}
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
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserConversation;
