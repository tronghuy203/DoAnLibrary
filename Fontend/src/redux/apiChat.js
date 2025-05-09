import {
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
} from "./chatSlice";

export const getChatUsers = async (accessToken, dispatch, axiosJWT) => {
  dispatch(getUsersStart());
  try {
    const res = await axiosJWT.get(`${process.env.REACT_APP_SERVER_URL}/v1/chat/users`, {
      headers: { token: `Bearer ${accessToken}` },
    });
    dispatch(getUsersSuccess(res.data));
    return res.data;
  } catch (err) {
    dispatch(
      getUsersFailed(
        err.response?.data?.message || "Không thể tải danh sách người dùng."
      )
    );
    throw err;
  }
};

export const getAdmin = async (accessToken, dispatch, axiosJWT) => {
  dispatch(getAdminStart());
  try {
    const res = await axiosJWT.get(`${process.env.REACT_APP_SERVER_URL}/v1/user/admin`, {
      headers: { token: `Bearer ${accessToken}` },
    });
    dispatch(getAdminSuccess(res.data));
    return res.data;
  } catch (err) {
    dispatch(
      getAdminFailed(err.response?.data?.message || "Không tìm thấy admin.")
    );
    throw err;
  }
};

export const createChat = async (userId, accessToken, dispatch, axiosJWT) => {
  dispatch(createChatStart());
  try {
    const res = await axiosJWT.post(
      `${process.env.REACT_APP_SERVER_URL}/v1/chat/create`,
      { userId },
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(createChatSuccess(res.data));
    return res.data;
  } catch (err) {
    dispatch(
      createChatFailed(
        err.response?.data?.message || "Không thể tạo cuộc trò chuyện."
      )
    );
    throw err;
  }
};

export const getChatHistory = async (
  chatId,
  accessToken,
  dispatch,
  axiosJWT
) => {
  dispatch(getHistoryStart());
  try {
    const res = await axiosJWT.get(`${process.env.REACT_APP_SERVER_URL}/v1/chat/history/${chatId}`, {
      headers: { token: `Bearer ${accessToken}` },
    });
    dispatch(getHistorySuccess({ chatId, messages: res.data }));
    return res.data;
  } catch (err) {
    dispatch(
      getHistoryFailed(
        err.response?.data?.message || "Không thể tải lịch sử trò chuyện."
      )
    );
    throw err;
  }
};
