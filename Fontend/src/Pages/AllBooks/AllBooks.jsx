import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { getAllUsers } from "../../redux/apiRequest";
import { getAllBooks } from "../../redux/apiBooks";
import { getReviews } from "../../redux/apiReview";

const AllBooks = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const books = useSelector((state) => state.books.allBooks);
  const reviewsState = useSelector((state) => state.reviews.reviews); // Dữ liệu reviews từ Redux
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  // State for filtering, pagination, and search
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [selectedAuthor, setSelectedAuthor] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [visibleBooks, setVisibleBooks] = useState(8);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingsData, setRatingsData] = useState({}); // Lưu trữ dữ liệu đánh giá

  // Tải dữ liệu người dùng và sách
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        await Promise.all([
          getAllUsers(user.accessToken, dispatch, axiosJWT),
          getAllBooks(user.accessToken, dispatch, axiosJWT),
        ]);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };

    fetchData();
  }, [user, dispatch, axiosJWT, navigate]);

  // Tải tất cả reviews khi books thay đổi
  useEffect(() => {
    if (books && books.length > 0) {
      const fetchReviews = async () => {
        try {
          // Gọi getReviews cho từng cuốn sách
          await Promise.all(
            books.map((book) => getReviews("book", book._id, dispatch))
          );
        } catch (error) {
          console.error("Lỗi khi tải reviews:", error);
        }
      };
      fetchReviews();
    }
  }, [books, dispatch]);

  // Cập nhật ratingsData khi reviewsState thay đổi
  useEffect(() => {
    if (reviewsState && books) {
      const newRatingsData = {};
      books.forEach((book) => {
        const bookReviews = reviewsState.filter((review) => review.itemId === book._id);
        const reviewCount = bookReviews.length;
        const averageRating =
          reviewCount > 0
            ? bookReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
            : 0;
        newRatingsData[book._id] = { averageRating: averageRating.toFixed(1), reviewCount };
      });
      setRatingsData(newRatingsData);
    }
  }, [reviewsState, books]);

  // Filter and sort books based on selected criteria and search query
  const filteredBooks = useMemo(() => {
    const filtered = books?.filter((book) => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase());
      const avgRating = ratingsData[book._id]?.averageRating || 0;
      return (
        matchesSearch &&
        (selectedCategory === "all" || book.category === selectedCategory) &&
        (selectedPriceRange === "all" ||
          (selectedPriceRange === "low" && book.price < 100000) ||
          (selectedPriceRange === "medium" && book.price >= 100000 && book.price <= 500000) ||
          (selectedPriceRange === "high" && book.price > 500000)) &&
        (selectedAuthor === "all" || book.author === selectedAuthor) &&
        (selectedRating === "all" ||
          (selectedRating === "4+" && avgRating >= 4) ||
          (selectedRating === "3+" && avgRating >= 3))
      );
    });

    // Sắp xếp theo createdAt giảm dần (mới nhất lên đầu)
    return filtered?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [books, searchQuery, selectedCategory, selectedPriceRange, selectedAuthor, selectedRating, ratingsData]);

  // Extract unique categories and authors for dropdowns
  const categories = ["all", ...new Set(books?.map((book) => book.category))];
  const authors = ["all", ...new Set(books?.map((book) => book.author))];

  // Handle "Xem thêm" button click
  const handleLoadMore = () => {
    setVisibleBooks((prev) => prev + 8);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-zinc-900 dark:to-zinc-700 text-gray-900 dark:text-white px-6 sm:px-12 py-16 transition-all duration-300">
      <h4
        data-aos="slide-up"
        className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-center mb-16 mt-8 tracking-tight animate-fade-in bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
      >
        Thư Viện Sách
      </h4>

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto mb-10">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm sách theo tiêu đề..."
          className="w-full p-4 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-md focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      {/* Filtering Section */}
      <div className="mb-12 max-w-7xl mx-auto bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Danh mục</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "Tất cả" : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Price Filter */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Giá</label>
          <select
            value={selectedPriceRange}
            onChange={(e) => setSelectedPriceRange(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          >
            <option value="all">Tất cả</option>
            <option value="low">Dưới 100,000 ₫</option>
            <option value="medium">100,000 ₫ - 500,000 ₫</option>
            <option value="high">Trên 500,000 ₫</option>
          </select>
        </div>

        {/* Author Filter */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Tác giả</label>
          <select
            value={selectedAuthor}
            onChange={(e) => setSelectedAuthor(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          >
            {authors.map((author) => (
              <option key={author} value={author}>
                {author === "all" ? "Tất cả" : author}
              </option>
            ))}
          </select>
        </div>

        {/* Rating Filter */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Đánh giá</label>
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          >
            <option value="all">Tất cả</option>
            <option value="4+">4 sao trở lên</option>
            <option value="3+">3 sao trở lên</option>
          </select>
        </div>
      </div>

      {/* Books List */}
      {filteredBooks && filteredBooks.length > 0 ? (
        <>
          <ul
            data-aos="zoom-in"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto"
          >
            {filteredBooks.slice(0, visibleBooks).map((book, index) => {
              const { averageRating = 0, reviewCount = 0 } = ratingsData[book._id] || {};
              return (
                <li
                  key={book._id}
                  className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Link to={`/books/${book._id}`}>
                    <div className="relative group">
                      <img
                        src={
                          book.image && book.image.trim() !== ""
                            ? book.image
                            : "https://via.placeholder.com/150"
                        }
                        alt={book.title}
                        className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"></div>
                    </div>
                  </Link>

                  <div className="p-6">
                    <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">
                      {book.title}
                    </h5>
                    <p className="text-red-600 dark:text-red-400 font-bold text-xl">
                      {book.price.toLocaleString("vi-VN")} ₫
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Tác giả: {book.author || "Không rõ"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${
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
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ({averageRating}/5) - {reviewCount} đánh giá
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Load More Button */}
          {visibleBooks < filteredBooks.length && (
            <div className="text-center mt-12">
              <button
                onClick={handleLoadMore}
                className="bg-indigo-600 text-white py-3 px-8 rounded-full font-semibold hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
              >
                Xem thêm
              </button>
            </div>
          )}
        </>
      ) : (
        <p
          data-aos="slide-up"
          className="text-gray-600 dark:text-gray-400 text-lg text-center italic animate-fade-in"
        >
          Hiện chưa có sách nào phù hợp
        </p>
      )}
    </div>
  );
};

export default AllBooks;