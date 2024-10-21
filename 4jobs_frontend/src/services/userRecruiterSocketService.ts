import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import store from "../redux/store";
import {
  addUserRecruiterMessage,
  setUserRecruiterTypingStatus,
  markUserRecruiterMessageAsRead,
  setUserOnlineStatus,
  updateConversation,
  addNewConversation,
} from "../redux/slices/userRecruiterMessageSlice";
import {
  addRecruiterMessage,
  setRecruiterTypingStatus,
  markRecruiterMessageAsRead,
  setRecruiterOnlineStatus,
  updateRecruiterConversation,
  addNewRecruiterConversation,
} from "../redux/slices/recruiterMessageSlice";
import { URMessage } from "../types/userRecruiterMessage";
import { Message } from "../types/recruiterMessageType";

class UserRecruiterSocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private userType: "user" | "recruiter" | null = null;
  private connected: boolean = false;
  private onIncomingCallCallback:
    | ((callerId: string, offer: string) => void)
    | null = null;
  private onCallEndedCallback: (() => void) | null = null;
  private onlineStatusInterval: NodeJS.Timeout | null = null;

  connect(userId: string, userType: "user" | "recruiter") {
    this.userId = userId;
    this.userType = userType;

    if (this.socket && this.socket.connected) {
      this.socket.disconnect();
    }

    this.socket = io(
      process.env.REACT_APP_SOCKET_URL || "http://localhost:5000",
      {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        auth: { userId, userType },
      }
    );

    this.setupEventListeners();
    this.startOnlineStatusUpdates();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      this.connected = true;
    });

    this.socket.on("disconnect", (reason) => {
      this.connected = false;
    });

    this.socket.on("newUserRecruiterMessage", (message: URMessage | Message) => {
      if (this.userType === "user" && 'conversationId' in message) {
        store.dispatch(addUserRecruiterMessage(message as URMessage));
        store.dispatch(
          updateConversation({
            id: message.conversationId,
            lastMessage: message.content,
            lastMessageTimestamp: message.timestamp,
            lastMessageRead: false,
          })
        );
      } else if (this.userType === "recruiter" && 'conversationId' in message) {
        store.dispatch(addRecruiterMessage(message as Message));
        store.dispatch(
          updateRecruiterConversation({
            id: message.conversationId,
            lastMessage: message.content,
            lastMessageTimestamp: message.timestamp,
            lastMessageRead: false,
          })
        );
      }
    });

    this.socket.on(
      "userRecruiterTyping",
      ({
        senderId,
        conversationId,
      }: {
        senderId: string;
        conversationId: string;
      }) => {
        if (this.userType === "user") {
          store.dispatch(
            setUserRecruiterTypingStatus({
              userId: senderId,
              conversationId,
              isTyping: true,
            })
          );
        } else {
          store.dispatch(
            setRecruiterTypingStatus({ userId: senderId, conversationId, isTyping: true })
          );
        }
      }
    );

    this.socket.on(
      "userRecruiterStoppedTyping",
      ({
        senderId,
        conversationId,
      }: {
        senderId: string;
        conversationId: string;
      }) => {
        if (this.userType === "user") {
          store.dispatch(
            setUserRecruiterTypingStatus({
              userId: senderId,
              conversationId,
              isTyping: false,
            })
          );
        } else {
          store.dispatch(
            setRecruiterTypingStatus({
              userId: senderId,
              conversationId,
              isTyping: false,
            })
          );
        }
      }
    );

    this.socket.on(
      "userRecruiterMessageMarkedAsRead",
      ({
        messageId,
        conversationId,
      }: {
        messageId: string;
        conversationId: string;
      }) => {
        if (this.userType === "user") {
          store.dispatch(
            markUserRecruiterMessageAsRead({ messageId, conversationId })
          );
          store.dispatch(
            updateConversation({
              id: conversationId,
              lastMessageRead: true,
            })
          );
        } else {
          store.dispatch(
            markRecruiterMessageAsRead({ messageId, conversationId })
          );
          store.dispatch(
            updateRecruiterConversation({
              id: conversationId,
              lastMessageRead: true,
            })
          );
        }
      }
    );

    this.socket.on(
      "userOnlineStatus",
      ({ userId, online }: { userId: string; online: boolean }) => {
        if (this.userType === "user") {
          store.dispatch(setUserOnlineStatus({ userId, online }));
        } else {
          store.dispatch(setRecruiterOnlineStatus({ userId, online }));
        }
      }
    );

    this.socket.on("newRecruiterConversation", (conversation: any) => {
      if (this.userType === "user") {
        store.dispatch(addNewConversation(conversation));
      } else {
        store.dispatch(addNewRecruiterConversation(conversation));
      }
    });

    this.socket.on("initialOnlineStatus", (onlineUsers: string[]) => {
      if (this.userType === "user") {
        onlineUsers.forEach((userId) => {
          store.dispatch(setUserOnlineStatus({ userId, online: true }));
        });
      } else {
        onlineUsers.forEach((userId) => {
          store.dispatch(setRecruiterOnlineStatus({ userId, online: true }));
        });
      }
    });

    this.socket.on(
      "incomingCall",
      (data: { callerId: string; offer: string }) => {
        if (this.onIncomingCallCallback) {
          this.onIncomingCallCallback(data.callerId, data.offer);
        }
      }
    );

    this.socket.on("callEnded", () => {
      if (this.onCallEndedCallback) {
        this.onCallEndedCallback();
      }
    });

    this.socket?.on("onlineStatusUpdate", (onlineUsers: string[]) => {
      if (this.userType === "user") {
        store.dispatch(setUserOnlineStatus({ userId: this.userId!, online: true }));
        onlineUsers.forEach((userId) => {
          store.dispatch(setUserOnlineStatus({ userId, online: true }));
        });
      } else {
        store.dispatch(setRecruiterOnlineStatus({ userId: this.userId!, online: true }));
        onlineUsers.forEach((userId) => {
          store.dispatch(setRecruiterOnlineStatus({ userId, online: true }));
        });
      }
    });
  }

  private startOnlineStatusUpdates() {
    if (this.onlineStatusInterval) {
      clearInterval(this.onlineStatusInterval);
    }

    this.onlineStatusInterval = setInterval(() => {
      if (this.socket && this.connected) {
        this.socket.emit("requestOnlineStatus");
      }
    }, 30000);
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
        senderType: this.userType,
      };

      this.socket.emit("sendUserRecruiterMessage", message);

    }
  }

  emitTyping(conversationId: string, recipientId: string) {
    if (this.socket && this.connected) {
      this.socket.emit("userRecruiterTyping", {
        conversationId,
        senderId: this.userId,
        recipientId,
      });
    }
  }

  emitStoppedTyping(conversationId: string, recipientId: string) {
    if (this.socket && this.connected) {
      this.socket.emit("userRecruiterStoppedTyping", {
        conversationId,
        senderId: this.userId,
        recipientId,
      });
    }
  }

  markMessageAsRead(messageId: string, conversationId: string) {
    if (this.socket && this.connected) {
      this.socket.emit("markUserRecruiterMessageAsRead", {
        messageId,
        conversationId,
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connected = false;
    if (this.onlineStatusInterval) {
      clearInterval(this.onlineStatusInterval);
    }
  }

  onIncomingCall(callback: (callerId: string, offer: string) => void) {
    this.onIncomingCallCallback = callback;
  }

  offIncomingCall(callback: (callerId: string, offer: string) => void) {
    this.socket?.off("incomingCall", callback);
  }

  emitCallOffer(recipientId: string, offerBase64: string) {
    this.socket?.emit("callOffer", { recipientId, offer: offerBase64 });
  }

  emitCallAnswer(callerId: string, answerBase64: string) {
    this.socket?.emit("callAnswer", { callerId, answer: answerBase64 });
  }

  emitCallRejected(callerId: string) {
    this.socket?.emit("callRejected", { callerId });
  }

  onCallAnswer(callback: (answerBase64: string) => void) {
    this.socket?.on("callAnswer", callback);
  }

  onCallRejected(callback: () => void) {
    this.socket?.on("callRejected", callback);
  }

  emitEndCall(recipientId: string) {
    this.socket?.emit("endCall", { recipientId });
  }

  onCallEnded(callback: () => void) {
    this.onCallEndedCallback = callback;
  }
}

export const userRecruiterSocketService = new UserRecruiterSocketService();
