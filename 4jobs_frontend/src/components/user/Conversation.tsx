import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import {
  fetchConversation,
  markMessagesAsRead,
  updateUnreadCount,
} from "../../redux/slices/userMessageSlice";
import { updateTotalUnreadCount } from "../../redux/slices/userRecruiterMessageSlice";
import { Message } from "../../types/messageType";
import useSocket from "../../hooks/useSocket";
import debounce from "lodash/debounce";

interface ConversationProps {
  userId: string;
}

const Conversation: React.FC<ConversationProps> = ({ userId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const conversationId =
    currentUser &&
    (currentUser.id < userId
      ? `${currentUser.id}-${userId}`
      : `${userId}-${currentUser.id}`);
  const messages = useSelector(
    (state: RootState) =>
      state.messages.conversations[conversationId || ""] || []
  );
  const connection = useSelector((state: RootState) =>
    state.messages.connections.find((conn) => conn.user.id === userId)
  );
  const isTyping = useSelector((state: RootState) => {
    const typingStatus =
      state.messages.connections.find((conn) => conn.user.id === userId)
        ?.isTyping || false;
    console.log("Typing status for user", userId, ":", typingStatus);
    return typingStatus;
  });
  const isOnline = connection?.isOnline || false;
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    sendMessage: sendSocketMessage,
    emitTyping,
    isConnected,
  } = useSocket(userId);
  const [hasFetchedConversation, setHasFetchedConversation] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchConversationData = useCallback(() => {
    if (
      currentUser &&
      conversationId &&
      !hasFetchedConversation &&
      messages.length === 0
    ) {
      dispatch(fetchConversation({ userId1: currentUser.id, userId2: userId }));
      setHasFetchedConversation(true);
    }
  }, [
    currentUser,
    conversationId,
    dispatch,
    userId,
    hasFetchedConversation,
    messages.length,
  ]);

  useEffect(() => {
    fetchConversationData();
  }, [fetchConversationData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const unreadMessages = messages.filter(
      (message: Message) =>
        message.sender.id === userId &&
        !message.isRead &&
        message.status !== "read"
    );
    if (unreadMessages.length > 0) {
      dispatch(
        markMessagesAsRead({
          messageIds: unreadMessages.map((m: Message) => m.id),
        })
      );
      dispatch(
        updateUnreadCount(messages.filter((m: Message) => !m.isRead).length)
      );
      dispatch(updateTotalUnreadCount());
    }
  }, [dispatch, messages, userId]);

  const handleSendMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (newMessage.trim() && currentUser) {
        const messageData = {
          senderId: currentUser.id,
          recipientId: userId,
          content: newMessage,
        };

        if (isConnected) {
          console.log("Attempting to send message:", messageData);
          sendSocketMessage(messageData);
          setNewMessage("");
        } else {
          console.error("Cannot send message: Socket is not connected");
          // Show an error message to the user
        }
      }
    },
    [
      newMessage,
      currentUser,
      userId,
      sendSocketMessage,
      isConnected,
      setNewMessage,
    ]
  );

  const debouncedEmitTyping = useCallback(
    debounce((isTyping: boolean) => {
      console.log("Emitting typing status:", isTyping);
      emitTyping(isTyping);
    }, 300),
    [emitTyping]
  );

  const handleTyping = useCallback(() => {
    if (currentUser) {
      console.log("Handling typing event");
      debouncedEmitTyping(true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        console.log("Typing timeout, emitting false");
        debouncedEmitTyping(false);
      }, 3000);
    }
  }, [currentUser, debouncedEmitTyping]);

  useEffect(() => {
    console.log("isTyping changed:", isTyping);
  }, [isTyping]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-300">
        <h2 className="text-xl font-semibold text-purple-700">
          {connection?.user.name || "Chat"}
        </h2>
        <div className="flex items-center text-sm text-gray-500">
          {isOnline && (
            <span className="mr-2 w-2 h-2 bg-green-500 rounded-full inline-block"></span>
          )}
          <span>{isOnline ? "Online" : "Offline"}</span>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((message: Message, index: number) => (
          <div
            key={`${message.id}-${index}`}
            className={`mb-4 ${
              message.sender.id === currentUser?.id ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block p-2 rounded-lg ${
                message.sender.id === currentUser?.id
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {message.content}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(message.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {isTyping && (
        <div className="p-2 text-sm text-gray-500 italic">
          {connection?.user.name} is typing...
        </div>
      )}
      {!isConnected && (
        <div className="p-2 text-sm text-red-500">
          Not connected to the server. Messages may not be sent or received.
        </div>
      )}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-gray-300"
      >
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="bg-purple-600 text-white p-2 rounded-r hover:bg-purple-700 transition duration-300"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Conversation;
