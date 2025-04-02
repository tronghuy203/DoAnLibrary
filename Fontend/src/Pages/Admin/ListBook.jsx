import React, { useEffect, useMemo, useState } from "react";
import { getAllBooks, deleteBook } from "../../redux/apiBooks";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { PencilIcon, TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const ListBook = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 5;

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login.currentUser);
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!user?.accessToken) return;
      try {
        const data = await getAllBooks(user.accessToken, dispatch, axiosJWT);
        setBooks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Lỗi khi tải danh sách sách:", err);
        setBooks([]);
      }
    };
    fetchBooks();
  }, [dispatch, axiosJWT, user]);

  const handleDelete = async (bookId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sách này không?")) {
      try {
        await deleteBook(bookId, user.accessToken, dispatch, axiosJWT);
        setBooks((prevBooks) => prevBooks.filter((book) => book._id !== bookId));
      } catch (err) {
        console.error("Lỗi khi xóa sách:", err);
      }
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const currentBooks = filteredBooks.slice(startIndex, startIndex + booksPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Tiêu đề */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center text-cyan-400 mb-10 tracking-tight drop-shadow-lg animate-fade-in">
        Danh sách sách
      </h2>

      {/* Thanh tìm kiếm */}
      <div className="w-full max-w-4xl mb-8 px-4 sm:px-0">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-cyan-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề hoặc tác giả..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 bg-gray-800 text-gray-100 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500 transition-all duration-300 shadow-md hover:shadow-lg"
          />
        </div>
      </div>

      {/* Danh sách sách */}
      <div className="w-full max-w-4xl px-4 sm:px-0">
        {filteredBooks.length === 0 ? (
          <p className="text-gray-400 text-lg text-center italic animate-fade-in">
            Không tìm thấy sách nào
          </p>
        ) : (
          <div className="animate-fade-in">
            <div className="overflow-x-auto rounded-xl shadow-2xl bg-gray-800 border border-gray-700">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 text-xs sm:text-sm uppercase tracking-wider">
                    <th className="py-4 px-4 sm:px-6 font-semibold">Ảnh</th>
                    <th className="py-4 px-4 sm:px-6 font-semibold">Tiêu đề</th>
                    <th className="py-4 px-4 sm:px-6 font-semibold hidden sm:table-cell">Tác giả</th>
                    <th className="py-4 px-4 sm:px-6 font-semibold hidden md:table-cell">Danh mục</th>
                    <th className="py-4 px-4 sm:px-6 font-semibold hidden lg:table-cell">Giá (VND)</th>
                    <th className="py-4 px-4 sm:px-6 font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBooks.map((book) => (
                    <tr
                      key={book._id}
                      className="border-t border-gray-700 hover:bg-gray-700 transition-all duration-200"
                    >
                      <td className="py-4 px-4 sm:px-6">
                        <img
                          src={book.image || "https://via.placeholder.com/100"}
                          alt={book.title}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300"
                        />
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-gray-100 font-medium truncate max-w-[150px] sm:max-w-xs">
                        {book.title}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-gray-100 font-medium hidden sm:table-cell truncate max-w-[150px]">
                        {book.author}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-gray-100 font-medium hidden md:table-cell">
                        {book.category || "Chưa có"}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-gray-100 font-medium hidden lg:table-cell">
                        {book.price.toLocaleString("vi-VN")}
                      </td>
                      <td className="py-4 px-4 sm:px-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <Link to={`/admin/books/update/${book._id}`}>
                          <button className="flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-1.5 px-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg w-full sm:w-auto">
                            <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="text-xs sm:text-sm">Cập nhật</span>
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(book._id)}
                          className="flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 px-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg w-full sm:w-auto"
                        >
                          <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-xs sm:text-sm">Xóa</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center mt-8 gap-2">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-3 py-2 rounded-full font-medium transition-all duration-300 shadow-md text-sm sm:text-base ${
                      currentPage === index + 1
                        ? "bg-cyan-500 text-white scale-105"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListBook;