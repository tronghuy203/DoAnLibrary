import { createSlice } from "@reduxjs/toolkit";

const chatbotSlice = createSlice({
  name: "chatbot",
  initialState: {
    messages: [],
    history: [],
    isFetching: false,
    isFetchingHistory: false,
    error: null,
  },
  reducers: {
    sendChatMessageStart(state) {
      state.isFetching = true;
      state.error = null;
    },
    sendChatMessageSuccess(state, action) {
      state.isFetching = false;
      const { message, reply, recommendations } = action.payload;

      state.messages.push({ content: message, sender: "user" });
      state.messages.push({
        content: reply || "Danh sách sách và tài liệu phù hợp đã được tìm thấy.",
        sender: "bot",
        recommendations,
      });
    },
    sendChatMessageFailed(state, action) {
      state.isFetching = false;
      state.error = action.payload;
    },
    fetchChatHistoryStart(state) {
      state.isFetchingHistory = true;
      state.error = null;
    },
    fetchChatHistorySuccess(state, action) {
      state.isFetchingHistory = false;
      state.history = action.payload;
    },
    fetchChatHistoryFailed(state, action) {
      state.isFetchingHistory = false;
      state.error = action.payload;
    },
    resetError(state) {
      state.error = null;
    },
    clearMessages(state) {
      state.messages = [];
    },
  },
});

export const {
  sendChatMessageStart,
  sendChatMessageSuccess,
  sendChatMessageFailed,
  fetchChatHistoryStart,
  fetchChatHistorySuccess,
  fetchChatHistoryFailed,
  resetError,
  clearMessages,
} = chatbotSlice.actions;

export default chatbotSlice.reducer;