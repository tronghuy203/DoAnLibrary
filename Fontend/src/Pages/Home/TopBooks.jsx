import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getReviews } from "../../redux/apiReview";

const TopBooks = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const books = useSelector((state) => state.books.allBooks);

  const [reviewStats, setReviewStats] = useState({});

  useEffect(() => {
    const fetchReviewStats = async () => {
      if (!books.length) return;
      try {
        const stats = {};
        const reviewPromises = books.map((book) =>
          getReviews("book", book._id, dispatch).then((reviews) => ({
            bookId: book._id,
            reviews,
          }))
        );
        const reviewResults = await Promise.all(reviewPromises);

        for (const { bookId, reviews } of reviewResults) {
          const reviewCount = reviews.length;
          const averageRating =
            reviewCount > 0
              ? (
                  reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
                ).toFixed(1)
              : 0;
          stats[bookId] = { averageRating, reviewCount };
        }
        setReviewStats(stats);
      } catch (error) {
        console.error("Lỗi khi lấy thống kê đánh giá:", error);
      }
    };

    fetchReviewStats();
  }, [books, dispatch]);

  const topBooks = useMemo(() => {
    if (!books) return [];

    return [...books]
      .map((book) => ({
        ...book,
        averageRating: parseFloat(reviewStats[book._id]?.averageRating || 0),
      }))
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 10);
  }, [books, reviewStats]);

  const handleViewAllBooksClick = () => {
    navigate("/all-books");
  };

  return (
    <div className="py-10 bg-white flex justify-center items-center dark:bg-zinc-900 dark:text-white duration-200">
      <div className="container placeholder-gray-100">
        <div
          data-aos="slide-up"
          className="text-center mb-24 max-w-[400px] mx-auto"
        >
          <p className="text-sm bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-cyan-200">
            Sách Hay Nhất
          </p>
          <h1 className="text-3xl font-bold">Sách Hàng Đầu</h1>
          <p className="text-xs text-gray-400">
            Sách hay nhất và là hàng đầu trong mọi loại sách là nguồn cảm hứng
            vô tận, mở rộng tầm hiểu biết và thay đổi cách nhìn về thế giới.
          </p>
        </div>
        <div data-aos="slide-up">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 place-items-center gap-5">
            {topBooks.length > 0 ? (
              topBooks.map((book, index) => {
                const ratingInfo = reviewStats[book._id];
                const avg = parseFloat(ratingInfo?.averageRating || 0);
                const count = ratingInfo?.reviewCount || 0;

                return (
                  <div key={index} className="space-y-3">
                    <img
                      src={
                        book.image && book.image.trim() !== ""
                          ? book.image
                          : "https://png.pngtree.com/png-vector/20220220/ourmid/pngtree-vector-design-with-pattern-element-for-minimalisticluxurious-cover-menu-invitation-card-bannerbook-vector-png-image_34179868.jpg"
                      }
                      alt={book.title}
                      className="h-[220px] w-[150px] object-cover rounded-md"
                    />
                    <div>
                      <h2 className="font-semibold w-40">{book.title}</h2>
                      <p className="text-sm text-gray-700 dark:text-gray-400">
                        {book.author || "Không rõ"}
                      </p>
                      <div className="flex flex-col items-start mt-2 text-yellow-400">
                        <div className="flex">
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
                        </div>
                        <span className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                          {avg > 0
                            ? `${avg}/5 (${count} đánh giá)`
                            : "Chưa có đánh giá"}
                        </span>
                      </div>
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
          <div className="flex justify-center">
            <button
              onClick={handleViewAllBooksClick}
              className="text-center mt-10 cursor-pointer bg-sky-600 text-white py-2 px-5 rounded-full"
            >
              Xem Tất Cả Sách
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBooks;
