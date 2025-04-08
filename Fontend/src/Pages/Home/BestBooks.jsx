import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const BestBooks = () => {
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

  // Lấy 3 cuốn sách có đánh giá cao nhất
  const topBooksSorted = React.useMemo(() => {
    if (!books) return [];

    return [...books]
      .map((book) => ({
        ...book,
        averageRating: ratingsData[book._id]?.averageRating || 0,
      }))
      .sort((a, b) => b.averageRating - a.averageRating) // Sắp xếp theo điểm đánh giá giảm dần
      .slice(0, 3); // Lấy 3 cuốn đầu tiên
  }, [books, ratingsData]);

  // Sắp xếp lại thứ tự hiển thị: [thứ 2, thứ 1, thứ 3]
  const topBooks = React.useMemo(() => {
    if (topBooksSorted.length < 3) return topBooksSorted; // Nếu không đủ 3 cuốn, giữ nguyên
    return [topBooksSorted[1], topBooksSorted[0], topBooksSorted[2]]; // Thứ 2, Thứ 1, Thứ 3
  }, [topBooksSorted]);

  const handleOrderClick = () => {
    navigate("/cart"); // Điều hướng đến trang /cart
  };

  return (
    <div className="py-10 bg-white flex justify-center items-center dark:bg-zinc-900 dark:text-white duration-200">
      <div className="container">
        {/* Header section */}
        <div data-aos="slide-up" className="text-center mb-24 max-w-[400px] mx-auto">
          <p className="text-sm bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-cyan-200">
            Sách Thịnh Hành
          </p>
          <h1 className="text-3xl font-bold">Sách Hay Nhất</h1>
          <p className="text-xs text-gray-400">
            Sách thịnh hành hay nhất là những cuốn sách được nhiều người yêu thích, có nội dung hấp dẫn và giá trị cao, tạo ảnh hưởng lớn trong cộng đồng độc giả.
          </p>
        </div>
        {/* Card section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:gap-5 place-items-center gap-20">
          {topBooks.length > 0 ? (
            topBooks.map((book) => (
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
                        : "https://via.placeholder.com/150"
                    }
                    alt={book.title}
                    className="max-w-[100px] block mx-auto transform -translate-y-14 group-hover:scale-105 duration-300 shadow-md"
                  />
                </div>
                <div className="p-4 text-center">
                  <div className="w-full flex items-center justify-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 576 512"
                        className={`text-yellow-500 ${i < Math.round(book.averageRating) ? "fill-current" : "fill-none"}`}
                        height="1em"
                        width="1em"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path>
                      </svg>
                    ))}
                  </div>
                  <h1 className="text-xl font-bold">{book.title}</h1>
                  <p className="text-gray-500 group-hover:text-white duration-300 text-sm line-clamp-2">
                    {book.description || "Không có mô tả"}
                  </p>
                  <button
                    className="bg-sky-600 to-cyan-200 text-white px-4 py-2 rounded-full mt-4 hover:scale-105 duration-200 group-hover:bg-white group-hover:text-sky-600"
                    onClick={handleOrderClick}
                  >
                    Đặt Hàng Ngay
                  </button>
                </div>
              </div>
            ))
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