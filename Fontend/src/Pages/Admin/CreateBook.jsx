import React, { useMemo, useState } from "react";
import { createBook } from "../../redux/apiBooks";
import { useDispatch, useSelector } from "react-redux";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { BookOpenIcon, UserIcon, DocumentTextIcon, CurrencyDollarIcon, CheckCircleIcon, ExclamationCircleIcon, PhotoIcon, TagIcon } from "@heroicons/react/24/outline";

const CreateBook = () => {
  const [book, setBook] = useState({
    title: "",
    author: "",
    description: "",
    price: 0,
    category: "",
    image: null,
  });
  const [message, setMessage] = useState("");

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login.currentUser);
  const accessToken = user?.accessToken;
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  const handleChange = (e) => {
    setBook({ ...book, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setBook({ ...book, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!accessToken) {
        setMessage("Bạn cần đăng nhập để tạo sách.");
        return;
      }

      const formData = new FormData();
      Object.keys(book).forEach((key) => {
        formData.append(key, book[key]);
      });

      const data = await createBook(formData, accessToken, dispatch, axiosJWT);
      setMessage("Sách đã được tạo thành công!");
      console.log("Created Book:", data);

      setBook({
        title: "",
        author: "",
        description: "",
        price: 0,
        category: "",
        image: null,
      });
    } catch (err) {
      setMessage("Có lỗi xảy ra khi tạo sách!");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center py-8 px-4 lg:px-8">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-blue-400 mb-12">
        Tạo sách mới
      </h2>

      {message && (
        <div
          className={`flex items-center gap-2 w-full max-w-2xl text-center text-sm sm:text-base mb-6 px-4 py-3 rounded-lg shadow-lg ${
            message.includes("thành công")
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {message.includes("thành công") ? (
            <CheckCircleIcon className="w-6 h-6" />
          ) : (
            <ExclamationCircleIcon className="w-6 h-6" />
          )}
          <p>{message}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-gradient-to-br from-gray-800 to-gray-700 p-8 rounded-xl shadow-lg"
      >
        {/* Tiêu đề */}
        <div className="mb-6 relative">
          <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="title">
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
              className="w-full pl-10 pr-4 py-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg"
              placeholder="Nhập tiêu đề sách"
            />
          </div>
        </div>

        {/* Tác giả */}
        <div className="mb-6 relative">
          <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="author">
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
              className="w-full pl-10 pr-4 py-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg"
              placeholder="Nhập tên tác giả"
            />
          </div>
        </div>

        {/* Mô tả */}
        <div className="mb-6 relative">
          <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="description">
            Mô tả
          </label>
          <div className="relative">
            <DocumentTextIcon className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
            <textarea
              id="description"
              name="description"
              value={book.description}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg resize-y"
              placeholder="Nhập mô tả sách"
              rows="4"
            />
          </div>
        </div>

        {/* Giá */}
        <div className="mb-6 relative">
          <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="price">
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
              className="w-full pl-10 pr-4 py-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg"
              placeholder="Nhập giá sách"
              min="0"
            />
          </div>
        </div>

        {/* Danh mục */}
        <div className="mb-6 relative">
          <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="category">
            Danh mục
          </label>
          <div className="relative">
            <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              id="category"
              name="category"
              value={book.category}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg"
            >
              <option value="">Chọn danh mục</option>
              <option value="Tiểu thuyết">Tiểu thuyết</option>
              <option value="Khoa học">Khoa học</option>
              <option value="Lịch sử">Lịch sử</option>
            </select>
          </div>
        </div>

        {/* Hình ảnh */}
        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-semibold mb-2">Hình ảnh</label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-gray-300" />
        </div>

        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg">
          <BookOpenIcon className="w-5 h-5" />
          Tạo sách
        </button>
      </form>
    </div>
  );
};

export default CreateBook;
