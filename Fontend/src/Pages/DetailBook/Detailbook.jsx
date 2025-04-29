import { useEffect, useState, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getBookDetail } from "../../redux/apiBooks";
import { getCategory } from "../../redux/apiCategory";
import { createAxios } from "../../createInstance";
import { FaShareAlt, FaFacebook, FaInstagram, FaComment } from "react-icons/fa";
import ReviewSection from "../ReviewSection/ReviewSection";
import { requestBorrow } from "../../redux/apiBorrow";

const DetailBook = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.login?.currentUser);
  const book = useSelector((state) => state.books.detailBook);
  const allBooks = useSelector((state) => state.books.allBooks);
  const categories = useSelector((state) => state.categories.allCategories);
  const axiosJWT = useMemo(() => createAxios(user, dispatch), [user, dispatch]);

  const [activeTab, setActiveTab] = useState("Mô tả");
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [recommendedRatings, setRecommendedRatings] = useState({});
  const shareRef = useRef(null);
  const recommendedRef = useRef(null);

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return { rating: 0, count: 0 };
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return {
      rating: (total / reviews.length).toFixed(1),
      count: reviews.length,
    };
  };

  const categoryMap = useMemo(() => {
    const map = {};
    categories?.forEach((cat) => {
      map[cat._id] = cat.name;
    });
    return map;
  }, [categories]);

  const recommendedBooks = useMemo(() => {
    if (!book || !allBooks) return [];
    return allBooks.filter(
      (b) =>
        b._id !== book._id &&
        (b.author === book.author || b.category === book.category)
    );
  }, [book, allBooks]);

  const handleBorrowRequest = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!book._id || !user.accessToken) {
      alert("Thiếu thông tin sách hoặc token. Vui lòng đăng nhập lại!");
      return;
    }

    try {
      const borrowData = await requestBorrow(book._id, user.accessToken, dispatch, axiosJWT);
      if (!borrowData._id) {
        throw new Error("Không nhận được requestId từ server!");
      }
      navigate(`/payment/${borrowData._id}`);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi khi gửi yêu cầu mượn sách. Vui lòng thử lại!";
      if (error.response?.status === 403 && errorMessage.includes("khoản phạt chưa thanh toán")) {
        alert(`${errorMessage} Nhấn OK để xem và thanh toán các khoản phạt.`);
        navigate("/history");
      } else {
        alert(errorMessage);
      }
      console.error("Lỗi khi mượn sách:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        await getCategory(user.accessToken, dispatch, axiosJWT);
        await getBookDetail(id, user.accessToken, dispatch, axiosJWT);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };

    fetchData();
  }, [id, user, user?.accessToken, dispatch, navigate, axiosJWT]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareRef.current && !shareRef.current.contains(event.target)) {
        setShowShareOptions(false);
      }
    };

    if (showShareOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showShareOptions]);

  const shareToSocialMedia = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(book.title);
    let shareUrl;

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&title=${title}`;
        break;
      case "instagram":
        shareUrl = `https://www.instagram.com/`;
        alert("Hãy sao chép liên kết và chia sẻ trên Instagram!");
        break;
      case "zalo":
        shareUrl = `https://zalo.me/share?url=${url}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
    setShowShareOptions(false);
  };

  const scrollToReviewForm = () => {
    const reviewForm = document.querySelector("#review-section form");
    if (reviewForm) {
      reviewForm.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToRecommended = () => {
    recommendedRef.current?.scrollIntoView({ behavior: "smooth" });
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

  const handleBookClick = (bookId) => {
    navigate(`/books/${bookId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateRecommendedRatings = (bookId, reviews) => {
    const { rating, count } = calculateAverageRating(reviews);
    setRecommendedRatings((prev) => ({
      ...prev,
      [bookId]: { rating, count },
    }));
  };

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-black dark:text-white transition-all duration-300">
        <p className="text-gray-600 dark:text-gray-400 text-lg italic font-serif animate-fade-in">
          Đang tải sách...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white px-4 sm:px-8 md:px-12 lg:px-16 py-32 transition-all duration-300">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          <div data-aos="fade-right" className="flex-shrink-0 mx-auto md:mx-0">
            <img
              src={book.image || "https://png.pngtree.com/png-vector/20220220/ourmid/pngtree-vector-design-with-pattern-element-for-minimalisticluxurious-cover-menu-invitation-card-bannerbook-vector-png-image_34179868.jpg"}
              alt={book.title}
              className="w-64 sm:w-72 md:w-80 h-auto object-cover rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-transform duration-300 hover:scale-105"
            />
          </div>

          <div
            data-aos="fade-left"
            className="flex-1 flex flex-col space-y-6 bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <h4 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {book.title}
            </h4>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <span className="text-lg text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Tác giả:</span>{" "}
                {book.author || "Không rõ"}
              </span>
              <span className="text-lg text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Thể loại:</span>{" "}
                {categoryMap[book.category] || "Không rõ"}
              </span>
            </div>
            <span className="text-lg text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Số lượng:</span>{" "}
              {book.quantity || "Không rõ"}
            </span>
            <div className="flex items-center gap-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-6 h-6 ${
                      i < Math.round(averageRating)
                        ? "fill-current"
                        : "fill-none stroke-current"
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-600 dark:text-gray-400">
                ({averageRating}/5) - {reviewCount} đánh giá
              </span>
              <span className="text-orange-500 font-semibold text-2xl">
                {book.price.toLocaleString("vi-VN")} ₫
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 text-gray-600 dark:text-gray-400 text-base">
              <span>
                <span className="font-semibold">Năm xuất bản:</span>{" "}
                {book.publishedYear || "Không rõ"}
              </span>
              <span>
                <span className="font-semibold">Đã mượn:</span>{" "}
                {book.sold || "0"} lượt
              </span>
              <span>
                <span className="font-semibold">Đăng ngày:</span>{" "}
                {book.createdAt ? formatDate(book.createdAt) : "Không rõ"}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 relative">
              <button
                onClick={handleBorrowRequest}
                className="bg-orange-500 text-white font-semibold py-3 px-8 rounded-lg hover:bg-orange-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
              >
                Mượn sách ngay
              </button>
              <div className="mt-3 relative">
                <button
                  onClick={() => setShowShareOptions(!showShareOptions)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-2"
                >
                  <FaShareAlt className="w-5 h-5" />
                  Chia sẻ
                </button>
                {showShareOptions && (
                  <div
                    ref={shareRef}
                    className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-700 animate-fade-in"
                  >
                    <button
                      onClick={() => shareToSocialMedia("facebook")}
                      className="flex items-center gap-2 w-full px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-t-lg transition-all duration-200"
                    >
                      <FaFacebook className="w-5 h-5" />
                      Facebook
                    </button>
                    <button
                      onClick={() => shareToSocialMedia("instagram")}
                      className="flex items-center gap-2 w-full px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                    >
                      <FaInstagram className="w-5 h-5" />
                      Instagram
                    </button>
                    <button
                      onClick={() => shareToSocialMedia("zalo")}
                      className="flex items-center gap-2 w-full px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-b-lg transition-all duration-200"
                    >
                      <FaComment className="w-5 h-5" />
                      Zalo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          data-aos="fade-up"
          className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {["Mô tả", "Nội dung đánh giá", "Đánh giá", "Đề xuất"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === "Đánh giá") {
                    setTimeout(() => {
                      scrollToReviewForm();
                    }, 100);
                  } else if (tab === "Nội dung đánh giá") {
                    setTimeout(() => {
                      document
                        .getElementById("review-section")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  } else if (tab === "Đề xuất") {
                    setTimeout(() => {
                      scrollToRecommended();
                    }, 100);
                  }
                }}
                className={`px-4 py-2 text-base font-semibold transition-all duration-300 ${
                  activeTab === tab
                    ? "text-green-500 border-b-2 border-green-500"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-6 text-gray-700 dark:text-gray-300">
            {activeTab === "Mô tả" && (
              <div data-aos="fade-in">
                <p className="leading-relaxed">
                  {book.description || "Không có mô tả"}
                </p>
              </div>
            )}
            {activeTab === "Nội dung đánh giá" && null}
            {activeTab === "Đề xuất" && null}
          </div>
        </div>

        <div id="review-section">
          <ReviewSection
            type="book"
            itemId={book._id}
            user={user}
            onReviewsUpdate={(reviews) => {
              const { rating, count } = calculateAverageRating(reviews);
              setAverageRating(rating);
              setReviewCount(count);
              recommendedBooks.forEach((recBook) => {
                if (recBook._id === book._id) {
                  updateRecommendedRatings(recBook._id, reviews);
                }
              });
            }}
          />
        </div>

        <div ref={recommendedRef} className="mt-8">
          <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white tracking-tight animate-fade-in">
            Sách đề xuất (cùng tác giả hoặc thể loại)
          </h3>
          {recommendedBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {recommendedBooks.map((recBook) => {
                recommendedRatings[recBook._id] ||
                  calculateAverageRating(recBook.reviews || []);
                return (
                  <div
                    key={recBook._id}
                    onClick={() => handleBookClick(recBook._id)}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  >
                    <img
                      src={recBook.image || "https://png.pngtree.com/png-vector/20220220/ourmid/pngtree-vector-design-with-pattern-element-for-minimalisticluxurious-cover-menu-invitation-card-bannerbook-vector-png-image_34179868.jpg"}
                      alt={recBook.title}
                      className="w-full h-80 object-cover rounded-md mb-2"
                    />
                    <h5 className="text-xl font-semibold truncate text-gray-900 dark:text-white">
                      {recBook.title}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tác giả: {recBook.author || "Không rõ"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Thể loại: {categoryMap[recBook.category] || "Không rõ"}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 animate-fade-in text-center">
              Không có sách đề xuất nào phù hợp.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailBook;