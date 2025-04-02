import React, { useEffect, useMemo, useState } from "react";
import { updateBook, getAllBooks } from "../../redux/apiBooks";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { BookOpenIcon, UserIcon, DocumentTextIcon, CurrencyDollarIcon, ArrowLeftIcon, ExclamationCircleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

const UpdateBook = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState({ title: "", author: "", description: "", price: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.login.currentUser);

  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const books = await getAllBooks(user.accessToken, dispatch, axiosJWT);
        const foundBook = books.find((b) => b._id === bookId);
        if (foundBook) {
          setBook(foundBook);
        } else {
          setError("Không tìm thấy sách.");
        }
      } catch (error) {
        setError("Lỗi khi tải dữ liệu sách.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [bookId, dispatch, user, axiosJWT]);

  const handleChange = (e) => {
    if (e.target.name === "image") {
      setBook({ ...book, image: e.target.files[0] });
    } else {
      setBook({ ...book, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateBook(bookId, book, user.accessToken, dispatch, axiosJWT);
      alert("Cập nhật thành công!");
      navigate("/admin/books/list");
    } catch (error) {
      alert("Cập nhật thất bại! Vui lòng thử lại.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center py-8 px-4">
        <div className="flex items-center gap-2 text-gray-300 text-lg animate-pulse">
          <ArrowPathIcon className="w-6 h-6 animate-spin" />
          <p>Đang tải dữ liệu sách...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center py-8 px-4">
        <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg animate-fade-in">
          <ExclamationCircleIcon className="w-6 h-6" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center py-8 px-4 lg:px-8">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-blue-400 mb-12 animate-fade-in">
        Cập nhật sách
      </h2>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-gradient-to-br from-gray-800 to-gray-700 p-8 rounded-xl shadow-lg transform transition-all duration-300 animate-fade-in"
      >
        <div className="mb-6 relative">
          <label
            className="block text-gray-300 text-sm font-semibold mb-2"
            htmlFor="title"
          >
            Tiêu đề
          </label>
          <div className="relative">
            <BookOpenIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              id="title"
              name="title"
              value={book.title}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm hover:shadow-md"
              placeholder="Nhập tiêu đề sách"
            />
          </div>
        </div>

        <div className="mb-6 relative">
          <label
            className="block text-gray-300 text-sm font-semibold mb-2"
            htmlFor="author"
          >
            Tác giả
          </label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              id="author"
              name="author"
              value={book.author}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm hover:shadow-md"
              placeholder="Nhập tên tác giả"
            />
          </div>
        </div>

        <div className="mb-6 relative">
          <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="image">Ảnh</label>
          <input type="file" id="image" name="image" onChange={handleChange} className="w-full p-3 bg-gray-700 text-gray-100 rounded-lg" />
        </div>

        <div className="mb-6 relative">
          <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="category">Danh mục</label>
          <select id="category" name="category" value={book.category} onChange={handleChange} className="w-full p-3 bg-gray-700 text-gray-100 rounded-lg">
            <option value="">Chọn danh mục</option>
            <option value="Tiểu thuyết">Tiểu thuyết</option>
            <option value="Khoa học">Khoa học</option>
            <option value="Lịch sử">Lịch sử</option>
          </select>
        </div>

        <div className="mb-6 relative">
          <label
            className="block text-gray-300 text-sm font-semibold mb-2"
            htmlFor="description"
          >
            Mô tả
          </label>
          <div className="relative">
            <DocumentTextIcon className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
            <textarea
              id="description"
              name="description"
              value={book.description}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-y shadow-sm hover:shadow-md"
              placeholder="Nhập mô tả sách"
              rows="4"
            />
          </div>
        </div>

        <div className="mb-8 relative">
          <label
            className="block text-gray-300 text-sm font-semibold mb-2"
            htmlFor="price"
          >
            Giá
          </label>
          <div className="relative">
            <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              id="price"
              name="price"
              value={book.price}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm hover:shadow-md"
              placeholder="Nhập giá sách"
              min="0"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            <BookOpenIcon className="w-5 h-5" />
            Cập nhật
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/books/list")}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateBook;