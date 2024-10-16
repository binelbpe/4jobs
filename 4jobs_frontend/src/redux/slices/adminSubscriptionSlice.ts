import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchSubscriptionsApi, cancelSubscriptionApi } from '../../api/adminApi';
import { Subscription } from '../../types/subscription';

interface SubscriptionState {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
}

const initialState: SubscriptionState = {
  subscriptions: [], // Initialize as an empty array
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
};

export const fetchSubscriptions = createAsyncThunk(
  'subscriptions/fetchSubscriptions',
  async ({ page, limit }: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const response = await fetchSubscriptionsApi(page, limit);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch subscriptions');
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'subscriptions/cancelSubscription',
  async (subscriptionId: string, { rejectWithValue }) => {
    try {
      await cancelSubscriptionApi(subscriptionId);
      return subscriptionId;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to cancel subscription');
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action: PayloadAction<{ subscriptions: Subscription[]; totalPages: number; currentPage: number }>) => {
        state.loading = false;
        state.subscriptions = action.payload.subscriptions;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.error = null;
      })
      .addCase(fetchSubscriptions.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch subscriptions';
      })
      .addCase(cancelSubscription.fulfilled, (state, action: PayloadAction<string>) => {
        state.subscriptions = state.subscriptions.filter(
          (subscription) => subscription.id !== action.payload
        );
      });
  },
});

export default subscriptionSlice.reducer;
