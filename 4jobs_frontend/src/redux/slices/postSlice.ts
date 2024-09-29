import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Post, CreatePostData, LikePostData, CommentPostData } from '../../types/postTypes';
import {
  fetchPostsAPI,
  fetchPostsByUserIdAPI,
  createPostAPI,
  likePostAPI,
  commentOnPostAPI,
  deletePostAPI 
} from '../../api/authapi';

interface PostsState {
  list: Post[];
  userPosts: Post[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  hasMore: boolean;
  page: number;
}

const initialState: PostsState = {
  list: [],
  userPosts: [],
  status: 'idle',
  error: null,
  hasMore: true,
  page: 1,
};

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (_, { getState }) => {
    const { posts } = getState() as { posts: PostsState };
    const response = await fetchPostsAPI(posts.page);
    return response;
  }
);

export const fetchPostsByUserId = createAsyncThunk(
  'posts/fetchPostsByUserId',
  async (userId: string) => {
    const response = await fetchPostsByUserIdAPI(userId);
    return response;
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async ({ postData, userId }: { postData: CreatePostData; userId: string }) => {
    const response = await createPostAPI(postData, userId);
    return response;
  }
);

export const likePost = createAsyncThunk(
  'posts/likePost',
  async (likeData: LikePostData) => {
    const response = await likePostAPI(likeData);
    return response;
  }
);

export const commentOnPost = createAsyncThunk(
  'posts/commentOnPost',
  async (commentData: CommentPostData) => {
    const response = await commentOnPostAPI(commentData);
    return response;
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId: string) => {
    await deletePostAPI(postId);
    return postId;
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    resetPosts: (state) => {
      state.list = [];
      state.page = 1;
      state.hasMore = true;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPosts.fulfilled, (state, action: PayloadAction<Post[]>) => {
        state.status = 'succeeded';
        state.list = state.page === 1 ? action.payload : [...state.list, ...action.payload];
        state.hasMore = action.payload.length > 0;
        state.page += 1;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(fetchPostsByUserId.fulfilled, (state, action) => {
        state.userPosts = action.payload;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.userPosts.unshift(action.payload);
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        const index = state.list.findIndex((post) => post.id === updatedPost.id);
        if (index !== -1) {
          state.list[index] = updatedPost;
        }
        const userIndex = state.userPosts.findIndex((post) => post.id === updatedPost.id);
        if (userIndex !== -1) {
          state.userPosts[userIndex] = updatedPost;
        }
      })
      .addCase(commentOnPost.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        const index = state.list.findIndex((post) => post.id === updatedPost.id);
        if (index !== -1) {
          state.list[index] = updatedPost;
        }
        const userIndex = state.userPosts.findIndex((post) => post.id === updatedPost.id);
        if (userIndex !== -1) {
          state.userPosts[userIndex] = updatedPost;
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.list = state.list.filter(post => post.id !== action.payload);
        state.userPosts = state.userPosts.filter(post => post.id !== action.payload);
      });
  },
});

export const { resetPosts } = postsSlice.actions;
export default postsSlice.reducer;