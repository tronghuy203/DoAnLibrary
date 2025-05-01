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
  const booksPerPage = 4;

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex items-center justify-center py-8 px-4 transition-all duration-500 ease-in-out relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/30 via-blue-100/20 to-purple-100/30 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-purple-900/20 animate-gradient-slow"></div>
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-cyan-300/20 dark:bg-cyan-600/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-[-15%] right-[-5%] w-96 h-96 bg-blue-300/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-[60%] left-[70%] w-48 h-48 bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute inset-0">
          <div className="absolute w-2 h-2 bg-cyan-400/50 dark:bg-cyan-500/30 rounded-full top-[20%] left-[15%] animate-particle"></div>
          <div className="absolute w-2 h-2 bg-blue-400/50 dark:bg-blue-500/30 rounded-full top-[50%] left-[80%] animate-particle-slow"></div>
          <div className="absolute w-2 h-2 bg-purple-400/50 dark:bg-purple-500/30 rounded-full top-[70%] left-[30%] animate-particle"></div>
          <div className="absolute w-2 h-2 bg-cyan-400/50 dark:bg-cyan-500/30 rounded-full top-[10%] left-[60%] animate-particle-slow"></div>
        </div>
        <svg className="absolute bottom-0 left-0 w-full h-32 text-cyan-200/20 dark:text-cyan-800/20" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,186.7C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      <div className="w-full max-w-5xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] relative z-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-cyan-600 dark:text-cyan-400 mb-8 sm:mb-12 tracking-tight drop-shadow-lg animate-slide-up">
          Danh Sách Sách
        </h2>

        <div className="w-full max-w-2xl mx-auto mb-8 sm:mb-10 animate-slide-up">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 dark:text-cyan-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sách theo tiêu đề, tác giả hoặc danh mục..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 bg-gray-50/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 border border-gray-300/50 dark:border-gray-600/50 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 hover:bg-gray-100/80 dark:hover:bg-gray-600/80 text-xs sm:text-base backdrop-blur-sm"
            />
          </div>
        </div>

        <div className="w-full">
          {filteredBooks.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 p-4 bg-gray-50/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-700/50 text-sm sm:text-base transition-all duration-300 ease-in-out animate-fade-in backdrop-blur-sm">
              Không tìm thấy sách nào
            </div>
          ) : (
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-md border border-gray-200/50 dark:border-gray-700/50 overflow-hidden backdrop-blur-sm">
              <div className="hidden sm:grid sm:grid-cols-[0.5fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] bg-gray-100/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-200 font-semibold p-4 rounded-t-xl">
                <div className="text-base">Ảnh</div>
                <div className="text-base">Tiêu đề</div>
                <div className="text-base">Tác giả</div>
                <div className="text-base">Danh mục</div>
                <div className="text-base">Năm xuất bản</div>
                <div className="text-base">Số lượng</div>
                <div className="text-base">Giá (VND)</div>
                <div className="text-base">Hành động</div>
              </div>

              <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {currentBooks.map((book) => (
                  <div
                    key={book._id}
                    className="flex flex-col sm:grid sm:grid-cols-[0.5fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] p-4 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 hover:-translate-y-1 transition-all duration-300 animate-slide-in"
                  >
                    <div className="py-2 flex items-center">
                      <span className="sm:hidden font-semibold text-cyan-400 dark:text-cyan-300 mr-2">Ảnh:</span>
                      <img
                        src={book.image || "https://png.pngtree.com/png-vector/20220220/ourmid/pngtree-vector-design-with-pattern-element-for-minimalisticluxurious-cover-menu-invitation-card-bannerbook-vector-png-image_34179868.jpg"}
                        alt={book.title}
                        className="w-12 h-15 object-cover rounded-md"
                      />
                    </div>
                    <div className="py-2 text-gray-900 dark:text-gray-200 flex items-center">
                      <span className="sm:hidden font-semibold text-cyan-400 dark:text-cyan-300 mr-2">Tiêu đề:</span>
                      <span className="text-base break-words">{book.title}</span>
                    </div>
                    <div className="py-2 text-gray-900 dark:text-gray-200 flex items-center">
                      <span className="sm:hidden font-semibold text-cyan-400 dark:text-cyan-300 mr-2">Tác giả:</span>
                      <span className="text-base break-words">{book.author}</span>
                    </div>
                    <div className="py-2 text-gray-900 dark:text-gray-200 flex items-center">
                      <span className="sm:hidden font-semibold text-cyan-400 dark:text-cyan-300 mr-2">Danh mục:</span>
                      <span className="text-base">
                        {book.category
                          ? categories.find(category => category._id === book.category)?.name || "Không xác định"
                          : "Chưa có"}
                      </span>
                    </div>
                    <div className="py-2 text-gray-900 dark:text-gray-200 flex items-center">
                      <span className="sm:hidden font-semibold text-cyan-400 dark:text-cyan-300 mr-2">Năm xuất bản:</span>
                      <span className="text-base md:mx-auto">{book.publishedYear}</span>
                    </div>
                    <div className="py-2 text-gray-900 dark:text-gray-200 flex items-center">
                      <span className="sm:hidden font-semibold text-cyan-400 dark:text-cyan-300 mr-2">Số lượng:</span>
                      <span className="text-base md:mx-auto">{book.quantity.toLocaleString("vi-VN")}</span>
                    </div>
                    <div className="py-2 text-gray-900 dark:text-gray-200 flex items-center">
                      <span className="sm:hidden font-semibold text-cyan-400 dark:text-cyan-300 mr-2">Giá:</span>
                      <span className="text-base md:mx-auto">{book.price.toLocaleString("vi-VN")}</span>
                    </div>
                    <div className="py-2 flex items-center gap-2">
                      <Link to={`/admin/books/update/${book._id}`}>
                        <button className="w-32 mx-auto sm:w-auto flex items-center justify-center gap-1 bg-yellow-500 dark:bg-yellow-400 hover:bg-yellow-600 dark:hover:bg-yellow-500 text-white font-medium py-1.5 px-3 rounded-full transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 text-sm">
                          <PencilIcon className="w-4 h-4" />
                          Sửa
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(book._id)}
                        className="w-32 mx-auto sm:w-auto flex items-center justify-center gap-1 bg-red-500 dark:bg-red-400 hover:bg-red-600 dark:hover:bg-red-500 text-white font-medium py-1.5 px-3 rounded-full transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 text-sm"
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
            <div className="flex flex-wrap justify-center mt-8 gap-2 animate-slide-up">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-3 py-1 rounded-full font-medium text-sm transition-all duration-300 shadow-md ${
                    currentPage === index + 1
                      ? "bg-cyan-500 dark:bg-cyan-600 text-white scale-105"
                      : "bg-gray-200/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 hover:bg-gray-300/80 dark:hover:bg-gray-600/80 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListBook;