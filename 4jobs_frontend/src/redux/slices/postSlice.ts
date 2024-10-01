import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Post, CreatePostData, LikePostData, CommentPostData } from '../../types/postTypes';
import {
  fetchPostsAPI,
  fetchPostsByUserIdAPI,
  createPostAPI,
  likePostAPI,
  commentOnPostAPI,
  deletePostAPI,
  editPostAPI
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
  async ({ userId, page, limit }: { userId: string; page: number; limit: number }) => {
    console.log("Fetching posts for user:", userId);
    const response = await fetchPostsByUserIdAPI(userId, page, limit);
    console.log("Fetched posts:", response);
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
  async (postId: string, { rejectWithValue }) => {
    try {
      console.log("Deleting post with ID:", postId);
      await deletePostAPI(postId);
      return postId;
    } catch (error) {
      console.error("Error in deletePost thunk:", error);
      return rejectWithValue(error);
    }
  }
);

export const editPost = createAsyncThunk(
  'posts/editPost',
  async ({ postId,userId, postData }: { postId: string; userId:string; postData: Partial<CreatePostData> }) => {
    console.log("edit post",userId,postId,postData)
    const response = await editPostAPI(postId,userId, postData);
    console.log("response",response)
    return response;
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
        console.log("action payload",action.payload)
        state.userPosts = action.payload;
        console.log("userPosts",state.userPosts)
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.userPosts.unshift(action.payload);
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        const index = state.list.findIndex((post) => post._id === updatedPost._id);
        if (index !== -1) {
          state.list[index] = updatedPost;
        }
        const userIndex = state.userPosts.findIndex((post) => post._id === updatedPost._id);
        if (userIndex !== -1) {
          state.userPosts[userIndex] = updatedPost;
        }
      })
      .addCase(commentOnPost.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        const index = state.list.findIndex((post) => post._id === updatedPost._id);
        if (index !== -1) {
          state.list[index] = updatedPost;
        }
        const userIndex = state.userPosts.findIndex((post) => post._id === updatedPost._id);
        if (userIndex !== -1) {
          state.userPosts[userIndex] = updatedPost;
        }
      })
      .addCase(deletePost.pending, (state) => {
        console.log("Delete post pending");
        state.status = 'loading';
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        console.log("Delete post fulfilled", action.payload);
        state.status = 'succeeded';
        state.list = state.list.filter(post => post._id !== action.payload);
        state.userPosts = state.userPosts.filter(post => post._id !== action.payload);
      })
      .addCase(deletePost.rejected, (state, action) => {
        console.error("Delete post rejected", action.error);
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(editPost.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        const index = state.list.findIndex((post) => post._id === updatedPost._id);
        if (index !== -1) {
          state.list[index] = updatedPost;
        }
        const userIndex = state.userPosts.findIndex((post) => post._id === updatedPost._id);
        if (userIndex !== -1) {
          state.userPosts[userIndex] = updatedPost;
        }
      })
  },
});

export const { resetPosts } = postsSlice.actions;
export default postsSlice.reducer;