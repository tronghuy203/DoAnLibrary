import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getReviews,
  addReview,
  updateReview,
  deleteReview,
  addReply,
  updateReply,
  deleteReply,
} from "../../redux/apiReview";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";

const ReviewSection = ({ type, itemId, user }) => {
  const dispatch = useDispatch();
  const { reviews, loading, error } = useSelector((state) => state.reviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [replyInput, setReplyInput] = useState({});
  const [editingReplyId, setEditingReplyId] = useState(null);

  let axiosJWT = createAxios(user, dispatch, loginSuccess);

  useEffect(() => {
    getReviews(type, itemId, dispatch);
  }, [dispatch, type, itemId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Bạn phải đăng nhập để đánh giá!");
      return;
    }

    const reviewData = {
      type,
      itemId,
      rating,
      comment,
      userId: user._id,
    };

    try {
      if (editingReviewId) {
        await updateReview(editingReviewId, reviewData, user.accessToken, dispatch, axiosJWT);
        setEditingReviewId(null);
      } else {
        await addReview(reviewData, user.accessToken, dispatch, axiosJWT);
      }
      setComment("");
      setRating(5);
      getReviews(type, itemId, dispatch);
    } catch (err) {
      console.error("Lỗi gửi đánh giá:", err);
    }
  };

  const handleDeleteReview = async (id) => {
    if (window.confirm("Xóa đánh giá này?")) {
      try {
        await deleteReview(id, { userId: user._id }, user.accessToken, dispatch, axiosJWT);
        getReviews(type, itemId, dispatch);
      } catch (err) {
        console.error("Lỗi xóa đánh giá:", err);
      }
    }
  };

  const handleReplySubmit = async (reviewId) => {
    const comment = replyInput[reviewId];
    if (!comment) return;
  
    try {
      if (editingReplyId) {
        await updateReply(editingReplyId, { comment, userId: user._id }, user.accessToken, dispatch, axiosJWT);
        setEditingReplyId(null);
      } else {
        await addReply(reviewId, { comment, userId: user._id }, user.accessToken, dispatch, axiosJWT);
      }
      setReplyInput({ ...replyInput, [reviewId]: "" });
      getReviews(type, itemId, dispatch);
    } catch (err) {
      console.error("Lỗi phản hồi:", err);
    }
  };

  const handleDeleteReply = async (replyId, reviewId) => {
    if (window.confirm("Xóa phản hồi này?")) {
      try {
        await deleteReply(replyId, { reviewId }, user.accessToken, dispatch, axiosJWT, user);
        getReviews(type, itemId, dispatch);
      } catch (err) {
        console.error("Lỗi xóa phản hồi:", err.response ? err.response.data : err.message);
      }
    }
  };
    
  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-3">Đánh giá & Bình luận</h3>

      {loading && <p>Đang tải đánh giá...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {reviews.map((review) => (
        <div key={review._id} className="border-b pb-4 mb-4">
          <div className="flex items-center mb-1">
            <img
              src={review.userId?.avatar || "https://via.placeholder.com/40"}
              alt="avatar"
              className="w-10 h-10 rounded-full mr-2"
            />
            <span className="font-bold">{review.userId?.username || "Người dùng"}</span>
          </div>
          <p>⭐ {review.rating} / 5</p>
          <p>{review.comment}</p>

          {user?._id === review.userId?._id && (
            <div className="flex gap-2 text-sm mt-1">
              <button
                onClick={() => {
                  setComment(review.comment);
                  setRating(review.rating);
                  setEditingReviewId(review._id);
                }}
                className="text-blue-500"
              >
                Sửa
              </button>
              <button
                onClick={() => handleDeleteReview(review._id)}
                className="text-red-500"
              >
                Xóa
              </button>
            </div>
          )}

          {/* --- Reply Section --- */}
          <div className="ml-6 mt-2">
            {review.replies?.map((reply) => (
              <div key={reply._id} className="border-l pl-3 mb-2">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">{reply.userId?.username || "Ẩn danh"}:</span>{" "}
                  {reply.comment}
                </p>
                {user?._id === reply.userId?._id && (
                  <div className="flex gap-2 text-xs mt-1">
                    <button
                      onClick={() => {
                        setReplyInput({ ...replyInput, [review._id]: reply.comment });
                        setEditingReplyId(reply._id);
                      }}
                      className="text-blue-500"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteReply(reply._id, review._id)}
                      className="text-red-500"
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Add reply input */}
            <textarea
              placeholder="Trả lời đánh giá..."
              className="border p-1 w-full mt-2 text-sm rounded"
              value={replyInput[review._id] || ""}
              onChange={(e) =>
                setReplyInput({ ...replyInput, [review._id]: e.target.value })
              }
            />
            <button
              onClick={() => handleReplySubmit(review._id)}
              className="text-blue-600 text-sm mt-1"
            >
              {editingReplyId ? "Cập nhật phản hồi" : "Gửi phản hồi"}
            </button>
          </div>
        </div>
      ))}

      {/* --- Add Review Form --- */}
      <form onSubmit={handleSubmit} className="mt-4">
        <label className="block font-bold">Đánh giá:</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="border p-2 rounded"
        >
          {[1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>
              {num} sao
            </option>
          ))}
        </select>

        <label className="block font-bold mt-2">Bình luận:</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 mt-3 rounded hover:bg-blue-700"
        >
          {editingReviewId ? "Cập nhật đánh giá" : "Gửi đánh giá"}
        </button>
      </form>
    </div>
  );
};

export default ReviewSection;
