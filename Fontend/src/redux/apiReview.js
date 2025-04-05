import axios from "axios";
import {
  getReviewsStart,
  getReviewsSuccess,
  getReviewsFailed,

  addReviewStart,
  addReviewSuccess,
  addReviewFailed,

  updateReviewSuccess,
  deleteReviewSuccess,

  addReplySuccess,
  updateReplySuccess,
  deleteReplySuccess,
} from "../redux/reviewSlice";

// 📌 Lấy danh sách đánh giá và phản hồi
export const getReviews = async (type, itemId, dispatch) => {
  dispatch(getReviewsStart());
  try {
    const res = await axios.get(`http://localhost:8000/v1/reviews/${type}/${itemId}`);
    dispatch(getReviewsSuccess(res.data));
    return res.data;
  } catch (err) {
    dispatch(getReviewsFailed(err.response?.data?.message || "Lỗi tải đánh giá"));
    throw err;
  }
};

// 📌 Thêm đánh giá mới
export const addReview = async (reviewData, accessToken, dispatch, axiosJWT) => {
  dispatch(addReviewStart());
  try {
    const res = await axiosJWT.post(`http://localhost:8000/v1/reviews`, reviewData, {
      headers: { token: `Bearer ${accessToken}` },
    });
    dispatch(addReviewSuccess(res.data));
    return res.data;
  } catch (err) {
    dispatch(addReviewFailed(err.response?.data?.message || "Lỗi khi thêm đánh giá"));
    throw err;
  }
};

// 📌 Cập nhật đánh giá
export const updateReview = async (id, data, accessToken, dispatch, axiosJWT) => {
  try {
    const res = await axiosJWT.put(`http://localhost:8000/v1/reviews/${id}`, data, {
      headers: { token: `Bearer ${accessToken}` },
    });
    dispatch(updateReviewSuccess(res.data.review));
    return res.data;
  } catch (err) {
    console.error("Lỗi update review:", err);
    throw err;
  }
};

// 📌 Xóa đánh giá
export const deleteReview = async (id, data, accessToken, dispatch, axiosJWT) => {
  try {
    await axiosJWT.delete(`http://localhost:8000/v1/reviews/${id}`, {
      headers: { token: `Bearer ${accessToken}` },
      data,
    });
    dispatch(deleteReviewSuccess(id));
  } catch (err) {
    console.error("Lỗi delete review:", err);
    throw err;
  }
};

// 📌 Thêm phản hồi
export const addReply = async (reviewId, replyData, accessToken, dispatch, axiosJWT) => {
  try {
    const res = await axiosJWT.post(
      `http://localhost:8000/v1/reviews/reply/${reviewId}`,
      replyData,
      { headers: { token: `Bearer ${accessToken}` } }
    );
    dispatch(addReplySuccess(res.data));
    return res.data;
  } catch (err) {
    console.error("Lỗi khi thêm phản hồi:", err);
    throw err;
  }
};

// 📌 Sửa phản hồi
export const updateReply = async (replyId, data, accessToken, dispatch, axiosJWT) => {
  try {
    const res = await axiosJWT.put(
      `http://localhost:8000/v1/reviews/reply/${replyId}`,
      data,
      { headers: { token: `Bearer ${accessToken}` } }
    );
    dispatch(updateReplySuccess(res.data.reply));
    return res.data;
  } catch (err) {
    console.error("Lỗi update reply:", err);
    throw err;
  }
};

export const deleteReply = async (replyId, data, accessToken, dispatch, axiosJWT) => {
  try {
    await axiosJWT.delete(`http://localhost:8000/v1/reviews/reply/${replyId}`, {
      headers: { token: `Bearer ${accessToken}` },
    });
    dispatch(deleteReplySuccess({ reviewId: data.reviewId, replyId }));
  } catch (err) {
    console.error("Lỗi delete reply:", err);
    throw err;
  }
};