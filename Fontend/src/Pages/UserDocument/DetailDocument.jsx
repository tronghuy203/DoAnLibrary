import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { getDocumentDetail, downloadDocument } from "../../redux/apiDocument";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { pdfjs } from "react-pdf";
import { FaShareAlt, FaFacebook, FaInstagram, FaComment } from "react-icons/fa";
import ReviewSection from "../ReviewSection/ReviewSection";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.0.279/build/pdf.worker.min.js`;

const DetailDocument = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.login?.currentUser);

  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  const [docData, setDocData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [activeTab, setActiveTab] = useState("Mô tả");
  const [showShareOptions, setShowShareOptions] = useState(false);
  const shareRef = useRef(null); 

  useEffect(() => {
    const fetchDocument = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      if (!user?.accessToken) {
        setError("Bạn cần đăng nhập để xem tài liệu này.");
        setIsLoading(false);
        return;
      }

      try {
        const res = await getDocumentDetail(id, user.accessToken, dispatch, axiosJWT);
        if (res) {
          setDocData(res);
        } else {
          setError("Không tìm thấy tài liệu.");
        }
      } catch (err) {
        setError("Lỗi khi lấy thông tin tài liệu. Vui lòng thử lại.");
        console.error("Lỗi fetch document:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [user, navigate, id, dispatch, axiosJWT]);

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

  const handleDownload = () => {
    if (!docData) {
      setError("Không có tài liệu để tải xuống.");
      return;
    }
    downloadDocument(id, user.accessToken, docData.title, dispatch, axiosJWT).catch((err) => {
      console.error("Lỗi khi tải xuống:", err);
      setError("Không thể tải tài liệu xuống. Vui lòng thử lại.");
    });
  };

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const shareToSocialMedia = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(docData.title);
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-t-blue-600 dark:border-t-blue-400 border-gray-300 dark:border-gray-700 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <p className="text-red-500 dark:text-red-400 text-center text-lg font-medium">{error}</p>
        ) : !docData ? (
          <p className="text-gray-600 dark:text-gray-400 text-center text-lg font-medium">
            Không tìm thấy tài liệu.
          </p>
        ) : (
          <>
            {/* Header Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
                {docData.title}
              </h2>
              <div className="flex items-center gap-4 mb-4">
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
              </div>
              <div className="text-gray-600 dark:text-gray-400 mb-4">
                <span className="font-semibold">Đăng ngày:</span>{" "}
                {docData.createdAt ? formatDate(docData.createdAt) : "Không rõ"}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 relative">
                <button
                  onClick={handleDownload}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-500 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Tải xuống tài liệu
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowShareOptions(!showShareOptions)}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-2 mt-2"
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

              <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex">
                  {["Mô tả", "Nội dung", "Đánh giá", "Đề xuất"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        if (tab === "Đánh giá") {
                          setTimeout(() => {
                            scrollToReviewForm();
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
              </div>

              <div className="mt-4 text-gray-700 dark:text-gray-300">
                {activeTab === "Mô tả" && (
                  <p className="leading-relaxed">
                    {docData.description || "Không có mô tả"}
                  </p>
                )}
                {activeTab === "Nội dung" && (
                  <p className="leading-relaxed">
                    Nội dung tài liệu sẽ được hiển thị trong phần xem trước bên dưới.
                  </p>
                )}
                {activeTab === "Đánh giá" && null}
                {activeTab === "Đề xuất" && (
                  <div>
                    <p className="leading-relaxed">
                      Bạn có thể quan tâm đến các tài liệu sau:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Tài liệu hướng dẫn học tập hiệu quả</li>
                      <li>Bộ đề thi thử THPT Quốc gia</li>
                      <li>Sổ tay kiến thức cơ bản cho học sinh</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {docData.fileUrl && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Xem trước tài liệu
                </h3>
                <div
                  className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-800"
                  style={{ height: "600px" }}
                >
                  <Worker workerUrl={pdfjs.GlobalWorkerOptions.workerSrc}>
                    <Viewer
                      fileUrl={docData.fileUrl}
                      defaultScale={1.0}
                      theme={{ theme: "auto" }}
                      scrollMode="vertical"
                    />
                  </Worker>
                </div>
              </div>
            )}

            {/* Review Section */}
            <div id="review-section">
              <ReviewSection
                type="document"
                itemId={docData._id}
                user={user}
                onReviewsUpdate={(reviews) => {
                  setAverageRating(calculateAverageRating(reviews));
                  setReviewCount(reviews.length);
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DetailDocument;