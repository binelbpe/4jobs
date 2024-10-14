import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchUserConversationsApi, fetchUserMessagesApi, sendUserMessageApi } from '../../api/authapi';
import { URConversation, URMessage } from '../../types/userRecruiterMessage';

interface UserRecruiterMessageState {
  conversations: URConversation[];
  messages: { [conversationId: string]: URMessage[] };
  loading: boolean;
  error: string | null;
}

const initialState: UserRecruiterMessageState = {
  conversations: [],
  messages: {},
  loading: false,
  error: null,
};

export const fetchUserRecruiterConversations = createAsyncThunk(
  'userRecruiterMessages/fetchConversations',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetchUserConversationsApi(userId);
      console.log("UR copnv festch  respo",response)
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'An error occurred');
    }
  }
);

export const fetchUserRecruiterMessages = createAsyncThunk(
  'userRecruiterMessages/fetchMessages',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response = await fetchUserMessagesApi(conversationId);
      console.log("UR fetchUserRecruiterMessages festch  respo",response)
      return { conversationId, messages: response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'An error occurred');
    }
  }
);

export const sendUserRecruiterMessage = createAsyncThunk(
  'userRecruiterMessages/sendMessage',
  async ({ conversationId, content, senderId }: { conversationId: string; content: string; senderId: string }, { rejectWithValue }) => {
    try {
      const message = await sendUserMessageApi(conversationId, content, senderId);
      console.log("UR sendUserRecruiterMessage festch  respo",message)
      return { conversationId, message };
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

const userRecruiterMessageSlice = createSlice({
  name: 'userRecruiterMessages',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserRecruiterConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserRecruiterConversations.fulfilled, (state, action: PayloadAction<URConversation[]>) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchUserRecruiterConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'An error occurred';
      })
      .addCase(fetchUserRecruiterMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserRecruiterMessages.fulfilled, (state, action: PayloadAction<{ conversationId: string; messages: URMessage[] }>) => {
        state.loading = false;
        state.messages[action.payload.conversationId] = action.payload.messages;
      })
      .addCase(fetchUserRecruiterMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'An error occurred';
      })
      .addCase(sendUserRecruiterMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendUserRecruiterMessage.fulfilled, (state, action: PayloadAction<{ conversationId: string; message: URMessage }>) => {
        state.loading = false;
        const { conversationId, message } = action.payload;
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
        state.messages[conversationId].push(message);
        
        const conversationIndex = state.conversations.findIndex(conv => conv.id === conversationId);
        if (conversationIndex !== -1) {
          state.conversations[conversationIndex] = {
            ...state.conversations[conversationIndex],
            lastMessage: message.content,
            lastMessageTimestamp: message.createdAt
          };
        }
      })
      .addCase(sendUserRecruiterMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'An error occurred';
      });
  },
});

export default userRecruiterMessageSlice.reducer;
