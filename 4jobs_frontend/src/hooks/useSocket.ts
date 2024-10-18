import { useEffect, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { socketService } from "../services/socketService";
import { RootState } from "../redux/store";
import {
  addMessage,
  setTypingStatus,
  updateUnreadCount,
} from "../redux/slices/userMessageSlice";
import {
  addUserRecruiterMessage,
  updateTotalUnreadCount,
} from "../redux/slices/userRecruiterMessageSlice";
import { createSocketListener } from "../utils/socketUtils";

export const useSocket = (recipientId: string) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      console.log("Setting up socket connection for user:", currentUser.id);
      socketService.connect(currentUser.id);

      const handleConnect = () => {
        console.log("Socket connected successfully");
        setIsConnected(true);
      };

      const handleDisconnect = (reason: string) => {
        console.log("Socket disconnected:", reason);
        setIsConnected(false);
      };

      const handleNewMessage = (message: any) => {
        console.log("Received new message:", message);
        if (message.isRecruiterMessage) {
          dispatch(addUserRecruiterMessage(message));
          dispatch(updateTotalUnreadCount());
        } else {
          dispatch(addMessage(message));
          dispatch(updateUnreadCount(message.unreadCount));
        }
      };

      const handleUserTyping = (data: {
        userId: string;
        isTyping: boolean;
      }) => {
        console.log("Received typing event in useSocket:", data);
        dispatch(setTypingStatus(data));
      };

      const removeConnectListener = createSocketListener(
        "connect",
        handleConnect
      );
      const removeDisconnectListener = createSocketListener(
        "disconnect",
        handleDisconnect
      );
      const removeNewMessageListener = createSocketListener(
        "newMessage",
        handleNewMessage
      );
      const removeUserTypingListener = createSocketListener(
        "userTyping",
        handleUserTyping
      );

      return () => {
        console.log("Cleaning up socket connection");
        removeConnectListener();
        removeDisconnectListener();
        removeNewMessageListener();
        removeUserTypingListener();
        socketService.disconnect();
      };
    }
  }, [currentUser?.id, dispatch]);

  const sendMessage = useCallback(
    (message: { senderId: string; recipientId: string; content: string }) => {
      console.log("Attempting to send message:", message);
      if (isConnected) {
        socketService.sendMessage(message);
      } else {
        console.error("Cannot send message: Socket is not connected");
        // Implement retry logic or show an error to the user
      }
    },
    [isConnected]
  );

  const emitTyping = useCallback(
    (isTyping: boolean) => {
      if (currentUser && isConnected) {
        console.log(
          "Emitting typing event:",
          currentUser.id,
          recipientId,
          isTyping
        );
        socketService.emitTyping(recipientId, isTyping);
      } else if (!isConnected) {
        console.error("Cannot emit typing: Socket is not connected");
      }
    },
    [currentUser, recipientId, isConnected]
  );

  return { sendMessage, emitTyping, isConnected };
};

export default useSocket;

export {};
