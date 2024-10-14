import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from 'uuid';
import store from "../redux/store";
import { 
  addUserRecruiterMessage, 
  setUserRecruiterTypingStatus, 
  markUserRecruiterMessageAsRead, 
  setUserOnlineStatus,
  updateConversation,
  addNewConversation
} from "../redux/slices/userRecruiterMessageSlice";
import {
  addRecruiterMessage,
  setRecruiterTypingStatus,
  markRecruiterMessageAsRead,
  setRecruiterOnlineStatus,
  updateRecruiterConversation,
  addNewRecruiterConversation
} from "../redux/slices/recruiterMessageSlice";
import { URMessage } from "../types/userRecruiterMessage";
import { Message } from "../types/recruiterMessageType";

class UserRecruiterSocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private userType: 'user' | 'recruiter' | null = null;
  private connected: boolean = false;

  connect(userId: string, userType: 'user' | 'recruiter') {
    console.log(`Attempting to connect to socket server for ${userType}: ${userId}`);
    this.userId = userId;
    this.userType = userType;

    if (this.socket && this.socket.connected) {
      console.log("Socket already connected. Disconnecting before reconnecting.");
      this.socket.disconnect();
    }

    this.socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:5000", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: { userId, userType },
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log(`Socket connected for ${this.userType} ${this.userId}, socket id: ${this.socket?.id}`);
      this.connected = true;
    });

    this.socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected for ${this.userType} ${this.userId}, reason: ${reason}`);
      this.connected = false;
    });

    this.socket.on("newUserRecruiterMessage", (message: any) => {
      console.log("Received new user-recruiter message:", message);
      if (this.userType === 'user') {
        store.dispatch(addUserRecruiterMessage(message));
        store.dispatch(updateConversation({
          id: message.conversationId,
          lastMessage: message.content,
          lastMessageTimestamp: message.timestamp,
          lastMessageRead: false
        }));
      } else {
        store.dispatch(addRecruiterMessage(message));
        store.dispatch(updateRecruiterConversation({
          id: message.conversationId,
          lastMessage: message.content,
          lastMessageTimestamp: message.timestamp,
          lastMessageRead: false
        }));
      }
    });

    this.socket.on("userRecruiterTyping", ({ userId, conversationId }: { userId: string, conversationId: string }) => {
      console.log("Received typing event:", userId, conversationId);
      if (this.userType === 'user') {
        store.dispatch(setUserRecruiterTypingStatus({ userId, conversationId, isTyping: true }));
      } else {
        store.dispatch(setRecruiterTypingStatus({ userId, conversationId, isTyping: true }));
      }
    });

    this.socket.on("userRecruiterStoppedTyping", ({ userId, conversationId }: { userId: string, conversationId: string }) => {
      console.log("Received stopped typing event:", userId, conversationId);
      if (this.userType === 'user') {
        store.dispatch(setUserRecruiterTypingStatus({ userId, conversationId, isTyping: false }));
      } else {
        store.dispatch(setRecruiterTypingStatus({ userId, conversationId, isTyping: false }));
      }
    });

    this.socket.on("userRecruiterMessageMarkedAsRead", ({ messageId, conversationId }: { messageId: string, conversationId: string }) => {
      console.log("Message marked as read:", messageId);
      if (this.userType === 'user') {
        store.dispatch(markUserRecruiterMessageAsRead({ messageId, conversationId }));
        store.dispatch(updateConversation({
          id: conversationId,
          lastMessageRead: true
        }));
      } else {
        store.dispatch(markRecruiterMessageAsRead({ messageId, conversationId }));
        store.dispatch(updateRecruiterConversation({
          id: conversationId,
          lastMessageRead: true
        }));
      }
    });

    this.socket.on("userOnlineStatus", ({ userId, online }: { userId: string, online: boolean }) => {
      console.log(`User ${userId} is ${online ? 'online' : 'offline'}`);
      if (this.userType === 'user') {
        store.dispatch(setUserOnlineStatus({ userId, online }));
      } else {
        store.dispatch(setRecruiterOnlineStatus({ userId, online }));
      }
    });

    this.socket.on("newRecruiterConversation", (conversation: any) => {
      console.log("Received new recruiter conversation:", conversation);
      if (this.userType === 'user') {
        store.dispatch(addNewConversation(conversation));
      } else {
        store.dispatch(addNewRecruiterConversation(conversation));
      }
    });

    this.socket.on("initialOnlineStatus", (onlineUsers: string[]) => {
      console.log("Received initial online status:", onlineUsers);
      if (this.userType === 'user') {
        onlineUsers.forEach(userId => {
          store.dispatch(setUserOnlineStatus({ userId, online: true }));
        });
      } else {
        onlineUsers.forEach(userId => {
          store.dispatch(setRecruiterOnlineStatus({ userId, online: true }));
        });
      }
    });
  }

  joinConversation(conversationId: string) {
    if (this.socket && this.connected) {
      this.socket.emit("joinUserRecruiterConversation", conversationId);
    }
  }

  leaveConversation(conversationId: string) {
    if (this.socket && this.connected) {
      this.socket.emit("leaveUserRecruiterConversation", conversationId);
    }
  }

  sendMessage(conversationId: string, content: string, senderId: string) {
    if (this.socket && this.connected) {
      const now = new Date().toISOString();
      const message = {
        id: uuidv4(),
        conversationId,
        content,
        senderId,
        timestamp: now,
        isRead: false,
        senderType: this.userType
      };
      
      console.log("Sending message:", message);
      this.socket.emit("sendUserRecruiterMessage", message);

      // Optimistically update the local state
      if (this.userType === 'user') {
        store.dispatch(addUserRecruiterMessage(message as URMessage));
        store.dispatch(updateConversation({
          id: conversationId,
          lastMessage: content,
          lastMessageTimestamp: now,
          lastMessageRead: false
        }));
      } else {
        store.dispatch(addRecruiterMessage(message as unknown as Message));
        store.dispatch(updateRecruiterConversation({
          id: conversationId,
          lastMessage: content,
          lastMessageTimestamp: now,
          lastMessageRead: false
        }));
      }
    }
  }

  emitTyping(conversationId: string) {
    if (this.socket && this.connected) {
      this.socket.emit("userRecruiterTyping", { conversationId, userId: this.userId });
    }
  }

  emitStoppedTyping(conversationId: string) {
    if (this.socket && this.connected) {
      this.socket.emit("userRecruiterStoppedTyping", { conversationId, userId: this.userId });
    }
  }

  markMessageAsRead(messageId: string, conversationId: string) {
    if (this.socket && this.connected) {
      this.socket.emit("markUserRecruiterMessageAsRead", { messageId, conversationId });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connected = false;
  }
}

export const userRecruiterSocketService = new UserRecruiterSocketService();
