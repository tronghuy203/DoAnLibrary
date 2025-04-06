import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getReviews, updateReview, deleteReview } from "../../redux/apiReview";
import { createAxios } from "../../createInstance";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const DocumentReviews = () => {
  const dispatch = useDispatch();
  const reviews = useSelector((state) => state.reviews.reviews);
  const loading = useSelector((state) => state.reviews.loading);
  const error = useSelector((state) => state.reviews.error);
  const user = useSelector((state) => state.auth.login.currentUser);

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [visibleReplies, setVisibleReplies] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 4;

  const axiosJWT = createAxios(user, dispatch);

  useEffect(() => {
    console.log("Calling getReviews with type: document, itemId: all");
    getReviews("document", "all", dispatch);

    if (user) {
      console.log("User is admin:", user.admin);
    }
  }, [dispatch, user]);

  const handleEdit = (review) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Bạn cần đăng nhập để sửa đánh giá!");
      return;
    }

    const updatedData = {
      rating: editRating,
      comment: editComment,
      userId: user._id,
      isAdmin: user?.admin || false,
    };

    try {
      await updateReview(editingReviewId, updatedData, user.accessToken, dispatch, axiosJWT);
      setEditingReviewId(null);
      getReviews("document", "all", dispatch);
    } catch (err) {
      console.error("Lỗi khi sửa đánh giá:", err);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!user) {
      alert("Bạn cần đăng nhập để xóa đánh giá!");
      return;
    }

    if (window.confirm("Bạn có chắc muốn xóa đánh giá này?")) {
      try {
        await deleteReview(reviewId, { userId: user._id, isAdmin: user?.admin || false }, user.accessToken, dispatch, axiosJWT);
        getReviews("document", "all", dispatch);
      } catch (err) {
        console.error("Lỗi khi xóa đánh giá:", err);
      }
    }
  };

  const toggleReplies = (reviewId) => {
    setVisibleReplies((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
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

  const getAvatarUrl = (user) => {
    return user?.avatar || `https://ui-avatars.com/api/?name=${user?.username || "Anonymous"}&background=random&size=40`;
  };

  if (loading) {
    return <div className="text-center text-gray-200 animate-pulse py-10 text-lg">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center text-red-400 py-10 animate-fade-in text-lg">Lỗi: {error}</div>;
  }

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const currentReviews = reviews.slice(startIndex, startIndex + reviewsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-gray-100 flex flex-col items-center py-12 px-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-cyan-400 mb-10 tracking-wide drop-shadow-md animate-fade-in-up">
        Quản Lý Đánh Giá Tài Liệu
      </h1>

      <div className="w-full max-w-4xl space-y-6">
        {reviews.length === 0 ? (
          <p className="text-gray-400 text-center italic animate-fade-in text-lg">Chưa có đánh giá nào</p>
        ) : (
          <div className="space-y-6">
            {currentReviews.map((review) => (
              <div
                key={review._id}
                className="bg-gray-800 rounded-xl shadow-md p-5 sm:p-6 border border-gray-700/50 
                  hover:shadow-2xl hover:bg-gray-750 hover:-translate-y-1 hover:border-cyan-500/30 
                  transform transition-all duration-300 ease-out animate-fade-in-up"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={getAvatarUrl(review.userId)}
                        alt="User Avatar"
                        className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500/50 
                          transition-all duration-300 hover:scale-110 hover:border-cyan-400"
                      />
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium transform transition-all duration-300 hover:text-cyan-400">
                          ID: {review._id}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400 font-medium transition-all duration-300 hover:text-cyan-400">
                          Người dùng: {review.userId?.username || "Ẩn danh"}
                        </p>
                      </div>
                    </div>
                    {editingReviewId === review._id ? (
                      <form onSubmit={handleUpdateReview} className="space-y-4 animate-fade-in">
                        <div className="flex gap-1.5">
                          {[...Array(5)].map((_, index) => {
                            const starValue = index + 1;
                            return (
                              <svg
                                key={starValue}
                                onClick={() => setEditRating(starValue)}
                                className={`w-7 h-7 cursor-pointer transition-all duration-200 hover:scale-110 
                                  ${starValue <= editRating ? "text-yellow-400 fill-current" : "text-gray-500 fill-none stroke-current"}`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                            );
                          })}
                        </div>
                        <textarea
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          className="w-full p-3 bg-gray-900 text-white border border-gray-600 rounded-lg 
                            focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300 
                            resize-none text-sm shadow-sm hover:border-cyan-500/50"
                          rows="3"
                          placeholder="Nhập bình luận của bạn..."
                        />
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 
                              text-white font-semibold py-2 px-5 rounded-lg transition-all duration-300 shadow-md 
                              hover:shadow-lg hover:scale-105 text-sm"
                          >
                            Lưu
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingReviewId(null)}
                            className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-5 
                              rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 text-sm"
                          >
                            Hủy
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        <div className="flex gap-1.5 mb-3">
                          {[...Array(5)].map((_, index) => {
                            const starValue = index + 1;
                            return (
                              <svg
                                key={starValue}
                                className={`w-5 h-5 transition-all duration-200 hover:scale-110 
                                  ${starValue <= review.rating ? "text-yellow-400 fill-current" : "text-gray-500 fill-none stroke-current"}`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                            );
                          })}
                        </div>
                        <p className="text-sm sm:text-base text-gray-200 leading-relaxed transition-all duration-300 hover:text-gray-100">
                          {review.comment}
                        </p>
                        {review.replies && review.replies.length > 0 && (
                          <div className="mt-4">
                            <button
                              onClick={() => toggleReplies(review._id)}
                              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 text-sm 
                                font-medium transition-all duration-200 hover:scale-105"
                            >
                              {visibleReplies[review._id] ? "Thu gọn" : `Xem phản hồi (${review.replies.length})`}
                              <svg
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  visibleReplies[review._id] ? "rotate-180" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {visibleReplies[review._id] && (
                              <div className="mt-3 space-y-3 animate-slide-down">
                                {review.replies.map((reply) => (
                                  <div
                                    key={reply._id}
                                    className="pl-4 py-2 bg-gray-700 rounded-lg text-sm text-gray-300 
                                      border-l-4 border-cyan-500 shadow-sm transition-all duration-200 
                                      hover:bg-gray-650 hover:-translate-x-1 flex items-start gap-3"
                                  >
                                    <img
                                      src={getAvatarUrl(reply.userId)}
                                      alt="Reply Avatar"
                                      className="w-8 h-8 rounded-full object-cover border-2 border-cyan-500/50 
                                        transition-all duration-300 hover:scale-110 hover:border-cyan-400"
                                    />
                                    <div>
                                      <p>
                                        <span className="font-semibold text-white transition-all duration-200 hover:text-cyan-300">
                                          {reply.userId?.username || "Ẩn danh"}:
                                        </span>{" "}
                                        {reply.comment}
                                      </p>
                                      <span className="text-xs text-gray-400 block mt-1 transition-all duration-200 hover:text-cyan-400">
                                        {reply.createdAt ? formatDate(reply.createdAt) : "Ngày không xác định"}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {editingReviewId !== review._id && (
                    <div className="flex flex-row sm:flex-col gap-3 self-start sm:self-center">
                      <button
                        onClick={() => handleEdit(review)}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-500 
                          hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-2 px-4 rounded-lg 
                          transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 text-sm"
                      >
                        <PencilIcon className="w-5 h-5" />
                        <span>Sửa</span>
                      </button>
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-500 
                          hover:from-red-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg 
                          transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 text-sm"
                      >
                        <TrashIcon className="w-5 h-5" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center mt-8 gap-3">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 shadow-md 
                      transform hover:scale-105 ${
                      currentPage === index + 1
                        ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-white scale-105"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentReviews;