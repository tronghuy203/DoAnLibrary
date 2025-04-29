import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getReviews, updateReview, deleteReview } from "../../redux/apiReview";
import { createAxios } from "../../createInstance";
import { PencilIcon, TrashIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

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
    getReviews("document", "all", dispatch);
  }, [dispatch]);

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
    return (
      <div className="text-center text-gray-500 dark:text-gray-300 animate-pulse py-10 text-lg">
        Đang tải...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 dark:text-red-400 py-10 animate-fade-in text-lg">
        Lỗi: {error}
      </div>
    );
  }

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const currentReviews = reviews.slice(startIndex, startIndex + reviewsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col items-center py-12 px-4 sm:px-8 lg:px-12 transition-all duration-500 ease-in-out relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/40 via-blue-200/30 to-purple-200/40 dark:from-cyan-800/30 dark:via-blue-800/30 dark:to-purple-800/30 animate-gradient-slow"></div>
        <div className="absolute top-[-15%] left-[-15%] w-80 h-80 bg-cyan-400/20 dark:bg-cyan-600/15 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-blue-400/20 dark:bg-blue-600/15 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-[50%] left-[70%] w-64 h-64 bg-purple-400/20 dark:bg-purple-600/15 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-[10%] right-[20%] w-56 h-56 bg-cyan-300/20 dark:bg-cyan-500/15 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute inset-0">
          <div className="absolute w-3 h-3 bg-cyan-500/50 dark:bg-cyan-400/40 rounded-full top-[15%] left-[10%] animate-particle"></div>
          <div className="absolute w-2 h-2 bg-blue-500/50 dark:bg-blue-400/40 rounded-full top-[45%] left-[75%] animate-particle-slow"></div>
          <div className="absolute w-3 h-3 bg-purple-500/50 dark:bg-purple-400/40 rounded-full top-[65%] left-[25%] animate-particle"></div>
          <div className="absolute w-2 h-2 bg-cyan-500/50 dark:bg-cyan-400/40 rounded-full top-[5%] left-[55%] animate-particle-slow"></div>
          <div className="absolute w-3 h-3 bg-blue-500/50 dark:bg-blue-400/40 rounded-full top-[30%] left-[85%] animate-particle"></div>
        </div>
        <svg className="absolute bottom-0 left-0 w-full h-48 text-cyan-300/30 dark:text-cyan-700/30" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,186.7C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        <div className="text-center mb-10 animate-slide-up">
          <DocumentTextIcon className="w-16 h-16 mx-auto text-cyan-600 dark:text-cyan-400 mb-3 animate-pulse" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-cyan-600 dark:text-cyan-400 tracking-tight drop-shadow-lg">
            Quản Lý Đánh Giá Tài Liệu
          </h1>
          <p className="mt-2 text-lg sm:text-xl text-gray-600 dark:text-gray-300">
            Xem và quản lý các đánh giá tài liệu của bạn
          </p>
        </div>

        {reviews.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center italic animate-fade-in text-lg">
            Chưa có đánh giá nào
          </p>
        ) : (
          <div className="space-y-6">
            {currentReviews.map((review) => (
              <div
                key={review._id}
                className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] animate-slide-up"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={getAvatarUrl(review.userId)}
                        alt="User Avatar"
                        className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500/50 dark:border-cyan-400/50 transition-all duration-300 hover:scale-110"
                      />
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                          ID: {review._id}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
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
                                className={`w-7 h-7 cursor-pointer transition-all duration-200 hover:scale-110 ${
                                  starValue <= editRating
                                    ? "text-yellow-400 dark:text-yellow-300 fill-current"
                                    : "text-gray-400 dark:text-gray-500 fill-none stroke-current"
                                }`}
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
                          className="w-full p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 hover:bg-gradient-to-r hover:from-gray-100/80 hover:to-gray-50/80 dark:hover:from-gray-750/80 dark:hover:to-gray-700/80"
                          placeholder="Nhập bình luận của bạn..."
                          rows="3"
                        />
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            className="bg-gradient-to-r from-cyan-500 dark:from-cyan-400 to-teal-500 dark:to-teal-400 hover:from-cyan-600 dark:hover:from-cyan-500 hover:to-teal-600 dark:hover:to-teal-500 text-white font-semibold py-2 px-5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 text-sm"
                          >
                            Lưu
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingReviewId(null)}
                            className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-gray-100 font-semibold py-2 px-5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 text-sm"
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
                                className={`w-5 h-5 transition-all duration-200 hover:scale-110 ${
                                  starValue <= review.rating
                                    ? "text-yellow-400 dark:text-yellow-300 fill-current"
                                    : "text-gray-400 dark:text-gray-500 fill-none stroke-current"
                                }`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                            );
                          })}
                        </div>
                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200 leading-relaxed">
                          {review.comment}
                        </p>
                        {review.replies && review.replies.length > 0 && (
                          <div className="mt-4">
                            <button
                              onClick={() => toggleReplies(review._id)}
                              className="text-cyan-500 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 flex items-center gap-1.5 text-sm font-medium transition-all duration-200 hover:scale-105"
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
                                    className="pl-4 py-2 bg-gray-100/80 dark:bg-gray-700/80 rounded-lg text-sm text-gray-600 dark:text-gray-300 border-l-4 border-cyan-500 dark:border-cyan-400 shadow-sm transition-all duration-200 hover:bg-gray-200/80 dark:hover:bg-gray-650/80"
                                  >
                                    <div className="flex items-start gap-3">
                                      <img
                                        src={getAvatarUrl(reply.userId)}
                                        alt="Reply Avatar"
                                        className="w-8 h-8 rounded-full object-cover border-2 border-cyan-500/50 dark:border-cyan-400/50 transition-all duration-300 hover:scale-110"
                                      />
                                      <div>
                                        <p>
                                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                                            {reply.userId?.username || "Ẩn danh"}:
                                          </span>{" "}
                                          {reply.comment}
                                        </p>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">
                                          {reply.createdAt ? formatDate(reply.createdAt) : "Ngày không xác định"}
                                        </span>
                                      </div>
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
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 dark:from-amber-400 to-amber-600 dark:to-amber-500 hover:from-amber-600 dark:hover:from-amber-500 hover:to-orange-700 dark:hover:to-orange-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 text-sm"
                      >
                        <PencilIcon className="w-5 h-5" />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 dark:from-red-400 to-red-600 dark:to-red-500 hover:from-red-600 dark:hover:from-red-500 hover:to-pink-700 dark:hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 text-sm"
                      >
                        <TrashIcon className="w-5 h-5" />
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center mt-8 gap-3 animate-slide-up">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 shadow-md transform hover:scale-105 ${
                      currentPage === index + 1
                        ? "bg-gradient-to-r from-cyan-500 dark:from-cyan-400 to-teal-500 dark:to-teal-400 text-white"
                        : "bg-gray-200/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 hover:bg-gray-300/80 dark:hover:bg-gray-600/80 hover:text-gray-900 dark:hover:text-white"
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