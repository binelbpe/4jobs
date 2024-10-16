import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchNotificationsApi } from '../../api/authapi';
import { Notification } from '../../types/notification';

export const fetchNotifications = createAsyncThunk<
  Notification[],
  string,
  { rejectValue: string }
>('notifications/fetch', async (userId: string, { rejectWithValue }) => {
  try {
    const response = await fetchNotificationsApi(userId);
    if (!response || !Array.isArray(response)) {
      throw new Error('Invalid response format');
    }
    return response;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Failed to fetch notifications');
  }
});

interface NotificationState {
  items: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
  seenNotifications: string[];
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
  lastFetchedAt: null,
  seenNotifications: [],
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.items.find(item => item._id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAsSeen: (state, action: PayloadAction<string>) => {
      if (!state.seenNotifications.includes(action.payload)) {
        state.seenNotifications.push(action.payload);
        state.items = state.items.filter(item => item._id !== action.payload);
        state.unreadCount = state.items.filter(item => !item.isRead).length;
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach(item => {
        if (!item.isRead) {
          item.isRead = true;
          if (!state.seenNotifications.includes(item._id)) {
            state.seenNotifications.push(item._id);
          }
        }
      });
      state.unreadCount = 0;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        const newNotifications = action.payload.filter(
          notification => !state.seenNotifications.includes(notification._id)
        );
        state.items = newNotifications;
        state.unreadCount = newNotifications.filter(
          notification => !notification.isRead
        ).length;
        state.lastFetchedAt = Date.now();
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An unknown error occurred';
      });
  },
});

export const { addNotification, markAsRead, markAllAsRead, clearError, markAsSeen } = notificationSlice.actions;
export default notificationSlice.reducer;
