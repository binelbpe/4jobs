import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchUserConversationsApi,
  fetchUserMessagesApi,
  sendUserMessageApi,
} from "../../api/authapi";
import { URConversation, URMessage } from "../../types/userRecruiterMessage";

interface UserRecruiterMessageState {
  conversations: URConversation[];
  messages: { [conversationId: string]: URMessage[] };
  typingStatus: { [conversationId: string]: { [userId: string]: boolean } };
  loading: boolean;
  error: string | null;
  onlineStatus: { [userId: string]: boolean };
  currentUserId: string;
}

const initialState: UserRecruiterMessageState = {
  conversations: [],
  messages: {},
  typingStatus: {},
  loading: false,
  error: null,
  onlineStatus: {},
  currentUserId: "",
};

export const fetchUserRecruiterConversations = createAsyncThunk(
  "userRecruiterMessages/fetchConversations",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetchUserConversationsApi(userId);
      console.log("UR copnv festch  respo", response);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "An error occurred");
    }
  }
);

export const fetchUserRecruiterMessages = createAsyncThunk(
  "userRecruiterMessages/fetchMessages",
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response = await fetchUserMessagesApi(conversationId);
      console.log("UR fetchUserRecruiterMessages festch  respo", response);
      return { conversationId, messages: response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "An error occurred");
    }
  }
);

export const sendUserRecruiterMessage = createAsyncThunk(
  "userRecruiterMessages/sendMessage",
  async (
    {
      conversationId,
      content,
      senderId,
    }: { conversationId: string; content: string; senderId: string },
    { rejectWithValue }
  ) => {
    try {
      const message = await sendUserMessageApi(
        conversationId,
        content,
        senderId
      );
      console.log("UR sendUserRecruiterMessage festch  respo", message);
      return { conversationId, message };
    } catch (error: any) {
      return rejectWithValue(error.message || "An error occurred");
    }
  }
);

const userRecruiterMessageSlice = createSlice({
  name: "userRecruiterMessages",
  initialState,
  reducers: {
    addUserRecruiterMessage: (state, action: PayloadAction<URMessage>) => {
      const { conversationId } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push({
        ...action.payload,
        locallyRead: false, // Set locallyRead to false for new messages
      });

      // Increment unread count if the message is not from the current user
      const conversation = state.conversations.find(
        (c) => c.id === conversationId
      );
      if (conversation && action.payload.senderId !== state.currentUserId) {
        conversation.unreadCount = (conversation.unreadCount || 0) + 1;
      }
    },
    setUserRecruiterTypingStatus: (
      state,
      action: PayloadAction<{
        userId: string;
        conversationId: string;
        isTyping: boolean;
      }>
    ) => {
      const { userId, conversationId, isTyping } = action.payload;
      if (!state.typingStatus[conversationId]) {
        state.typingStatus[conversationId] = {};
      }
      state.typingStatus[conversationId][userId] = isTyping;
    },
    markUserRecruiterMessageAsRead: (
      state,
      action: PayloadAction<{ messageId: string; conversationId: string }>
    ) => {
      const { messageId, conversationId } = action.payload;
      const conversation = state.conversations.find(
        (c) => c.id === conversationId
      );
      if (conversation) {
        conversation.lastMessageRead = true;
        conversation.unreadCount = 0; // Reset unread count when marking as read
      }
      const message = state.messages[conversationId]?.find(
        (m) => m.id === messageId
      );
      if (message) {
        message.isRead = true;
        message.locallyRead = true;
      }
    },
    setUserOnlineStatus: (
      state,
      action: PayloadAction<{ userId: string; online: boolean }>
    ) => {
      const { userId, online } = action.payload;
      state.onlineStatus[userId] = online;
    },
    updateConversation: (
      state,
      action: PayloadAction<Partial<URConversation>>
    ) => {
      const index = state.conversations.findIndex(
        (c) => c.id === action.payload.id
      );
      if (index !== -1) {
        state.conversations[index] = {
          ...state.conversations[index],
          ...action.payload,
        };
      }
    },
    addNewConversation: (state, action: PayloadAction<URConversation>) => {
      state.conversations.push(action.payload);
    },
    incrementUnreadCount: (state, action: PayloadAction<string>) => {
      const conversation = state.conversations.find(
        (c) => c.id === action.payload
      );
      if (conversation) {
        conversation.unreadCount += 1;
      }
    },
    markAllMessagesAsLocallyRead: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      if (state.messages[conversationId]) {
        state.messages[conversationId] = state.messages[conversationId].map(
          (message) => ({
            ...message,
            locallyRead: true,
          })
        );
      }
      const conversation = state.conversations.find(
        (c) => c.id === conversationId
      );
      if (conversation) {
        conversation.unreadCount = 0;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserRecruiterConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserRecruiterConversations.fulfilled,
        (state, action: PayloadAction<URConversation[]>) => {
          state.loading = false;
          state.conversations = action.payload;
        }
      )
      .addCase(fetchUserRecruiterConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "An error occurred";
      })
      .addCase(fetchUserRecruiterMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserRecruiterMessages.fulfilled,
        (
          state,
          action: PayloadAction<{
            conversationId: string;
            messages: URMessage[];
          }>
        ) => {
          state.loading = false;
          state.messages[action.payload.conversationId] =
            action.payload.messages;
        }
      )
      .addCase(fetchUserRecruiterMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "An error occurred";
      })
      .addCase(sendUserRecruiterMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        sendUserRecruiterMessage.fulfilled,
        (
          state,
          action: PayloadAction<{ conversationId: string; message: URMessage }>
        ) => {
          state.loading = false;
          const { conversationId, message } = action.payload;
          if (!state.messages[conversationId]) {
            state.messages[conversationId] = [];
          }
          state.messages[conversationId].push(message);

          const conversationIndex = state.conversations.findIndex(
            (conv) => conv.id === conversationId
          );
          if (conversationIndex !== -1) {
            state.conversations[conversationIndex] = {
              ...state.conversations[conversationIndex],
              lastMessage: message.content,
              lastMessageTimestamp: message.timestamp,
            };
          }
        }
      )
      .addCase(sendUserRecruiterMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "An error occurred";
      });
  },
});

export const {
  addUserRecruiterMessage,
  setUserRecruiterTypingStatus,
  markUserRecruiterMessageAsRead,
  markAllMessagesAsLocallyRead,
  setUserOnlineStatus,
  updateConversation,
  addNewConversation,
  incrementUnreadCount,
} = userRecruiterMessageSlice.actions;

export default userRecruiterMessageSlice.reducer;
