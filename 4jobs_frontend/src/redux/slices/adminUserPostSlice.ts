import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchUserPostsApi, blockUserPostApi } from '../../api/adminApi';

interface UserPost {
  id: string;
  userName: string;
  userEmail: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  isBlocked: boolean;
}

interface UserPostState {
  userPosts: UserPost[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
}

const initialState: UserPostState = {
  userPosts: [],
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
};

export const fetchUserPosts = createAsyncThunk(
  'userPosts/fetchUserPosts',
  async ({ page, limit }: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const response = await fetchUserPostsApi(page, limit);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch user posts');
    }
  }
);

export const blockUserPost = createAsyncThunk(
  'userPosts/blockUserPost',
  async (postId: string, { rejectWithValue }) => {
    try {
      await blockUserPostApi(postId);
      return postId;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to block user post');
    }
  }
);

const userPostSlice = createSlice({
  name: 'userPosts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action: PayloadAction<{ userPosts: UserPost[]; totalPages: number; currentPage: number }>) => {
        state.loading = false;
        state.userPosts = action.payload.userPosts;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.error = null;
      })
      .addCase(fetchUserPosts.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch user posts';
      })
      .addCase(blockUserPost.fulfilled, (state, action: PayloadAction<string>) => {
        const post = state.userPosts.find(post => post.id === action.payload);
        if (post) {
          post.isBlocked = !post.isBlocked;
        }
      });
  },
});

export default userPostSlice.reducer;
