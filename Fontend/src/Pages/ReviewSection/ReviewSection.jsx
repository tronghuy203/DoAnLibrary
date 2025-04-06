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

const ReviewSection = ({ type, itemId, user, onReviewsUpdate }) => {
  const dispatch = useDispatch();
  const { reviews, loading, error } = useSelector((state) => state.reviews);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [replyInput, setReplyInput] = useState({});
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [showOptions, setShowOptions] = useState({});
  const [showReplyOptions, setShowReplyOptions] = useState({});
  const [ratingStats, setRatingStats] = useState({});
  const [selectedRatingFilter, setSelectedRatingFilter] = useState(null);
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [visibleReplies, setVisibleReplies] = useState({}); // Default to 1 reply when toggled
  const [showRepliesForReview, setShowRepliesForReview] = useState({});

  let axiosJWT = createAxios(user, dispatch, loginSuccess);

  useEffect(() => {
    getReviews(type, itemId, dispatch);
  }, [dispatch, type, itemId]);

  useEffect(() => {
    if (reviews) {
      onReviewsUpdate(reviews);
      const stats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, total: reviews.length };
      reviews.forEach((review) => {
        stats[review.rating]++;
      });
      setRatingStats(stats);
    }
  }, [reviews, onReviewsUpdate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Bạn phải đăng nhập để đánh giá!");
      return;
    }
    if (rating === 0) {
      alert("Vui lòng chọn số sao để đánh giá!");
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
      setRating(0);
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

  const toggleOptions = (reviewId) => {
    setShowOptions((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const toggleReplyOptions = (replyId) => {
    setShowReplyOptions((prev) => ({
      ...prev,
      [replyId]: !prev[replyId],
    }));
  };

  const toggleShowReplies = (reviewId) => {
    setShowRepliesForReview((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
    // Set default to 1 reply when toggling on
    if (!showRepliesForReview[reviewId]) {
      setVisibleReplies((prev) => ({
        ...prev,
        [reviewId]: 1,
      }));
    }
  };

  const sortedReviews = reviews
    ? [...reviews].sort((a, b) => {
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
    : [];

  const filteredReviews = selectedRatingFilter
    ? sortedReviews.filter((review) => review.rating === selectedRatingFilter)
    : sortedReviews;

  const displayedReviews = filteredReviews.slice(0, visibleReviews);

  const handleShowMoreReviews = () => {
    setVisibleReviews(filteredReviews.length);
  };

  const handleCollapseReviews = () => {
    setVisibleReviews(3);
  };

  const handleShowMoreReplies = (reviewId) => {
    setVisibleReplies((prev) => ({
      ...prev,
      [reviewId]: reviews.find((r) => r._id === reviewId)?.replies.length || 0,
    }));
  };

  const handleCollapseReplies = (reviewId) => {
    setVisibleReplies((prev) => ({
      ...prev,
      [reviewId]: 1, // Collapse back to 1 reply
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const isAdmin = user?.admin === true;

  return (
    <div className="mt-6">
      <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white tracking-tight animate-fade-in">
        Đánh giá & Bình luận
      </h3>

      {loading && (
        <p className="text-gray-500 dark:text-gray-400 italic animate-pulse">Đang tải đánh giá...</p>
      )}
      {error && <p className="text-red-500 font-medium animate-fade-in">{error}</p>}

      {/* Rating Statistics */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 animate-fade-in">
        <h4 className="font-semibold mb-3 text-lg text-gray-900 dark:text-white">Phân loại đánh giá</h4>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setSelectedRatingFilter(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
              selectedRatingFilter === null
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Tất cả ({ratingStats.total})
          </button>
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              onClick={() => setSelectedRatingFilter(star === selectedRatingFilter ? null : star)}
              className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                selectedRatingFilter === star
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <span>{star} sao</span>
              <span>({ratingStats[star]})</span>
            </button>
          ))}
        </div>
      </div>

      {displayedReviews.map((review) => (
        <div
          key={review._id}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 animate-fade-in"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <img
                src={review.userId?.avatar || "https://via.placeholder.com/40"}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover border border-gray-300 dark:border-gray-600"
              />
              <div>
                <span className="font-semibold text-gray-900 dark:text-white block">
                  {review.userId?.username || "Người dùng"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {review.createdAt ? formatDate(review.createdAt) : "Ngày không xác định"}
                </span>
              </div>
            </div>
            {(user?._id === review.userId?._id || isAdmin) && (
              <div className="relative">
                <button
                  onClick={() => toggleOptions(review._id)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200 transform hover:scale-110"
                >
                  ⋮
                </button>
                {showOptions[review._id] && (
                  <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-700 animate-slide-down">
                    <button
                      onClick={() => {
                        setComment(review.comment);
                        setRating(review.rating);
                        setEditingReviewId(review._id);
                        setShowOptions({});
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteReview(review._id);
                        setShowOptions({});
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-1 mb-1">
            {[...Array(5)].map((_, index) => {
              const starValue = index + 1;
              return (
                <svg
                  key={starValue}
                  className={`w-5 h-5 ${
                    starValue <= review.rating
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300 dark:text-gray-600 fill-none stroke-current"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              );
            })}
          </div>
          <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>

          {/* Toggle Replies Button */}
          <div className="mt-2">
            <button
              onClick={() => toggleShowReplies(review._id)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-all duration-200 transform hover:scale-105"
            >
              <span>
                {showRepliesForReview[review._id] ? "Ẩn phản hồi" : `Xem tất cả phản hồi (${review.replies?.length || 0})`}
              </span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${showRepliesForReview[review._id] ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Replies Section (Shown only when toggled) */}
          {showRepliesForReview[review._id] && (
            <div className="ml-6 mt-3 animate-fade-in">
              {(review.replies || []).slice(0, visibleReplies[review._id] || 1).map((reply) => (
                <div
                  key={reply._id}
                  className="pl-3 mb-3 relative border-l-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 rounded-r-lg py-2 px-3 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800/70"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {reply.userId?.username || "Ẩn danh"}:
                        </span>{" "}
                        {reply.comment}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">
                        {reply.createdAt ? formatDate(reply.createdAt) : "Ngày không xác định"}
                      </span>
                    </div>
                    {(user?._id === reply.userId?._id || isAdmin) && (
                      <div className="relative">
                        <button
                          onClick={() => toggleReplyOptions(reply._id)}
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200 transform hover:scale-110"
                        >
                          ⋮
                        </button>
                        {showReplyOptions[reply._id] && (
                          <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lgA z-10 border border-gray-200 dark:border-gray-700 animate-slide-down">
                            <button
                              onClick={() => {
                                setReplyInput({ ...replyInput, [review._id]: reply.comment });
                                setEditingReplyId(reply._id);
                                setShowReplyOptions({});
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteReply(reply._id, review._id);
                                setShowReplyOptions({});
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                            >
                              Xóa
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {review.replies && review.replies.length > 1 && (
                <div className="text-sm mt-2 flex items-center gap-1">
                  {(visibleReplies[review._id] || 1) < review.replies.length ? (
                    <button
                      onClick={() => handleShowMoreReplies(review._id)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-all duration-200 transform hover:scale-105"
                    >
                      <span>Xem thêm phản hồi</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCollapseReplies(review._id)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-all duration-200 transform hover:scale-105"
                    >
                      <span>Thu gọn</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* Add reply input */}
              <textarea
                placeholder="Trả lời đánh giá..."
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-full mt-2 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300"
                value={replyInput[review._id] || ""}
                onChange={(e) => setReplyInput({ ...replyInput, [review._id]: e.target.value })}
              />
              <button
                onClick={() => handleReplySubmit(review._id)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm mt-1 font-medium transition-all duration-200 transform hover:scale-105"
              >
                {editingReplyId ? "Cập nhật phản hồi" : "Gửi phản hồi"}
              </button>
            </div>
          )}
        </div>
      ))}

      {filteredReviews.length > 3 && (
        <div className="mt-4 flex items-center gap-1 animate-fade-in">
          {visibleReviews < filteredReviews.length ? (
            <button
              onClick={handleShowMoreReviews}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 font-medium transition-all duration-200 transform hover:scale-105"
            >
              <span>Xem thêm đánh giá</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleCollapseReviews}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 font-medium transition-all duration-200 transform hover:scale-105"
            >
              <span>Thu gọn</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Add Review Form */}
      <form
        onSubmit={handleSubmit}
        className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 animate-fade-in"
      >
        <label className="block font-semibold text-gray-900 dark:text-white mb-2">Đánh giá:</label>
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, index) => {
            const starValue = index + 1;
            return (
              <svg
                key={starValue}
                onClick={() => setRating(starValue)}
                onMouseEnter={() => setHoverRating(starValue)}
                onMouseLeave={() => setHoverRating(0)}
                className={`w-8 h-8 cursor-pointer transition-all duration-200 transform hover:scale-110 ${
                  starValue <= (hoverRating || rating)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300 dark:text-gray-600 fill-none stroke-current"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            );
          })}
        </div>

        <label className="block font-semibold text-gray-900 dark:text-white mb-2">Bình luận:</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300"
          rows="4"
          placeholder="Viết bình luận của bạn..."
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 mt-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
        >
          {editingReviewId ? "Cập nhật đánh giá" : "Gửi đánh giá"}
        </button>
      </form>
    </div>
  );
};

export default ReviewSection;