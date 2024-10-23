import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RecommendationUser, User, UserConnection } from "../../types/auth";
import { RootState } from "../store";
import {
  fetchRecommendationsApi,
  sendConnectionRequestApi,
  fetchConnectionProfileApi,
  fetchConnectionRequestsApi,
  acceptConnectionRequestApi,
  rejectConnectionRequestApi,
  fetchConnectionsApi,
  searchConnectionsApi,
  searchConnectionsMessageApi,
  removeConnectionApi,
} from "../../api/authapi";

interface ConnectionState {
  recommendations: RecommendationUser[];
  connectionProfile: User | null;
  profilesConnection: { [key: string]: User };
  connectionRequests: any[];
  loading: boolean;
  error: string | null;
  connections: User[] | null;
  lastFetchedAt: number | null;
  messageConnections: User[];
  messageSearchResults: UserConnection[];
}

const initialState: ConnectionState = {
  recommendations: [],
  connectionProfile: null,
  profilesConnection: {},
  connectionRequests: [],
  loading: false,
  error: null,
  connections: [],
  lastFetchedAt: null,
  messageConnections: [],
  messageSearchResults: [],
};

export const fetchConnectionProfile = createAsyncThunk(
  "connections/fetchProfile",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetchConnectionProfileApi(userId);
      return { userId, profile: response };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue(
        "Failed to fetch connection profile. Please try again later."
      );
    }
  }
);

export const fetchRecommendations = createAsyncThunk(
  "connections/fetchRecommendations",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetchRecommendationsApi(userId);
      if (!response) {
        return rejectWithValue("Invalid response from server");
      }
      console.log("reccommmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm", response);
      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue(
        "Failed to fetch recommendations. Please try again later."
      );
    }
  }
);

export const sendConnectionRequest = createAsyncThunk(
  "connections/sendRequest",
  async (
    { senderId, recipientId }: { senderId: string; recipientId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await sendConnectionRequestApi(senderId, recipientId);
      if (response && response.connection) {
        return response.connection;
      } else {
        return rejectWithValue("Invalid response from server");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue(
        "Failed to send connection request. Please try again later."
      );
    }
  }
);

export const fetchConnectionRequests = createAsyncThunk(
  "connections/fetchRequests",
  async (userId: string, { getState, rejectWithValue }) => {
    try {
      const response = await fetchConnectionRequestsApi(userId);
      console.log("Connection requests response:", response);
      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue(
        "Failed to fetch connection requests. Please try again later."
      );
    }
  }
);

export const acceptConnectionRequest = createAsyncThunk(
  "connections/acceptRequest",
  async (
    { requestId, userId }: { requestId: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await acceptConnectionRequestApi(requestId, userId);
      console.log("accept response", response);
      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue(
        "Failed to accept connection request. Please try again later."
      );
    }
  }
);

export const rejectConnectionRequest = createAsyncThunk(
  "connections/rejectRequest",
  async (
    { requestId, userId }: { requestId: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await rejectConnectionRequestApi(requestId, userId);
      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue(
        "Failed to reject connection request. Please try again later."
      );
    }
  }
);

export const fetchConnections = createAsyncThunk(
  "connections/fetchConnections",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetchConnectionsApi(userId);
      console.log("respo connections",response)
      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue(
        "Failed to fetch connections. Please try again later."
      );
    }
  }
);

export const searchConnections = createAsyncThunk(
  "connections/searchConnections",
  async (
    { userId, query }: { userId: string; query: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await searchConnectionsApi(userId, query);
      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue(
        "Failed to search connections. Please try again later."
      );
    }
  }
);

export const searchConnectionsMessage = createAsyncThunk(
  "connections/searchConnections/message",
  async (payload: { userId: string; query: string }) => {
    const { userId, query } = payload;

    let response = await searchConnectionsMessageApi(userId, query);
    console.log(response);
    return response;
  }
);

export const removeConnection = createAsyncThunk(
  "connections/removeConnection",
  async (
    { userId, connectionId }: { userId: string; connectionId: string },
    { rejectWithValue }
  ) => {
    try {
      await removeConnectionApi(userId, connectionId); // Call the API
      return connectionId; // Return the connectionId to be removed
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue(
        "Failed to remove connection. Please try again later."
      );
    }
  }
);

