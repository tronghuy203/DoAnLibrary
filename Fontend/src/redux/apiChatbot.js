import { sendChatMessageStart, sendChatMessageSuccess, sendChatMessageFailed, fetchChatHistoryStart, fetchChatHistorySuccess, fetchChatHistoryFailed } from "./chatbotSlice";

const deepClone = (obj) => {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (err) {
    console.error("Lỗi khi sao chép sâu:", err);
    return {};
  }
};

export const sendChatMessage = async (message, userId, accessToken, dispatch, axiosJWT) => {
  dispatch(sendChatMessageStart());
  try {
    const res = await axiosJWT.post(
      "http://localhost:8000/v1/chatbot/chat",
      { message, userId },
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );

    const clonedData = deepClone(res.data);
    dispatch(
      sendChatMessageSuccess({
        userId,
        message,
        reply: clonedData.reply || "Danh sách sách và tài liệu phù hợp đã được tìm thấy.",
        recommendations: clonedData.recommendations || {},
      })
    );
    return clonedData;
  } catch (err) {
    const errorMessage = err.response?.data?.message || "Lỗi khi gửi tin nhắn";
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
      }
    );

    const sanitizedData = deepClone(res.data);
    dispatch(fetchChatHistorySuccess(sanitizedData));
    return sanitizedData;
  } catch (err) {
    const errorMessage = err.response?.data?.message || "Lỗi khi lấy lịch sử trò chuyện";
    dispatch(fetchChatHistoryFailed(errorMessage));
    console.error("Lỗi khi lấy lịch sử:", err);
    throw new Error(errorMessage);
  }
};