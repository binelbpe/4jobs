import { io, Socket } from "socket.io-client";

import store from "../redux/store";

import { addMessage, setTypingStatus } from "../redux/slices/userMessageSlice";

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private connected: boolean = false;

  connect(userId: string) {

    this.userId = userId;

    if (this.socket && this.socket.connected) {
      this.socket.disconnect();
    }

    const socketUrl = process.env.REACT_APP_SOCKET_URL ;

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
      this.connected = true;
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.connected = false;
    });

    this.socket.on("disconnect", (reason) => {
      this.connected = false;
    });

    this.socket.on("newMessage", (message: any) => {
      store.dispatch(addMessage(message));
    });

    this.socket.on("messageSent", (message: any) => {
      store.dispatch(addMessage(message));
    });

    this.socket.on("userTyping", ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      store.dispatch(setTypingStatus({ userId, isTyping }));
    });

    this.socket.on("messageError", (error: any) => {
      console.error("Error sending message:", error);
    });
  }

  sendMessage(message: { senderId: string, recipientId: string, content: string }) {
    if (this.socket && this.connected) {
      this.socket.emit("sendMessage", message, (response: any) => {
        if (response.error) {
          console.error("Error sending message:", response.error);
        } else {
        }
      });
    } else {
      console.warn("SocketService: Socket is not connected. Unable to send message.");
    }
  }

  emitTyping(recipientId: string, isTyping: boolean) {
    if (this.socket && this.connected) {
      this.socket.emit("typing", { recipientId, isTyping });
    } else {
      console.warn("SocketService: Socket is not connected. Unable to emit typing status.");
    }
  }

  emit(event: string, data: any) {
    if (this.socket && this.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`SocketService: Cannot emit ${event}. Socket is not connected.`);
    }
  }

  on(event: string, callback: (...args: any[]) => void): () => void {
    if (this.socket) {
      this.socket.on(event, callback);
      return () => this.socket?.off(event, callback);
    }
    return () => {};
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
      this.socket.emit("markNotificationAsRead", notificationId);
    } else {
      console.warn("SocketService: Socket is not connected. Unable to mark notification as read.");
    }
  }

  emitUserCallOffer(recipientId: string, offer: string) {
    if (this.socket && this.connected) {
      console.log("Emitting call offer to:", recipientId);
      this.socket.emit("userCallOffer", { 
        recipientId, 
        offer,
        callerId: this.userId  // Add this to identify the caller
      });
    }
  }

  emitUserCallAnswer(callerId: string, answer: string) {
    if (this.socket && this.connected) {
      this.socket.emit("userCallAnswer", { callerId, answer });
    }
  }

  emitUserEndCall(recipientId: string) {
    if (this.socket && this.connected) {
      this.socket.emit("userEndCall", { recipientId });
    }
  }

  onIncomingCall(callback: (data: { callerId: string, offer: string }) => void): () => void {
    if (this.socket) {
      this.socket.on("incomingCall", callback);
      return () => this.socket?.off("incomingCall", callback);
    }
    return () => {};
  }

  emitCallAnswer(callerId: string, answer: string) {
    if (this.socket && this.connected) {
      this.socket.emit("callAnswer", { callerId, answer });
    }
  }

  onCallRejected(callback: () => void): () => void {
    if (this.socket) {
      this.socket.on("callRejected", callback);
      return () => this.socket?.off("callRejected", callback);
    }
    return () => {};
  }

  emitIceCandidate(recipientId: string, candidate: RTCIceCandidate) {
    if (this.socket && this.connected) {
      this.socket.emit("iceCandidate", { recipientId, candidate });
    }
  }

  onIceCandidate(callback: (data: { candidate: RTCIceCandidate }) => void): () => void {
    if (this.socket) {
      this.socket.on("iceCandidate", callback);
      return () => this.socket?.off("iceCandidate", callback);
    }
    return () => {};
  }

  emitCallAccepted(callerId: string) {
    if (this.socket && this.connected) {
      console.log("Emitting call accepted to:", callerId);
      this.socket.emit("callAccepted", { 
        callerId,
        accepterId: this.userId  // Add this to identify who accepted
      });
    }
  }

  onCallAccepted(callback: () => void): () => void {
    if (this.socket) {
      this.socket.on("callAccepted", (data) => {
        console.log("Call accepted event received", data);
        callback();
      });
      return () => this.socket?.off("callAccepted", callback);
    }
    return () => {};
  }
}

export const socketService = new SocketService();
