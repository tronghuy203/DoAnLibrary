import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const TopBooks = () => {
  const navigate = useNavigate();
  const books = useSelector((state) => state.books.allBooks); // Lấy danh sách sách từ Redux
  const reviewsState = useSelector((state) => state.reviews.reviews); // Lấy danh sách đánh giá từ Redux

  // Tính toán điểm trung bình đánh giá cho từng cuốn sách
  const ratingsData = React.useMemo(() => {
    if (!books || !reviewsState) return {};

    const ratings = {};
    books.forEach((book) => {
      const bookReviews = reviewsState.filter((review) => review.itemId === book._id);
      const reviewCount = bookReviews.length;
      const averageRating =
        reviewCount > 0
          ? (bookReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount).toFixed(1)
          : 0;
      ratings[book._id] = { averageRating, reviewCount };
    });
    return ratings;
  }, [books, reviewsState]);

  // Lấy 10 cuốn sách có đánh giá cao nhất
  const topBooks = React.useMemo(() => {
    if (!books) return [];

    return [...books]
      .map((book) => ({
        ...book,
        averageRating: ratingsData[book._id]?.averageRating || 0,
      }))
      .sort((a, b) => b.averageRating - a.averageRating) // Sắp xếp theo điểm đánh giá giảm dần
      .slice(0, 10); // Lấy 10 cuốn đầu tiên
  }, [books, ratingsData]);

  const handleViewAllBooksClick = () => {
    navigate("/all-books"); // Điều hướng đến trang /all-books
  };

  return (
    <div className="py-10 bg-white flex justify-center items-center dark:bg-zinc-900 dark:text-white duration-200">
      <div className="container placeholder-gray-100">
        {/* Header */}
        <div data-aos="slide-up" className="text-center mb-24 max-w-[400px] mx-auto">
          <p className="text-sm bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-cyan-200">
            Sách Hay Nhất
          </p>
          <h1 className="text-3xl font-bold">Sách Hàng Đầu</h1>
          <p className="text-xs text-gray-400">
            Sách hay nhất và là hàng đầu trong mọi loại sách là nguồn cảm hứng vô tận, mở rộng tầm hiểu biết và thay đổi cách nhìn về thế giới.
          </p>
        </div>
        {/* Card */}
        <div data-aos="slide-up">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 place-items-center gap-5">
            {topBooks.length > 0 ? (
              topBooks.map((book, index) => (
                <div key={index} className="space-y-3">
                  <img
                    src={
                      book.image && book.image.trim() !== ""
                        ? book.image
                        : "https://via.placeholder.com/150"
                    }
                    alt={book.title}
                    className="h-[220px] w-[150px] object-cover rounded-md"
                  />
                  <div>
                    <h2 className="font-semibold">{book.title}</h2>
                    <p className="text-sm text-gray-700 dark:text-gray-400">
                      {book.author || "Không rõ"}
                    </p>
                    <div className="flex items-center gap-1">
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 576 512"
                        className="text-yellow-500"
                        height="1em"
                        width="1em"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path>
                      </svg>
                      <span>{book.averageRating}</span>
                    </div>
                  </div>
                </div>
              ))
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