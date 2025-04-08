import { useEffect, useState, useRef } from "react"; // Thêm useRef
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getBookDetail } from "../../redux/apiBooks";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { FaShareAlt, FaFacebook, FaInstagram, FaComment } from "react-icons/fa";
import ReviewSection from "../ReviewSection/ReviewSection";

const DetailBook = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.login?.currentUser);
  const book = useSelector((state) => state.books.detailBook);
  const axiosJWT = createAxios(user, dispatch, loginSuccess);

  const [activeTab, setActiveTab] = useState("Mô tả");
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const shareRef = useRef(null); // Ref để kiểm tra click ngoài

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    getBookDetail(id, user.accessToken, dispatch, axiosJWT);
  }, [id, user, dispatch, axiosJWT, navigate]);

  // Xử lý click ngoài để tắt dropdown
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
        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Book Image */}
          <div data-aos="fade-right" className="flex-shrink-0 mx-auto md:mx-0">
            <img
              src={book.image || "https://via.placeholder.com/150"}
              alt={book.title}
              className="w-64 sm:w-72 md:w-80 h-auto object-cover rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Book Details */}
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
                {book.category || "Không rõ"}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-6 h-6 ${
                      i < Math.round(averageRating) ? "fill-current" : "fill-none stroke-current"
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
                <span className="font-semibold">Ngày xuất bản:</span>{" "}
                {book.publishDate || "Không rõ"}
              </span>
              <span>
                <span className="font-semibold">Đã bán:</span>{" "}
                {book.sold || "0"} bản
              </span>
              <span>
                <span className="font-semibold">Đăng ngày:</span>{" "}
                {book.createdAt ? formatDate(book.createdAt) : "Không rõ"}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 relative">
              <Link to="/cart">
                <button className="bg-orange-500 text-white font-semibold py-3 px-8 rounded-lg hover:bg-orange-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1">
                  Mua ngay
                </button>
              </Link>
              <div className="mt-3 relative">
                <button
                  onClick={() => setShowShareOptions(!showShareOptions)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-2"
                >
                  <FaShareAlt className="w-5 h-5" />
                  Chia sẻ
                </button>
                {/* Dropdown menu */}
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

        {/* Tabs */}
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
                      document.getElementById("review-section")?.scrollIntoView({
                        behavior: "smooth",
                      });
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

          {/* Tab Content */}
          <div className="mt-6 text-gray-700 dark:text-gray-300">
            {activeTab === "Mô tả" && (
              <div data-aos="fade-in">
                <p className="leading-relaxed">
                  {book.description || "Không có mô tả"}
                </p>
              </div>
            )}
            {activeTab === "Nội dung" && null}
            {activeTab === "Nội dung đánh giá" && null}
            {activeTab === "Đề xuất" && (
              <div data-aos="fade-in">
                <p className="leading-relaxed">
                  Bạn có thể quan tâm đến các sách sau:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Vở bài tập Toán 2 - Bộ sách Chân trời sáng tạo</li>
                  <li>Sách bài tập Hình học cơ bản cho học sinh tiểu học</li>
                  <li>100 bài toán thực tế cho trẻ em</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div id="review-section">
          <ReviewSection
            type="book"
            itemId={book._id}
            user={user}
            onReviewsUpdate={(reviews) => {
              setAverageRating(calculateAverageRating(reviews));
              setReviewCount(reviews.length);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DetailBook;