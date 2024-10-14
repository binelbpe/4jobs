import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { socketService } from "../services/socketService";
import { RootState } from "../redux/store";
import { addMessage, setTypingStatus } from "../redux/slices/userMessageSlice";

const useSocket = (recipientId: string) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (currentUser?.id) {
      console.log("Setting up socket connection for user:", currentUser.id);
      if (!socketService.getConnectionStatus()) {
        socketService.connect(currentUser.id);
      }

      const handleNewMessage = (message: any) => {
        console.log("Received new message:", message);
        dispatch(addMessage(message));
      };

      const handleUserTyping = (data: {
        userId: string;
        isTyping: boolean;
      }) => {
        console.log("Received typing event in useSocket:", data);
        dispatch(setTypingStatus(data));
      };

      socketService.on("newMessage", handleNewMessage);
      socketService.on("userTyping", handleUserTyping);

      return () => {
        socketService.off("newMessage", handleNewMessage);
        socketService.off("userTyping", handleUserTyping);
      };
    }
  }, [currentUser?.id, dispatch]);

  const sendMessage = useCallback((message: any) => {
    console.log("Sending message:", message);
    socketService.sendMessage(message);
  }, []);

  const emitTyping = useCallback(
    (isTyping: boolean) => {
      if (currentUser) {
        console.log(
          "Emitting typing event in useSocket:",
          currentUser.id,
          recipientId,
          isTyping
        );
        socketService.emitTyping(recipientId, isTyping);
      }
    },
    [currentUser, recipientId]
  );

  return { sendMessage, emitTyping };
};

export default useSocket;

// Add this line at the end of the file to make it a module
export {};
