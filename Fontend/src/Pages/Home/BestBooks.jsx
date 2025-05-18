import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getAllReviewStats } from "../../redux/apiReview";
import { getAllBooks } from "../../redux/apiBooks";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";

const BestBooks = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login?.currentUser);
  const books = useSelector((state) => state.books.allBooks);
  const [reviewStats, setReviewStats] = useState({});
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [errorReviews, setErrorReviews] = useState(null);

  const axiosJWT = useMemo(
    () => createAxios(user, dispatch, loginSuccess),
    [user, dispatch]
  );

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!books.length) {
      getAllBooks(user.accessToken, dispatch, axiosJWT);
    }
  }, [dispatch, books, user, navigate, axiosJWT]);

  useEffect(() => {
    if (books.length > 0) {
      fetchReviewStats();
    }
  }, [books]);

  const fetchReviewStats = async () => {
    setIsLoadingReviews(true);
    setErrorReviews(null);
    try {
      const stats = await getAllReviewStats("book", user.accessToken, dispatch, axiosJWT);
      setReviewStats(stats);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê đánh giá:", error);
      setErrorReviews("Không thể tải đánh giá. Vui lòng thử lại sau.");
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const topBooksSorted = useMemo(() => {
    if (!books.length) return [];

    return [...books]
      .map((book) => ({
        ...book,
        averageRating: parseFloat(reviewStats[book._id]?.averageRating || 0),
      }))
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 3);
  }, [books, reviewStats]);

  const topBooks = useMemo(() => {
    if (topBooksSorted.length < 3) return topBooksSorted;
    return [topBooksSorted[1], topBooksSorted[0], topBooksSorted[2]];
  }, [topBooksSorted]);

  const handleOrderClick = () => {
    navigate("/all-books");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="py-10 bg-white flex justify-center items-center dark:bg-zinc-900 dark:text-white duration-200">
      <div className="container">
        <div
          data-aos="slide-up"
          className="text-center mb-24 max-w-[400px] mx-auto"
        >
          <p className="text-sm bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-cyan-200">
            Sách Thịnh Hành
          </p>
          <h1 className="text-3xl font-bold">Sách Hay Nhất</h1>
          <p className="text-xs text-gray-400">
            Sách thịnh hành hay nhất là những cuốn sách được nhiều người yêu
            thích, có nội dung hấp dẫn và giá trị cao, tạo ảnh hưởng lớn trong
            cộng đồng độc giả.
          </p>
        </div>
        {isLoadingReviews && (
          <div className="animate-pulse flex justify-center items-center mb-8">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
          </div>
        )}
        {errorReviews && (
          <p className="text-center text-red-500 mb-8">{errorReviews}</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:gap-5 place-items-center gap-20">
          {topBooks.length > 0 ? (
            topBooks.map((book) => {
              const ratingInfo = reviewStats[book._id] || {};
              const avg = parseFloat(ratingInfo.averageRating || 0);
              const count = ratingInfo.reviewCount || 0;

              return (
                <div
                  key={book._id}
                  data-aos="zoom-in"
                  className="rounded-2xl bg-white dark:bg-zinc-800 hover:bg-sky-600 dark:hover:bg-sky-600 hover:text-white relative shadow-xl duration-high group max-w-[300px]"
                >
                  <div className="h-[100px]">
                    <img
                      src={
                        book.image && book.image.trim() !== ""
                          ? book.image
                          : "https://png.pngtree.com/png-vector/20220220/ourmid/pngtree-vector-design-with-pattern-element-for-minimalisticluxurious-cover-menu-invitation-card-bannerbook-vector-png-image_34179868.jpg"
                      }
                      alt={book.title}
                      className="max-w-[100px] block mx-auto transform -translate-y-14 group-hover:scale-105 duration-300 shadow-md"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h1 className="text-xl font-bold">{book.title}</h1>
                    <p className="text-gray-500 group-hover:text-white duration-300 text-sm line-clamp-2">
                      {book.description || "Không có mô tả"}
                    </p>
                    <div className="flex items-center justify-center mt-2 text-yellow-400">
                      {isLoadingReviews ? (
                        <div className="animate-pulse flex items-center">
                          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 mr-2"></div>
                          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                        </div>
                      ) : (
                        <>
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.round(avg)
                                  ? "fill-current"
                                  : "fill-none stroke-current"
                              }`}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                          ))}
                          <span className="ml-2 text-sm text-gray-600 group-hover:text-white dark:text-gray-300">
                            {avg > 0
                              ? `${avg}/5 (${count} đánh giá)`
                              : "Chưa có đánh giá"}
                          </span>
                        </>
                      )}
                    </div>
                    <button
                      className="bg-sky-600 to-cyan-200 text-white px-4 py-2 rounded-full mt-4 hover:scale-105 duration-200 group-hover:bg-white group-hover:text-sky-600"
                      onClick={handleOrderClick}
                    >
                      Đặt Hàng Ngay
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center col-span-full text-gray-500 dark:text-gray-400">
              Chưa có sách nào được đánh giá.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BestBooks;