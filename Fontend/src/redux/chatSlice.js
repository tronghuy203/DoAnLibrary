import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chats: [],
    history: {},
    users: [],
    isFetching: false,
    error: null,
  },
  reducers: {
    getUsersStart(state) {
      state.isFetching = true;
      state.error = null;
    },
    getUsersSuccess(state, action) {
      state.isFetching = false;
      state.users = action.payload;
    },
    getUsersFailed(state, action) {
      state.isFetching = false;
      state.error = action.payload;
    },

    createChatStart(state) {
      state.isFetching = true;
      state.error = null;
    },
    createChatSuccess(state, action) {
      state.isFetching = false;
      state.chats = action.payload;
    },
    createChatFailed(state, action) {
      state.isFetching = false;
      state.error = action.payload;
    },

    getHistoryStart(state) {
      state.isFetching = true;
      state.error = null;
    },
    getHistorySuccess(state, action) {
      state.isFetching = false;
      const { chatId, messages } = action.payload;
      state.history[chatId] = messages;
    },
    getHistoryFailed(state, action) {
      state.isFetching = false;
      state.error = action.payload;
    },

    getAdminStart(state) {
      state.isFetching = true;
      state.error = null;
    },
    getAdminSuccess(state, action) {
      state.isFetching = false;
    },
    getAdminFailed(state, action) {
      state.isFetching = false;
      state.error = action.payload;
    },
  },
});

export const {
  getUsersStart,
  getUsersSuccess,
  getUsersFailed,
  createChatStart,
  createChatSuccess,
  createChatFailed,
  getHistoryStart,
  getHistorySuccess,
  getHistoryFailed,
  getAdminStart,
  getAdminSuccess,
  getAdminFailed,
} = chatSlice.actions;

export default chatSlice.reducer;