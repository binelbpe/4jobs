import { io, Socket } from "socket.io-client";

import store from "../redux/store";

import { addMessage, setTypingStatus } from "../redux/slices/userMessageSlice"; // Add this import

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private connected: boolean = false;

  connect(userId: string) {
    console.log(`Attempting to connect to socket server for user: ${userId}`);
    this.userId = userId;

    if (this.socket && this.socket.connected) {
      console.log(
        "Socket already connected. Disconnecting before reconnecting."
      );
      this.socket.disconnect();
    }

    this.socket = io(
      process.env.REACT_APP_SOCKET_URL || "http://localhost:5000",
      {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        auth: { userId },
      }
    );

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log(
        `Socket connected for user ${this.userId}, socket id: ${this.socket?.id}`
      );
      this.connected = true;
    });

    this.socket.on("disconnect", (reason) => {
      console.log(
        `Socket disconnected for user ${this.userId}, reason: ${reason}`
      );
      this.connected = false;
    });

    this.socket.on("newMessage", (message: any) => {
      console.log("Received new message:", message);
      store.dispatch(addMessage(message));
    });

    this.socket.on(
      "userTyping",
      ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
        console.log("Received typing event:", userId, isTyping);
        store.dispatch(setTypingStatus({ userId, isTyping }));
      }
    );
  }

  sendMessage(message: any) {
    if (this.socket && this.connected) {
      this.socket.emit("sendMessage", message);
    } else {
      console.warn("Socket is not connected. Unable to send message.");
    }
  }

  emitTyping(recipientId: string, isTyping: boolean) {
    if (this.socket && this.connected) {
      console.log(
        "SocketService: Emitting typing event:",
        recipientId,
        isTyping
      );
      this.socket.emit("typing", { recipientId, isTyping });
    } else {
      console.warn(
        "SocketService: Socket is not connected. Unable to emit typing status."
      );
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  getConnectionStatus(): boolean {
    return this.connected;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connected = false;
  }

  markNotificationAsRead(notificationId: string) {
    if (this.socket && this.connected) {
      console.log(`Marking notification ${notificationId} as read`);
      this.socket.emit("markNotificationAsRead", notificationId);
    } else {
      console.warn(
        "Socket is not connected. Unable to mark notification as read."
      );
    }
  }
}

export const socketService = new SocketService();
