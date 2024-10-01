import { io, Socket } from 'socket.io-client';
import { Notification } from '../types/notification';

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;

  connect(userId: string) {
    console.log(`Attempting to connect to socket server for user: ${userId}`);
    this.userId = userId;
    
    if (this.socket && this.socket.connected) {
      console.log('Socket already connected. Disconnecting before reconnecting.');
      this.socket.disconnect();
    }

    this.socket = io('http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: { userId }
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log(`Socket connected for user ${this.userId}, socket id: ${this.socket?.id}`);
    });

    this.socket.on('authenticated', (userId) => {
      console.log(`Socket authenticated for user ${userId}`);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected for user ${this.userId}, reason: ${reason}`);
      if (reason === 'io server disconnect') {
        console.log('Attempting to reconnect...');
        this.socket?.connect();
      }
    });
  }

  disconnect() {
    console.log('Disconnecting from socket server');
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  markNotificationAsRead(notificationId: string) {
    if (this.socket) {
      console.log(`Marking notification ${notificationId} as read`);
      this.socket.emit('markNotificationAsRead', notificationId);
    } else {
      console.warn('Socket is not connected. Unable to mark notification as read.');
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      console.warn(`Socket is not connected. Unable to add listener for event: ${event}`);
    }
  }

  off(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    } else {
      console.warn(`Socket is not connected. Unable to remove listener for event: ${event}`);
    }
  }

  reconnect() {
    if (this.userId) {
      console.log(`Attempting to reconnect for user: ${this.userId}`);
      this.connect(this.userId);
    } else {
      console.warn('No user ID available for reconnection.');
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }

  getConnectionStatus() {
    return {
      isConnected: this.socket?.connected || false,
      socketId: this.socket?.id,
      userId: this.userId,
    };
  }
}

export const socketService = new SocketService();