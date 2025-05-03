import { sendChatMessageStart, sendChatMessageSuccess, sendChatMessageFailed, fetchChatHistoryStart, fetchChatHistorySuccess, fetchChatHistoryFailed } from "./chatbotSlice";

export const sendChatMessage = async (message, userId, accessToken, dispatch, axiosJWT) => {
  dispatch(sendChatMessageStart());
  try {
    const res = await axiosJWT.post(
      "http://localhost:8000/v1/chatbot/chat",
      { message, userId },
      {
        headers: { token: `Bearer ${accessToken}` },
        timeout: 15000, 
      }
    );

    dispatch(
      sendChatMessageSuccess({
        userId,
        message,
        reply: res.data.reply || "Danh sách sách và tài liệu phù hợp đã được tìm thấy.",
        recommendations: res.data.recommendations || {},
      })
    );
    return res.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || "Lỗi khi gửi tin nhắn";
    dispatch(sendChatMessageFailed(errorMessage));
    console.error("Lỗi khi gửi tin nhắn:", err);
    throw new Error(errorMessage);
  }
};

export const fetchChatHistory = async (userId, accessToken, dispatch, axiosJWT) => {
  dispatch(fetchChatHistoryStart());
  try {
    const res = await axiosJWT.post(
      "http://localhost:8000/v1/chatbot/history",
      { userId },
      {
        headers: { token: `Bearer ${accessToken}` },
        timeout: 15000,
      }
    );

    dispatch(fetchChatHistorySuccess(res.data));
    return res.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || "Lỗi khi lấy lịch sử trò chuyện";
    dispatch(fetchChatHistoryFailed(errorMessage));
    console.error("Lỗi khi lấy lịch sử:", err);
    throw new Error(errorMessage);
  }
};