import React, { useEffect, useState, useRef } from "react";
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
  const [visibleReplies, setVisibleReplies] = useState({});
  const [showRepliesForReview, setShowRepliesForReview] = useState({});
  const [showReportForm, setShowReportForm] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [likes, setLikes] = useState({});
  const [dislikes, setDislikes] = useState({});
  const optionsRef = useRef({});
  const replyOptionsRef = useRef({});
  const commentRef = useRef(null);
  const replyRefs = useRef({});

  let axiosJWT = createAxios(user, dispatch, loginSuccess);

  useEffect(() => {
    getReviews(type, itemId, dispatch);
  }, [dispatch, type, itemId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(showOptions).forEach((reviewId) => {
        if (
          optionsRef.current[reviewId] &&
          !optionsRef.current[reviewId].contains(event.target)
        ) {
          setShowOptions((prev) => ({ ...prev, [reviewId]: false }));
        }
      });
      Object.keys(showReplyOptions).forEach((replyId) => {
        if (
          replyOptionsRef.current[replyId] &&
          !replyOptionsRef.current[replyId].contains(event.target)
        ) {
          setShowReplyOptions((prev) => ({ ...prev, [replyId]: false }));
        }
      });
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showOptions, showReplyOptions]);

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

  const handleEditReview = (review) => {
    setComment(review.comment);
    setRating(review.rating);
    setEditingReviewId(review._id);
    setShowOptions({});
    commentRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleEditReply = (reviewId, reply) => {
    setReplyInput({ ...replyInput, [reviewId]: reply.comment });
    setEditingReplyId(reply._id);
    setShowReplyOptions({});
    replyRefs.current[reply._id]?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmitReport = (id, isReply = false) => {
    if (!reportReason) {
      alert("Vui lòng nhập lý do báo cáo!");
      return;
    }
    console.log(`Báo cáo ${isReply ? "phản hồi" : "đánh giá"} ID: ${id}, Lý do: ${reportReason}`);
    setShowReportForm(null);
    setReportReason("");
  };

  const handleLike = (id, isReply = false) => {
    setLikes((prev) => ({
      ...prev,
      [id]: prev[id] === 1 ? 0 : 1,
    }));
    setDislikes((prev) => ({
      ...prev,
      [id]: prev[id] === 1 ? 0 : prev[id],
    }));
  };

  const handleDislike = (id, isReply = false) => {
    setDislikes((prev) => ({
      ...prev,
      [id]: prev[id] === 1 ? 0 : 1,
    }));
    setLikes((prev) => ({
      ...prev,
      [id]: prev[id] === 1 ? 0 : prev[id],
    }));
  };

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

    const reviewData = { type, itemId, rating, comment, userId: user._id };

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
    if (!showRepliesForReview[reviewId]) {
      setVisibleReplies((prev) => ({
        ...prev,
        [reviewId]: 1,
      }));
    }
  };

  const sortedReviews = reviews
    ? [...reviews].sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
    : [];

  const filteredReviews = selectedRatingFilter
    ? sortedReviews.filter((review) => review.rating === selectedRatingFilter)
    : sortedReviews;

  const displayedReviews = filteredReviews.slice(0, visibleReviews);

  const handleShowMoreReviews = () => setVisibleReviews(filteredReviews.length);
  const handleCollapseReviews = () => setVisibleReviews(3);
  const handleShowMoreReplies = (reviewId) =>
    setVisibleReplies((prev) => ({
      ...prev,
      [reviewId]: reviews.find((r) => r._id === reviewId)?.replies.length || 0,
    }));
  const handleCollapseReplies = (reviewId) =>
    setVisibleReplies((prev) => ({ ...prev, [reviewId]: 1 }));

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
              <div className="relative" ref={(el) => (optionsRef.current[review._id] = el)}>
                <button
                  onClick={() => toggleOptions(review._id)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200 transform hover:scale-110"
                >
                  ⋮
                </button>
                {showOptions[review._id] && (
                  <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-700 animate-slide-down">
                    <button
                      onClick={() => handleEditReview(review)}
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
                    <button
                      onClick={() => setShowReportForm(review._id)}
                      className="block w-full text-left px-4 py-2 text-sm text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      Báo cáo
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

          <div className="flex gap-4 mt-2">
            <button
              onClick={() => handleLike(review._id)}
              className={`flex items-center gap-1 transition-colors ${
                likes[review._id] === 1
                  ? "text-blue-500"
                  : "text-gray-500 hover:text-blue-500"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"/>
              </svg>
              <span>Thích ({likes[review._id] || 0})</span>
            </button>
            <button
              onClick={() => handleDislike(review._id)}
              className={`flex items-center gap-1 transition-colors ${
                dislikes[review._id] === 1
                  ? "text-red-500"
                  : "text-gray-500 hover:text-red-500"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
              </svg>
              <span>Không thích ({dislikes[review._id] || 0})</span>
            </button>
            <button
              onClick={() => toggleShowReplies(review._id)}
              className="flex items-center gap-1 text-gray-500 hover:text-green-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
              </svg>
              <span>Phản hồi</span>
            </button>
          </div>

          {review.replies?.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => toggleShowReplies(review._id)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-all duration-200 transform hover:scale-105"
              >
                <span>
                  {showRepliesForReview[review._id]
                    ? "Ẩn phản hồi"
                    : `Xem tất cả phản hồi (${review.replies.length})`}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    showRepliesForReview[review._id] ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}

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
                      <div className="relative" ref={(el) => (replyOptionsRef.current[reply._id] = el)}>
                        <button
                          onClick={() => toggleReplyOptions(reply._id)}
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200 transform hover:scale-110"
                        >
                          ⋮
                        </button>
                        {showReplyOptions[reply._id] && (
                          <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-700 animate-slide-down">
                            <button
                              onClick={() => handleEditReply(review._id, reply)}
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
                            <button
                              onClick={() => setShowReportForm(reply._id)}
                              className="block w-full text-left px-4 py-2 text-sm text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                            >
                              Báo cáo
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4 mt-2">
                    <button
                      onClick={() => handleLike(reply._id, true)}
                      className={`flex items-center gap-1 transition-colors ${
                        likes[reply._id] === 1
                          ? "text-blue-500"
                          : "text-gray-500 hover:text-blue-500"
                      }`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"/>
                      </svg>
                      <span>Thích ({likes[reply._id] || 0})</span>
                    </button>
                    <button
                      onClick={() => handleDislike(reply._id, true)}
                      className={`flex items-center gap-1 transition-colors ${
                        dislikes[reply._id] === 1
                          ? "text-red-500"
                          : "text-gray-500 hover:text-red-500"
                      }`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14-.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
                      </svg>
                      <span>Không thích ({dislikes[reply._id] || 0})</span>
                    </button>
                    <button
                      onClick={() => toggleShowReplies(review._id)}
                      className="flex items-center gap-1 text-gray-500 hover:text-green-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                      </svg>
                      <span>Phản hồi</span>
                    </button>
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

              <textarea
                ref={(el) => (replyRefs.current[review._id] = el)}
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

          {showReportForm === review._id && (
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
              <h4 className="font-semibold text-gray-900 dark:text-white">Báo cáo đánh giá</h4>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full mt-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Lý do báo cáo..."
                rows="3"
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleSubmitReport(review._id)}
                  className="bg-orange-500 text-white px-4 py-1 rounded-lg hover:bg-orange-600"
                >
                  Gửi báo cáo
                </button>
                <button
                  onClick={() => setShowReportForm(null)}
                  className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-1 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Hủy
                </button>
              </div>
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
          ref={commentRef}
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

      {showReportForm && !filteredReviews.some((r) => r._id === showReportForm) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96 animate-fade-in border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Báo cáo phản hồi</h4>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Lý do báo cáo..."
              rows="4"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleSubmitReport(showReportForm, true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
              >
                Gửi báo cáo
              </button>
              <button
                onClick={() => setShowReportForm(null)}
                className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;