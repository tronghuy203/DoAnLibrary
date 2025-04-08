import React, { useEffect, useMemo, useState } from "react";
import { getAllBooks, deleteBook } from "../../redux/apiBooks";
import { getCategory } from "../../redux/apiCategory";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { PencilIcon, TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const ListBook = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const booksPerPage = 5;

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login.currentUser);
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategory(user.accessToken, dispatch, axiosJWT);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
  
    fetchCategories();
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

  const filteredBooks = useMemo(() => {
    const filtered = books.filter(
      (book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.category && book.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [books, searchTerm]);

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const currentBooks = filteredBooks.slice(startIndex, startIndex + booksPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-cyan-400 mb-10 tracking-wide drop-shadow-md animate-fade-in-up">
        Danh Sách Sách
      </h2>

      <div className="w-full max-w-2xl mx-auto mb-8">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sách theo dạng tiêu đề, tác giả hoặc danh mục..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200 hover:border-cyan-500/50"
          />
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto">
        {filteredBooks.length === 0 ? (
          <div className="text-center text-gray-400 py-10 animate-slide-in text-lg">
            Không tìm thấy sách nào
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl shadow-md border border-gray-700/50 overflow-hidden">
            <div className="hidden sm:grid sm:grid-cols-[0.5fr_1fr_1fr_1fr_1fr_1fr] bg-gray-700 text-gray-200 font-semibold p-4">
              <div className="text-base">Ảnh</div>
              <div className="text-base">Tiêu đề</div>
              <div className="text-base">Tác giả</div>
              <div className="text-base">Danh mục</div>
              <div className="text-base">Giá (VND)</div>
              <div className="text-base">Hành động</div>
            </div>

            <div className="divide-y divide-gray-700">
              {currentBooks.map((book) => (
                <div
                  key={book._id}
                  className="flex flex-col sm:grid sm:grid-cols-[0.5fr_1fr_1fr_1fr_1fr_1fr] p-4 hover:bg-gray-750 hover:-translate-y-1 transition-all duration-300 animate-slide-in"
                >
                  <div className="py-2 flex items-center">
                    <span className="sm:hidden font-semibold text-cyan-400 mr-2">Ảnh:</span>
                    <img
                      src={book.image || "https://via.placeholder.com/100"}
                      alt={book.title}
                      className="w-12 h-15 object-cover rounded-md"
                    />
                  </div>
                  <div className="py-2 text-gray-200 flex items-center">
                    <span className="sm:hidden font-semibold text-cyan-400 mr-2">Tiêu đề:</span>
                    <span className="text-base break-words">{book.title}</span>
                  </div>
                  <div className="py-2 text-gray-200 flex items-center">
                    <span className="sm:hidden font-semibold text-cyan-400 mr-2">Tác giả:</span>
                    <span className="text-base break-words">{book.author}</span>
                  </div>
                  <div className="py-2 text-gray-200 flex items-center">
                    <span className="sm:hidden font-semibold text-cyan-400 mr-2">Danh mục:</span>
                    <span className="text-base">
                      {
                        book.category
                          ? categories.find(category => category._id === book.category)?.name || "Không xác định"
                          : "Chưa có"
                      }
                    </span>
                  </div>
                  <div className="py-2 text-gray-200 flex items-center">
                    <span className="sm:hidden font-semibold text-cyan-400 mr-2">Giá:</span>
                    <span className="text-base">{book.price.toLocaleString("vi-VN")}</span>
                  </div>
                  <div className="py-2 flex items-center gap-2">
                    <Link to={`/admin/books/update/${book._id}`}>
                      <button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-1 px-3 rounded-md transition-all duration-200 hover:shadow-md flex items-center gap-1 text-sm">
                        <PencilIcon className="w-4 h-4" />
                        Cập nhật
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(book._id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-md transition-all duration-200 hover:shadow-md flex items-center gap-1 text-sm"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center mt-8 gap-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`px-3 py-1 rounded-full font-medium text-sm transition-all duration-300 shadow-md ${
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
    </div>
  );
};

export default ListBook;