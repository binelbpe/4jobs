import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RecommendationUser, User } from '../../types/auth';
import { fetchRecommendationsApi, sendConnectionRequestApi, fetchConnectionProfileApi } from '../../api/authapi';

interface ConnectionState {
  recommendations: RecommendationUser[];
  connectionProfile: User | null;  
  loading: boolean;
  error: string | null;
}

const initialState: ConnectionState = {
  recommendations: [],
  connectionProfile: null, 
  loading: false,
  error: null,
};

export const fetchRecommendations = createAsyncThunk(
  'connections/fetchRecommendations',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetchRecommendationsApi(userId);
      console.log("API response:", response);
      
      if (!response) {
        console.error("API did not return an array of recommendations:", response);
        return rejectWithValue('Invalid response from server');
      }
      
      return response;
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      return rejectWithValue('Failed to fetch recommendations. Please try again later.');
    }
  }
);

export const sendConnectionRequest = createAsyncThunk(
  'connections/sendRequest',
  async ({ senderId, recipientId }: { senderId: string; recipientId: string }, { rejectWithValue }) => {
    try {
      const response = await sendConnectionRequestApi(senderId, recipientId);
      console.log("Connection request response:", response);

      if (response && response.connection) {
        return response.connection;
      } else {
        return rejectWithValue('Invalid response from server');
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
      return rejectWithValue('Failed to send connection request. Please try again later.');
    }
  }
);

export const fetchConnectionProfile = createAsyncThunk(
  'connections/fetchProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetchConnectionProfileApi(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch connection profile. Please try again later.');
    }
  }
);

const connectionSlice = createSlice({
  name: 'connections',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendations = action.payload;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'An unexpected error occurred';
      })
      .addCase(sendConnectionRequest.pending, (state) => {
        state.error = null;
      })
      .addCase(sendConnectionRequest.fulfilled, (state, action) => {
        if (action.payload && action.payload.recipientId) {
          const updatedConnection = action.payload;
          state.recommendations = state.recommendations.map(user => 
            user.id === updatedConnection.recipientId 
              ? { ...user, connectionStatus: 'pending' } 
              : user
          );
        } else {
          console.error('Invalid payload received in sendConnectionRequest.fulfilled:', action.payload);
        }
      })
      .addCase(sendConnectionRequest.rejected, (state, action) => {
        state.error = action.payload as string || 'An unexpected error occurred';
      })
      .addCase(fetchConnectionProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConnectionProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.connectionProfile = action.payload;
      })
      .addCase(fetchConnectionProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'An unexpected error occurred';
      });
  },
});

export const { clearError } = connectionSlice.actions;

export default connectionSlice.reducer;