import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Message, SendMessagePayload, GetConversationPayload } from '../../types/messageType';
import { UserConnection } from '../../types/auth';
import { sendMessageApi, getConversationApi, markMessageAsReadApi, getUnreadMessageCountApi, fetchConnectionsMessageApi } from '../../api/authapi';

interface MessageState {
  conversations: Record<string, Message[]>;
  connectionList: UserConnection[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
}

const initialState: MessageState = {
  conversations: {},
  connectionList: [],
  loading: false,
  error: null,
  unreadCount: 0,
};

// Helper function to convert User to UserConnection
const convertToUserConnection = (data: any): UserConnection => ({
  _id: data.user.id,
  name: data.user.name,
  email: data.user.email,
  profileImage: data.user.profileImage,
  role: data.user.role,
  lastMessage:data.lastMessage.content,
  lastMessageDate:data.lastMessage.createdAt
  // Add other properties as needed
});

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (payload: SendMessagePayload) => {
    const { senderId, recipientId, content } = payload;
    let response = await sendMessageApi(senderId, recipientId, content);
    console.log("send message",response)
    return response;
  }
);

export const getConversation = createAsyncThunk(
  'messages/getConversation',
  async (payload: GetConversationPayload) => {
    const { userId1, userId2 } = payload;
    const messages = await getConversationApi(userId1, userId2);
    console.log("messages getconversations",messages)
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

export const fetchConnectionsList = createAsyncThunk<
  UserConnection[],
  string,
  { rejectValue: string }
>(
  'messages/fetchConnectionsList',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetchConnectionsMessageApi(userId);
      console.log("API response:", response);
      
      if (Array.isArray(response)) {
        const connections = response.map(convertToUserConnection);
        console.log("Mapped connections:", connections);
        return connections;
      } else {
        return rejectWithValue('Invalid response format from API');
      }
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);



const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearMessageState: (state) => {
      state.conversations = {};
      state.connectionList = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action: PayloadAction<Message>) => {
        state.loading = false;
        const message = action.payload;
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
      .addCase(getConversation.fulfilled, (state, action: PayloadAction<{ userId: string; messages: Message[] }>) => {
        state.loading = false;
        const { userId, messages } = action.payload;
        state.conversations[userId] = messages;
      })
      .addCase(getConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get conversation';
      })
      .addCase(markMessageAsRead.fulfilled, (state, action: PayloadAction<string>) => {
        const messageId = action.payload;
        for (const conversationKey in state.conversations) {
          const conversation = state.conversations[conversationKey];
          const messageIndex = conversation.findIndex(msg => msg.id === messageId);
          if (messageIndex !== -1) {
            conversation[messageIndex].isRead = true;
            break;
          }
        }
      })
      .addCase(getUnreadMessageCount.fulfilled, (state, action: PayloadAction<number>) => {
        state.unreadCount = action.payload;
      })
      .addCase(fetchConnectionsList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConnectionsList.fulfilled, (state, action: PayloadAction<UserConnection[]>) => {
        state.loading = false;
        state.connectionList = action.payload;
      })
      .addCase(fetchConnectionsList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch connections';
      });
  },
});

export const { clearMessageState } = messageSlice.actions;
export const selectConversations = (state: RootState) => state.messages.conversations;
export const selectUnreadCount = (state: RootState) => state.messages.unreadCount;
export const selectConnectionList = (state: RootState) => state.messages.connectionList;

export default messageSlice.reducer;