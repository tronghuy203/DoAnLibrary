import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { getAllUsers } from "../../redux/apiRequest";
import { getAllBooks } from "../../redux/apiBooks";
import { getCategory } from "../../redux/apiCategory";
import { getReviews } from "../../redux/apiReview";

const AllBooks = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const books = useSelector((state) => state.books.allBooks);
  const categories = useSelector((state) => state.categories.allCategories);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [selectedAuthor, setSelectedAuthor] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [visibleBooks, setVisibleBooks] = useState(8);
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewStats, setReviewStats] = useState({});

  const categoryMap = useMemo(() => {
    const map = {};
    categories?.forEach((cat) => {
      map[cat._id] = cat.name;
    });
    return map;
  }, [categories]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        await getAllUsers(user.accessToken, dispatch, axiosJWT);
        await getAllBooks(user.accessToken, dispatch, axiosJWT);
        await getCategory(user.accessToken, dispatch, axiosJWT);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };

    fetchData();
  }, [user, dispatch, axiosJWT, navigate]);

  useEffect(() => {
    if (books.length > 0) {
      fetchReviewStats();
    }
  }, [books]);

  const fetchReviewStats = async () => {
    try {
      const stats = {};
      for (const book of books) {
        const reviews = await getReviews("book", book._id, dispatch);
        const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1);
        stats[book._id] = {
          averageRating: averageRating.toFixed(1),
          reviewCount: reviews.length,
        };
      }
      setReviewStats(stats);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê đánh giá:", error);
    }
  };

  const filteredBooks = books?.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase());
    const avgRating = parseFloat(reviewStats[book._id]?.averageRating || 0);

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

  const categoryOptions = ["all", ...new Set(books?.map((book) => book.category))];
  const authors = ["all", ...new Set(books?.map((book) => book.author))];

  const handleLoadMore = () => {
    setVisibleBooks((prev) => prev + 8);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-100 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 text-gray-900 dark:text-white px-6 sm:px-12 py-16 transition-all duration-500 relative overflow-hidden">
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 960">
          <defs>
            <pattern id="hex-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path
                d="M40 10L70 25 70 55 40 70 10 55 10 25z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#hex-pattern)" />
        </svg>
      </div>

      <h4 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-center mb-16 mt-8 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-yellow-600 drop-shadow-xl animate-fade-in">
        Thư Viện Sách
      </h4>

      {/* Thanh tìm kiếm */}
      <div className="max-w-4xl mx-auto mb-12 relative">
        <div className="relative group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm sách theo tiêu đề..."
            className="w-full p-5 pr-14 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-600 focus:outline-none transition-all duration-300 group-hover:shadow-xl"
          />
          <svg
            className="absolute right-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors duration-300"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="mb-16 max-w-7xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 transform transition-all duration-500 hover:shadow-2xl">
        <div>
          <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">Danh mục</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-4 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            {categoryOptions.map((catId) => (
              <option key={catId} value={catId}>
                {catId === "all" ? "Tất cả" : categoryMap[catId] || "Không rõ"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">Giá</label>
          <select
            value={selectedPriceRange}
            onChange={(e) => setSelectedPriceRange(e.target.value)}
            className="w-full p-4 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <option value="all">Tất cả</option>
            <option value="low">Dưới 100,000 ₫</option>
            <option value="medium">100,000 ₫ - 500,000 ₫</option>
            <option value="high">Trên 500,000 ₫</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">Tác giả</label>
          <select
            value={selectedAuthor}
            onChange={(e) => setSelectedAuthor(e.target.value)}
            className="w-full p-4 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            {authors.map((author) => (
              <option key={author} value={author}>
                {author === "all" ? "Tất cả" : author}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">Đánh giá</label>
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="w-full p-4 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <option value="all">Tất cả</option>
            <option value="4+">4 sao trở lên</option>
            <option value="3+">3 sao trở lên</option>
          </select>
        </div>
      </div>

      {/* Danh sách sách */}
      {filteredBooks.length > 0 ? (
        <>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 max-w-7xl mx-auto">
            {filteredBooks.slice(0, visibleBooks).map((book, index) => {
              const ratingInfo = reviewStats[book._id];
              const avg = parseFloat(ratingInfo?.averageRating || 0);
              const count = ratingInfo?.reviewCount || 0;

              return (
                <li
                  key={book._id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 relative group"
                >
                  <Link to={`/books/${book._id}`}>
                    <div className="relative">
                      <img
                        src={
                          book.image?.trim()
                            ? book.image
                            : "https://png.pngtree.com/png-vector/20220220/ourmid/pngtree-vector-design-with-pattern-element-for-minimalisticluxurious-cover-menu-invitation-card-bannerbook-vector-png-image_34179868.jpg"
                        }
                        alt={book.title}
                        className="w-full h-80 object-cover rounded-t-2xl transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl"></div>
                    </div>
                  </Link>
                  <div className="p-6">
                    <h5 className="text-xl font-bold mb-3 truncate text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors duration-300">
                      {book.title}
                    </h5>
                    <p className="text-red-500 font-bold text-2xl mb-2">{book.price.toLocaleString("vi-VN")} ₫</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Tác giả: {book.author || "Không rõ"}</p>
                    <div className="flex items-center text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.round(avg) ? "fill-current" : "fill-none stroke-current"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                        {avg > 0 ? `${avg}/5 (${count} đánh giá)` : "Chưa có đánh giá"}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {visibleBooks < filteredBooks.length && (
            <div className="text-center mt-12">
              <button
                onClick={handleLoadMore}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Xem thêm
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-center mt-12 text-gray-500 dark:text-gray-400 text-lg font-medium animate-pulse">
          Không tìm thấy sách nào.
        </p>
      )}
    </div>
  );
};

export default AllBooks;