import { io, Socket } from "socket.io-client";

import store from "../redux/store";

import { addMessage, setTypingStatus } from "../redux/slices/userMessageSlice";

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private connected: boolean = false;

  connect(userId: string) {
    console.log(`Attempting to connect to socket server for user: ${userId}`);
    this.userId = userId;

    if (this.socket && this.socket.connected) {
      console.log("Socket already connected. Disconnecting before reconnecting.");
      this.socket.disconnect();
    }

    const socketUrl = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";
    console.log(`Connecting to socket server at: ${socketUrl}`);

    this.socket = io(socketUrl, {
      path: '/user-socket',
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: { userId, userType: 'user' },
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log(`Socket connected for user ${this.userId}, socket id: ${this.socket?.id}`);
      this.connected = true;
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.connected = false;
    });

    this.socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected for user ${this.userId}, reason: ${reason}`);
      this.connected = false;
    });

    this.socket.on("newMessage", (message: any) => {
      console.log("Received new message:", message);
      store.dispatch(addMessage(message));
    });

    this.socket.on("messageSent", (message: any) => {
      console.log("Message sent confirmation:", message);
      store.dispatch(addMessage(message));
    });

    this.socket.on("userTyping", ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      console.log("Received typing event:", userId, isTyping);
      store.dispatch(setTypingStatus({ userId, isTyping }));
    });

    this.socket.on("messageError", (error: any) => {
      console.error("Error sending message:", error);
    });
  }

  sendMessage(message: { senderId: string, recipientId: string, content: string }) {
    if (this.socket && this.connected) {
      console.log("SocketService: Emitting sendMessage event with data:", message);
      this.socket.emit("sendMessage", message, (response: any) => {
        if (response.error) {
          console.error("Error sending message:", response.error);
        } else {
          console.log("Message sent successfully:", response);
        }
      });
    } else {
      console.warn("SocketService: Socket is not connected. Unable to send message.");
    }
  }

  emitTyping(recipientId: string, isTyping: boolean) {
    if (this.socket && this.connected) {
      console.log("SocketService: Emitting typing event:", recipientId, isTyping);
      this.socket.emit("typing", { recipientId, isTyping });
    } else {
      console.warn("SocketService: Socket is not connected. Unable to emit typing status.");
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
      console.log("SocketService: Marking notification as read:", notificationId);
      this.socket.emit("markNotificationAsRead", notificationId);
    } else {
      console.warn("SocketService: Socket is not connected. Unable to mark notification as read.");
    }
  }
}

export const socketService = new SocketService();