const connectionSlice = createSlice({
  name: "connections",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearConnectionProfile: (state, action: PayloadAction<string>) => {
      delete state.profilesConnection[action.payload];
    },
    clearAllConnectionProfiles: (state) => {
      state.profilesConnection = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchRecommendations.fulfilled,
        (state, action: PayloadAction<RecommendationUser[]>) => {
          state.loading = false;
          state.recommendations = action.payload;
        }
      )
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          "Failed to fetch recommendations. Please try again.";
      })
      .addCase(sendConnectionRequest.pending, (state) => {
        state.error = null;
      })
      .addCase(
        sendConnectionRequest.fulfilled,
        (state, action: PayloadAction<any>) => {
          if (action.payload && action.payload.recipientId) {
            const updatedConnection = action.payload;
            state.recommendations = state.recommendations.map((user) =>
              user.id === updatedConnection.recipientId
                ? { ...user, connectionStatus: "pending" }
                : user
            );
          } else {
            console.error(
              "Invalid payload received in sendConnectionRequest.fulfilled:",
              action.payload
            );
          }
        }
      )
      .addCase(sendConnectionRequest.rejected, (state, action) => {
        state.error =
          (action.payload as string) ||
          "Failed to send connection request. Please try again.";
      })
      .addCase(fetchConnectionProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchConnectionProfile.fulfilled,
        (state, action: PayloadAction<{ userId: string; profile: User }>) => {
          state.loading = false;
          const { userId, profile } = action.payload;
          state.profilesConnection[userId] = profile;
          if (
            !state.connectionProfile ||
            state.connectionProfile.id !== profile.id
          ) {
            state.connectionProfile = profile;
          }
        }
      )
      .addCase(fetchConnectionProfile.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          "Failed to fetch connection profile. Please try again.";
      })
      .addCase(fetchConnectionRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchConnectionRequests.fulfilled,
        (state, action: PayloadAction<any[] | null>) => {
          state.loading = false;
          if (action.payload !== null) {
            state.connectionRequests = action.payload;
            console.log("state.connectionRequests", state.connectionRequests);
            state.lastFetchedAt = Date.now();
          }
        }
      )
      .addCase(fetchConnectionRequests.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          "Failed to fetch connection requests. Please try again.";
      })
      .addCase(acceptConnectionRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        acceptConnectionRequest.fulfilled,
        (state, action: PayloadAction<{ _id: string }>) => {
          state.loading = false;
          state.connectionRequests = state.connectionRequests.filter(
            (request) => request._id !== action.payload._id
          );
        }
      )
      .addCase(acceptConnectionRequest.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          "Failed to accept connection request. Please try again.";
      })
      .addCase(rejectConnectionRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        rejectConnectionRequest.fulfilled,
        (state, action: PayloadAction<{ requestId: string }>) => {
          state.loading = false;
          state.connectionRequests = state.connectionRequests.filter(
            (request) => request.id !== action.payload.requestId
          );
        }
      )
      .addCase(rejectConnectionRequest.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          "Failed to reject connection request. Please try again.";
      })
      .addCase(fetchConnections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchConnections.fulfilled,
        (
          state,
          action: PayloadAction<{
            connections: User[];
            connectionRequests: any[];
          }>
        ) => {
          state.loading = false;
          state.connections = action.payload.connections;
          state.connectionRequests = action.payload.connectionRequests;
        }
      )
      .addCase(fetchConnections.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          "Failed to fetch connections. Please try again.";
      })
      .addCase(searchConnections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        searchConnections.fulfilled,
        (state, action: PayloadAction<User[]>) => {
          state.loading = false;
          state.connections = action.payload;
        }
      )
      .addCase(searchConnections.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          "Failed to search connections. Please try again.";
      })

      .addCase(searchConnectionsMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchConnectionsMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messageSearchResults = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(searchConnectionsMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to search connections";
      })
      .addCase(removeConnection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeConnection.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.connections = state.connections?.filter(
          (connection) => connection._id !== action.payload
        ) || []; 
      })
      .addCase(removeConnection.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          "Failed to remove connection. Please try again.";
      });
  },
});

export const {
  clearError,
  clearConnectionProfile,
  clearAllConnectionProfiles,
} = connectionSlice.actions;
export const selectConnections = (state: RootState) =>
  state.connections.messageConnections;
export const selectSearchResults = (state: RootState) =>
  state.connections.messageSearchResults;

export default connectionSlice.reducer;
