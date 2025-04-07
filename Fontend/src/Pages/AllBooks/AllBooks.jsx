import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { getAllUsers } from "../../redux/apiRequest";
import { getAllBooks } from "../../redux/apiBooks";
import { getCategory } from "../../redux/apiCategory"; 

const AllBooks = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const books = useSelector((state) => state.books.allBooks);
  const categories = useSelector((state) => state.categories.allCategories);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  // State cho lọc, phân trang, tìm kiếm
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [selectedAuthor, setSelectedAuthor] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [visibleBooks, setVisibleBooks] = useState(8);
  const [searchQuery, setSearchQuery] = useState("");

  // Map categoryId => categoryName
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
        await getCategory(user.accessToken, dispatch, axiosJWT); // Gọi API lấy categories
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };

    fetchData();
  }, [user, dispatch, axiosJWT, navigate]);

  const filteredBooks = books?.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase());
    return (
      matchesSearch &&
      (selectedCategory === "all" || book.category === selectedCategory) &&
      (selectedPriceRange === "all" ||
        (selectedPriceRange === "low" && book.price < 100000) ||
        (selectedPriceRange === "medium" && book.price >= 100000 && book.price <= 500000) ||
        (selectedPriceRange === "high" && book.price > 500000)) &&
      (selectedAuthor === "all" || book.author === selectedAuthor) &&
      (selectedRating === "all" ||
        (selectedRating === "4+" && book.rating >= 4) ||
        (selectedRating === "3+" && book.rating >= 3))
    );
  });

  const categoryOptions = ["all", ...new Set(books?.map((book) => book.category))];
  const authors = ["all", ...new Set(books?.map((book) => book.author))];

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

      {/* Filter */}
      <div className="mb-12 max-w-7xl mx-auto bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Danh mục</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            {categoryOptions.map((catId) => (
              <option key={catId} value={catId}>
                {catId === "all" ? "Tất cả" : categoryMap[catId] || "Không rõ"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Giá</label>
          <select
            value={selectedPriceRange}
            onChange={(e) => setSelectedPriceRange(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white"
          >
            <option value="all">Tất cả</option>
            <option value="low">Dưới 100,000 ₫</option>
            <option value="medium">100,000 ₫ - 500,000 ₫</option>
            <option value="high">Trên 500,000 ₫</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Tác giả</label>
          <select
            value={selectedAuthor}
            onChange={(e) => setSelectedAuthor(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white"
          >
            {authors.map((author) => (
              <option key={author} value={author}>
                {author === "all" ? "Tất cả" : author}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Đánh giá</label>
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white"
          >
            <option value="all">Tất cả</option>
            <option value="4+">4 sao trở lên</option>
            <option value="3+">3 sao trở lên</option>
          </select>
        </div>
      </div>

      {/* Book List */}
      {filteredBooks && filteredBooks.length > 0 ? (
        <>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto" data-aos="zoom-in">
            {filteredBooks.slice(0, visibleBooks).map((book, index) => (
              <li
                key={book._id}
                className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link to={`/books/${book._id}`}>
                  <div className="relative group">
                    <img
                      src={book.image?.trim() ? book.image : "https://via.placeholder.com/150"}
                      alt={book.title}
                      className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"></div>
                  </div>
                </Link>

                <div className="p-6">
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">{book.title}</h5>
                  <p className="text-red-600 dark:text-red-400 font-bold text-xl">{book.price.toLocaleString("vi-VN")} ₫</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Tác giả: {book.author || "Không rõ"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Danh mục: {categoryMap[book.category] || "Không rõ"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Đánh giá: {book.rating ? `${book.rating}/5` : "Chưa có"}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* Load More */}
          {visibleBooks < filteredBooks.length && (
            <div className="text-center mt-12">
              <button
                onClick={handleLoadMore}
                className="bg-indigo-600 text-white py-3 px-8 rounded-full font-semibold hover:bg-indigo-700 transition-all duration-300 shadow-md"
              >
                Xem thêm
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-600 dark:text-gray-400 text-lg text-center italic">Hiện chưa có sách nào phù hợp</p>
      )}
    </div>
  );
};

export default AllBooks;
