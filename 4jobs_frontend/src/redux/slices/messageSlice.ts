import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Message, SendMessagePayload, GetConversationPayload } from '../../types/messageType';
import { sendMessageApi, getConversationApi, markMessageAsReadApi, getUnreadMessageCountApi } from '../../api/authapi';

interface MessageState {
  conversations: Record<string, Message[]>;
  loading: boolean;
  error: string | null;
  unreadCount: number;
}

const initialState: MessageState = {
  conversations: {},
  loading: false,
  error: null,
  unreadCount: 0,
};

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (payload: SendMessagePayload) => {
    const { senderId, recipientId, content } = payload;
     let response= await sendMessageApi(senderId, recipientId, content);
     return response
  }
);

export const getConversation = createAsyncThunk(
  'messages/getConversation',
  async (payload: GetConversationPayload) => {
    const { userId1, userId2 } = payload;
    const messages = await getConversationApi(userId1, userId2);
    console.log("messages",messages)
    return { userId: userId2, messages };
  }
);

export const markMessageAsRead = createAsyncThunk(
  'messages/markMessageAsRead',
  async (messageId: string) => {
    return await markMessageAsReadApi(messageId);
  }
);

export const getUnreadMessageCount = createAsyncThunk(
  'messages/getUnreadMessageCount',
  async (userId: string) => {
    return await getUnreadMessageCountApi(userId);
  }
);

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        const message: Message = action.payload;
        const conversationKey = message.recipient.id;
        if (!state.conversations[conversationKey]) {
          state.conversations[conversationKey] = [];
        }
        state.conversations[conversationKey].push(message);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send message';
      })
      .addCase(getConversation.pending, (state) => {
        state.loading = true;
      })
      .addCase(getConversation.fulfilled, (state, action) => {
        state.loading = false;
        const { userId, messages } = action.payload;
        state.conversations[userId] = messages;
      })
      .addCase(getConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get conversation';
      })
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        const messageId = action.payload;
        Object.values(state.conversations).forEach((conversation) => {
          const message = conversation.find((m) => m.id === messageId);
          if (message) {
            message.isRead = true;
          }
        });
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      .addCase(getUnreadMessageCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });
  },
});

export const selectConversations = (state: RootState) => state.messages.conversations;
export const selectUnreadCount = (state: RootState) => state.messages.unreadCount;

export default messageSlice.reducer;