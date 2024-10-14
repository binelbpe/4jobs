import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchConversationsApi, fetchMessagesApi, sendMessageApi } from '../../api/recruiterApi';
import { Conversation, Message } from '../../types/recruiterMessageType';

interface MessageState {
  RecruiterConversations: Conversation[];
  RecruiterMessages: { [conversationId: string]: Message[] };
  recruiterLoading: boolean;
  recruiterError: string | null;
}

const initialState: MessageState = {
  RecruiterConversations: [],
  RecruiterMessages: {},
  recruiterLoading: false,
  recruiterError: null,
};

export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (recruiterId: string, { rejectWithValue }) => {
    try {
      const response = await fetchConversationsApi(recruiterId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'An error occurred');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response = await fetchMessagesApi(conversationId);
      console.log('Fetched messages:', response.data);
      return { conversationId, messages: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'An error occurred');
    }
  }
);

export const recruiterSendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ conversationId, content }: { conversationId: string; content: string }, { rejectWithValue }) => {
    try {
      const message = await sendMessageApi(conversationId, content);
      console.log('Response in sendMessage thunk:', message);
      if (!message || typeof message !== 'object' || !('id' in message)) {
        throw new Error('Invalid message structure received from API');
      }
      return { conversationId, message };
    } catch (error: any) {
      console.error('Error in sendMessage thunk:', error);
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);


const RecruitermessageSlice = createSlice({
  name: 'RecruiterMessages',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.recruiterLoading = true;
        state.recruiterError = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action: PayloadAction<Conversation[]>) => {
        state.recruiterLoading = false;
        state.RecruiterConversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.recruiterLoading = false;
        state.recruiterError = action.payload as string || 'An error occurred';
      })
      .addCase(fetchMessages.pending, (state) => {
        state.recruiterLoading = true;
        state.recruiterError = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action: PayloadAction<{ conversationId: string; messages: Message[] }>) => {
        state.recruiterLoading = false;
        console.log('Storing messages in state:', action.payload);
        state.RecruiterMessages[action.payload.conversationId] = action.payload.messages || [];
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.recruiterLoading = false;
        state.recruiterError = action.payload as string || 'An error occurred';
      })
      .addCase(recruiterSendMessage.pending, (state) => {
        state.recruiterLoading = true;
        state.recruiterError = null;
      })
      .addCase(recruiterSendMessage.fulfilled, (state, action: PayloadAction<{ conversationId: string; message: Message }>) => {
        state.recruiterLoading = false;
        const { conversationId, message } = action.payload;
        if (!state.RecruiterMessages[conversationId]) {
          state.RecruiterMessages[conversationId] = [];
        }
        // Only add the message if it doesn't already exist
        if (!state.RecruiterMessages[conversationId].some(m => m.id === message.id)) {
          state.RecruiterMessages[conversationId] = [...state.RecruiterMessages[conversationId], message];
        }
      
        // Update the last message in the conversation list
        const conversationIndex = state.RecruiterConversations.findIndex(conv => conv.id === conversationId);
        if (conversationIndex !== -1) {
          state.RecruiterConversations = state.RecruiterConversations.map((conv, index) => 
            index === conversationIndex 
              ? { ...conv, lastMessage: message.content, lastMessageTimestamp: message.timestamp }
              : conv
          );
        }
      })
      .addCase(recruiterSendMessage.rejected, (state, action) => {
        state.recruiterLoading = false;
        state.recruiterError = action.payload as string || 'An error occurred';
      });
  },
});

export default RecruitermessageSlice.reducer;
