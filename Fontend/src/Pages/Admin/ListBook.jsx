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
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center py-8 px-4 lg:px-8">

      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-blue-400 mb-12 animate-fade-in">
        Danh sách sách
      </h2>

      <div className="w-full max-w-5xl mb-6 animate-fade-in">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề hoặc tác giả..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); 
            }}
            className="w-full pl-10 pr-4 py-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm hover:shadow-md"
          />
        </div>
      </div>

      {filteredBooks.length === 0 ? (
        <p className="text-gray-400 text-center text-lg animate-fade-in">
          Không có sách nào
        </p>
      ) : (
        <div className="w-full max-w-5xl overflow-x-auto animate-fade-in">
          <table className="w-full bg-gray-800 rounded-xl shadow-lg">
            <thead>
              <tr className="bg-gradient-to-r from-gray-700 to-gray-600 text-gray-300 text-left text-sm sm:text-base">
                <th className="py-4 px-6 font-semibold rounded-tl-xl">Tiêu đề</th>
                <th className="py-4 px-6 font-semibold">Tác giả</th>
                <th className="py-4 px-6 font-semibold">Giá (VND)</th>
                <th className="py-4 px-6 font-semibold rounded-tr-xl">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentBooks.map((book) => (
                <tr
                  key={book._id}
                  className="border-t border-gray-700 hover:bg-gray-700 transition duration-200"
                >
                  <td className="py-4 px-6 text-gray-200 text-sm sm:text-base">
                    {book.title}
                  </td>
                  <td className="py-4 px-6 text-gray-200 text-sm sm:text-base">
                    {book.author}
                  </td>
                  <td className="py-4 px-6 text-gray-200 text-sm sm:text-base">
                    {book.price.toLocaleString()} VND
                  </td>
                  <td className="py-4 px-6 flex gap-2">
                    <Link to={`/admin/books/update/${book._id}`}>
                      <button className="flex items-center gap-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold py-1 px-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg">
                        <PencilIcon className="w-4 h-4" />
                        Cập nhật
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(book._id)}
                      className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-1 px-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-4 py-2 rounded-lg transition duration-200 ${
                    currentPage === index + 1
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
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
  );
};

export default ListBook;