import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchConversationsApi,
  fetchMessagesApi,
  sendMessageApi,
} from "../../api/recruiterApi";
import { Conversation, Message } from "../../types/recruiterMessageType";

interface MessageState {
  RecruiterConversations: Conversation[];
  RecruiterMessages: { [conversationId: string]: Message[] };
  typingStatus: { [conversationId: string]: { [userId: string]: boolean } };
  onlineStatus: { [userId: string]: boolean };
  recruiterLoading: boolean;
  recruiterError: string | null;
  currentRecruiterId: string | null;
  messageSending: boolean;
}

const initialState: MessageState = {
  RecruiterConversations: [],
  RecruiterMessages: {},
  typingStatus: {},
  onlineStatus: {},
  recruiterLoading: false,
  recruiterError: null,
  currentRecruiterId: null,
  messageSending: false,
};

export const fetchConversations = createAsyncThunk(
  "messages/fetchConversations",
  async (recruiterId: string, { rejectWithValue }) => {
    try {
      const response = await fetchConversationsApi(recruiterId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "An error occurred");
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response = await fetchMessagesApi(conversationId);
      return { conversationId, messages: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "An error occurred");
    }
  }
);

export const recruiterSendMessage = createAsyncThunk(
  "messages/sendMessage",
  async (
    { conversationId, content }: { conversationId: string; content: string },
    { rejectWithValue }
  ) => {
    try {
      const message = await sendMessageApi(conversationId, content);
      if (!message || typeof message !== "object" || !("id" in message)) {
        throw new Error("Invalid message structure received from API");
      }
      return { conversationId, message };
    } catch (error: any) {
      console.error("Error in sendMessage thunk:", error);
      return rejectWithValue(error.message || "An error occurred");
    }
  }
);

const RecruitermessageSlice = createSlice({
  name: "RecruiterMessages",
  initialState,
  reducers: {
    addRecruiterMessage: (state, action: PayloadAction<Message>) => {
      const { conversationId, id } = action.payload;
      if (!state.RecruiterMessages[conversationId]) {
        state.RecruiterMessages[conversationId] = [];
      }
      // Check if message with the same id already exists
      if (!state.RecruiterMessages[conversationId].some(msg => msg.id === id)) {
        state.RecruiterMessages[conversationId].push(action.payload);
      }

      // Increment unread count if the message is not from the current recruiter
      const conversation = state.RecruiterConversations.find(
        (c) => c.id === conversationId
      );
      if (
        conversation &&
        action.payload.senderId !== state.currentRecruiterId
      ) {
        conversation.unreadCount = (conversation.unreadCount || 0) + 1;
      }
    },
    setRecruiterTypingStatus: (
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
    markRecruiterMessageAsRead: (
      state,
      action: PayloadAction<{ messageId: string; conversationId: string }>
    ) => {
      const { messageId, conversationId } = action.payload;
      const conversation = state.RecruiterConversations.find(
        (c) => c.id === conversationId
      );
      if (conversation) {
        conversation.lastMessageRead = true;
        conversation.unreadCount = 0; // Reset unread count when marking as read
      }
      const message = state.RecruiterMessages[conversationId]?.find(
        (m) => m.id === messageId
      );
      if (message) {
        message.isRead = true;
        message.locallyRead = true;
      }
    },
    setRecruiterOnlineStatus: (
      state,
      action: PayloadAction<{ userId: string; online: boolean }>
    ) => {
      const { userId, online } = action.payload;
      state.onlineStatus[userId] = online;
    },
    updateRecruiterConversation: (
      state,
      action: PayloadAction<Partial<Conversation>>
    ) => {
      const index = state.RecruiterConversations.findIndex(
        (c) => c.id === action.payload.id
      );
      if (index !== -1) {
        state.RecruiterConversations[index] = {
          ...state.RecruiterConversations[index],
          ...action.payload,
        };
      }
    },
    addNewRecruiterConversation: (
      state,
      action: PayloadAction<Conversation>
    ) => {
      state.RecruiterConversations.push(action.payload);
    },
    markAllMessagesAsLocallyRead: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      if (state.RecruiterMessages[conversationId]) {
        state.RecruiterMessages[conversationId] = state.RecruiterMessages[
          conversationId
        ].map((message) => ({
          ...message,
          locallyRead: true,
        }));
      }
      const conversation = state.RecruiterConversations.find(
        (c) => c.id === conversationId
      );
      if (conversation) {
        conversation.unreadCount = 0;
      }
    },
    setCurrentRecruiterId: (state, action: PayloadAction<string>) => {
      state.currentRecruiterId = action.payload;
    },
    setMessageSending: (state, action: PayloadAction<boolean>) => {
      state.messageSending = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.recruiterLoading = true;
        state.recruiterError = null;
      })
      .addCase(
        fetchConversations.fulfilled,
        (state, action: PayloadAction<Conversation[]>) => {
          state.recruiterLoading = false;
          state.RecruiterConversations = action.payload;
        }
      )
      .addCase(fetchConversations.rejected, (state, action) => {
        state.recruiterLoading = false;
        state.recruiterError =
          (action.payload as string) || "An error occurred";
      })
      .addCase(fetchMessages.pending, (state) => {
        state.recruiterLoading = true;
        state.recruiterError = null;
      })
      .addCase(
        fetchMessages.fulfilled,
        (
          state,
          action: PayloadAction<{ conversationId: string; messages: Message[] }>
        ) => {
          state.recruiterLoading = false;
          state.RecruiterMessages[action.payload.conversationId] =
            action.payload.messages || [];
        }
      )
      .addCase(fetchMessages.rejected, (state, action) => {
        state.recruiterLoading = false;
        state.recruiterError =
          (action.payload as string) || "An error occurred";
      })
      .addCase(recruiterSendMessage.pending, (state) => {
        state.recruiterLoading = true;
        state.recruiterError = null;
      })
      .addCase(
        recruiterSendMessage.fulfilled,
        (
          state,
          action: PayloadAction<{ conversationId: string; message: Message }>
        ) => {
          state.recruiterLoading = false;
          const { conversationId, message } = action.payload;
          if (!state.RecruiterMessages[conversationId]) {
            state.RecruiterMessages[conversationId] = [];
          }
          // Only add the message if it doesn't already exist
          if (
            !state.RecruiterMessages[conversationId].some(
              (m) => m.id === message.id
            )
          ) {
            state.RecruiterMessages[conversationId] = [
              ...state.RecruiterMessages[conversationId],
              message,
            ];
          }

          // Update the last message in the conversation list
          const conversationIndex = state.RecruiterConversations.findIndex(
            (conv) => conv.id === conversationId
          );
          if (conversationIndex !== -1) {
            state.RecruiterConversations = state.RecruiterConversations.map(
              (conv, index) =>
                index === conversationIndex
                  ? {
                      ...conv,
                      lastMessage: message.content,
                      lastMessageTimestamp: message.timestamp,
                    }
                  : conv
            );
          }
        }
      )
      .addCase(recruiterSendMessage.rejected, (state, action) => {
        state.recruiterLoading = false;
        state.recruiterError =
          (action.payload as string) || "An error occurred";
      });
  },
});

export const {
  addRecruiterMessage,
  setRecruiterTypingStatus,
  markRecruiterMessageAsRead,
  markAllMessagesAsLocallyRead,
  setRecruiterOnlineStatus,
  updateRecruiterConversation,
  addNewRecruiterConversation,
  setCurrentRecruiterId,
  setMessageSending,
} = RecruitermessageSlice.actions;

export default RecruitermessageSlice.reducer;
