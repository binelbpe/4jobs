import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { Container } from "inversify";
import { EventEmitter } from "events";
import { UserManager } from "./UserManager";
import { socketAuthMiddleware } from "../../presentation/middlewares/socketAuthMiddleware";
import { MessageUseCase } from "../../application/usecases/user/MessageUseCase";
import TYPES from "../../types";

export function setupUserSocketServer(
  server: HTTPServer,
  container: Container
) {
  const io = new SocketIOServer(server, {
    path: "/user-socket",
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
    },
  });

  const userManager = container.get<UserManager>(TYPES.UserManager);
  const eventEmitter = container.get<EventEmitter>(
    TYPES.NotificationEventEmitter
  );
  const messageUseCase = container.get<MessageUseCase>(TYPES.MessageUseCase);

  io.use(socketAuthMiddleware(userManager));

  io.on("connection", (socket: Socket & { userId?: string }) => {
    console.log(
      `A user connected, socket id: ${socket.id}, user id: ${socket.userId}`
    );

    if (!socket.userId) {
      console.error("User not authenticated, closing connection");
      socket.disconnect(true);
      return;
    }

    userManager.addUser(socket.userId, socket.id, "user");
    socket.join(socket.userId);
    io.emit("userOnlineStatus", { userId: socket.userId, online: true });

    socket.on(
      "sendMessage",
      async (data: {
        senderId: string;
        recipientId: string;
        content: string;
      }) => {
        console.log("Received sendMessage event:", data);
        try {
          if (!socket.userId) {
            throw new Error("User not authenticated");
          }

          const message = await messageUseCase.sendMessage(
            data.senderId,
            data.recipientId,
            data.content
          );
          console.log("Message saved:", message);

          // Emit to sender
          socket.emit("messageSent", message);
          console.log("Emitted messageSent to sender");

          // Emit to recipient
          const recipientSocket = userManager.getUserSocketId(data.recipientId);
          if (recipientSocket) {
            io.to(recipientSocket).emit("newMessage", message);
            console.log("Emitted newMessage to recipient");
          } else {
            console.log(
              "Recipient not online, message will be delivered later"
            );
          }

          eventEmitter.emit("sendNotification", {
            type: "NEW_MESSAGE",
            recipient: data.recipientId,
            sender: data.senderId,
            content: "You have a new message",
          });
          console.log("Emitted sendNotification event");
        } catch (error) {
          console.error("Error sending message:", error);
          socket.emit("messageError", { error: "Failed to send message" });
        }
      }
    );

    socket.on("typing", (data: { recipientId: string; isTyping: boolean }) => {
      const recipientSocket = userManager.getUserSocketId(data.recipientId);
      if (recipientSocket) {
        io.to(recipientSocket).emit("userTyping", {
          userId: socket.userId,
          isTyping: data.isTyping,
        });
      }
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        userManager.removeUser(socket.userId);
        io.emit("userOnlineStatus", { userId: socket.userId, online: false });
      }
    });
  });

  return { io, userManager, eventEmitter };
}
