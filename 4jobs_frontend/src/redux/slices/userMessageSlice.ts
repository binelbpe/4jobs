import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Message, User } from "../../types/messageType"; // Updated import path
import {
  getConversationApi,
  markMessageAsReadApi,
  getUnreadMessageCountApi,
  fetchConnectionsMessageApi,
} from "../../api/authapi";

interface MessageState {
  connections: {
    user: User;
    lastMessage: Message;
    isOnline: boolean;
    isTyping: boolean;
  }[];
  conversations: { [key: string]: Message[] };
  unreadCount: number;
  loading: boolean;
  error: string | null;
  currentUserId: string | null;
}

const initialState: MessageState = {
  connections: [],
  conversations: {},
  unreadCount: 0,
  loading: false,
  error: null,
  currentUserId: null,
};

export const fetchMessageConnections = createAsyncThunk<
  { user: User; lastMessage: Message; isOnline: boolean }[],
  string
>("messages/fetchConnections", async (userId: string) => {
  const response = await fetchConnectionsMessageApi(userId);
  return response;
});

export const fetchConversation = createAsyncThunk(
  "messages/fetchConversation",
  async ({ userId1, userId2 }: { userId1: string; userId2: string }) => {
    const response = await getConversationApi(userId1, userId2);
    const conversationId =
      userId1 < userId2 ? `${userId1}-${userId2}` : `${userId2}-${userId1}`;
    return { conversationId, messages: response };
  }
);

// export const userSendMessage = createAsyncThunk(
//   "messages/sendMessage",
//   async ({
//     senderId,
//     recipientId,
//     content,
//   }: {
//     senderId: string;
//     recipientId: string;
//     content: string;
//   }) => {
//     const response = await sendMessageApi(senderId, recipientId, content);
//     return response;
//   }
// );

export const markMessagesAsRead = createAsyncThunk(
  "messages/markAsRead",
  async ({ messageIds }: { messageIds: string[] }) => {
    await Promise.all(messageIds.map((id) => markMessageAsReadApi(id)));
    return messageIds;
  }
);

export const getUnreadMessageCount = createAsyncThunk(
  "messages/getUnreadCount",
  async (userId: string) => {
    const response = await getUnreadMessageCountApi(userId);
    return response;
  }
);

const userMessageSlice = createSlice({
  name: "useMessages",
  initialState,
  reducers: {
    resetUnreadCount: (state) => {
      state.unreadCount = 0;
    },
    updateMessageStatus: (
      state,
      action: PayloadAction<{
        messageId: string;
        status: "sent" | "delivered" | "read";
      }>
    ) => {
      const { messageId, status } = action.payload;
      Object.values(state.conversations).forEach((conversation) => {
        const message = conversation.find((m: Message) => m.id === messageId); // Added type annotation
        if (message) {
          message.status = status;
        }
      });
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const { sender, recipient } = action.payload;
      const conversationId =
        sender.id < recipient.id
          ? `${sender.id}-${recipient.id}`
          : `${recipient.id}-${sender.id}`;
      if (!state.conversations[conversationId]) {
        state.conversations[conversationId] = [];
      }
      const messageExists = state.conversations[conversationId].some(
        (msg) => msg.id === action.payload.id
      );
      if (!messageExists) {
        state.conversations[conversationId].push(action.payload);
        const connectionIndex = state.connections.findIndex(
          (conn) =>
            conn.user.id ===
            (sender.id === state.currentUserId ? recipient.id : sender.id)
        );
        if (connectionIndex !== -1) {
          state.connections[connectionIndex].lastMessage = action.payload;
          const [updatedConnection] = state.connections.splice(
            connectionIndex,
            1
          );
          state.connections.unshift(updatedConnection);
        }
      }
    },
    setTypingStatus: (
      state,
      action: PayloadAction<{ userId: string; isTyping: boolean }>
    ) => {
      const connectionIndex = state.connections.findIndex(
        (conn) => conn.user.id === action.payload.userId
      );
      if (connectionIndex !== -1) {
        state.connections[connectionIndex].isTyping =
          action.payload.isTyping ?? false;
      }
    },
    setCurrentUserId: (state, action: PayloadAction<string>) => {
      state.currentUserId = action.payload;
    },
    updateUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessageConnections.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchMessageConnections.fulfilled,
        (
          state,
          action: PayloadAction<
            { user: User; lastMessage: Message; isOnline: boolean }[]
          >
        ) => {
          state.loading = false;
          state.connections = action.payload.map((conn) => ({
            ...conn,
            isTyping: false,
          }));
        }
      )
      .addCase(fetchMessageConnections.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch message connections";
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload;
        state.conversations[conversationId] = messages;
      })
      // .addCase(userSendMessage.fulfilled, (state, action) => {
      //   const { sender, recipient } = action.payload;
      //   const conversationId = sender.id < recipient.id ? `${sender.id}-${recipient.id}` : `${recipient.id}-${sender.id}`;
      //   if (!state.conversations[conversationId]) {
      //     state.conversations[conversationId] = [];
      //   }
      //   state.conversations[conversationId].push(action.payload);

      //   // Update the connections list with the new message
      //   const connectionIndex = state.connections.findIndex(conn => conn.user.id === recipient.id);
      //   if (connectionIndex !== -1) {
      //     state.connections[connectionIndex].lastMessage = action.payload;
      //     // Move this connection to the top of the list
      //     const [updatedConnection] = state.connections.splice(connectionIndex, 1);
      //     state.connections.unshift(updatedConnection);
      //   }
      // })
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const messageIds = action.payload;
        Object.values(state.conversations).forEach((conversation) => {
          conversation.forEach((message: Message) => {
            // Added type annotation
            if (messageIds.includes(message.id)) {
              message.isRead = true;
            }
          });
        });
      })
      .addCase(getUnreadMessageCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });
  },
});

// Export the actions
export const {
  resetUnreadCount,
  updateMessageStatus,
  addMessage,
  setTypingStatus,
  setCurrentUserId,
  updateUnreadCount,
} = userMessageSlice.actions;

export const selectUnreadCount = (state: RootState) =>
  state.messages.unreadCount;

export default userMessageSlice.reducer;
