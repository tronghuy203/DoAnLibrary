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
  const [previewImage, setPreviewImage] = useState(null); // State để hiển thị preview ảnh
  const [message, setMessage] = useState("");

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login.currentUser);
  const accessToken = user?.accessToken;
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  const handleChange = (e) => {
    setBook({ ...book, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBook({ ...book, image: file });
      setPreviewImage(URL.createObjectURL(file)); // Tạo URL tạm để preview ảnh
    }
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
      setPreviewImage(null); // Reset preview ảnh
    } catch (err) {
      setMessage("Có lỗi xảy ra khi tạo sách!");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-gray-100 flex flex-col items-center py-12 px-4 sm:px-8 lg:px-12">
      <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-cyan-400 mb-12 tracking-tight drop-shadow-lg">
        Tạo sách mới
      </h2>

      {message && (
        <div
          className={`flex items-center gap-2 w-full max-w-2xl text-center text-base mb-8 px-6 py-3 rounded-lg shadow-xl ${
            message.includes("thành công") ? "bg-teal-500 text-white" : "bg-red-500 text-white"
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
        className="w-full max-w-2xl bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800 transform transition-all hover:shadow-[0_0_20px_rgba(0,255,255,0.1)]"
      >
        <div className="mb-6">
          <label className="block text-gray-200 text-sm font-medium mb-2" htmlFor="title">
            Tiêu đề
          </label>
          <div className="relative">
            <BookOpenIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
            <input
              type="text"
              id="title"
              name="title"
              value={book.title}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500 transition-all duration-200"
              placeholder="Nhập tiêu đề sách"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-200 text-sm font-medium mb-2" htmlFor="author">
            Tác giả
          </label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
            <input
              type="text"
              id="author"
              name="author"
              value={book.author}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500 transition-all duration-200"
              placeholder="Nhập tên tác giả"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-200 text-sm font-medium mb-2" htmlFor="description">
            Mô tả
          </label>
          <div className="relative">
            <DocumentTextIcon className="absolute left-3 top-4 w-5 h-5 text-cyan-400" />
            <textarea
              id="description"
              name="description"
              value={book.description}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-y placeholder-gray-500 transition-all duration-200"
              placeholder="Nhập mô tả sách"
              rows="4"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-200 text-sm font-medium mb-2" htmlFor="price">
            Giá
          </label>
          <div className="relative">
            <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
            <input
              type="number"
              id="price"
              name="price"
              value={book.price}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500 transition-all duration-200"
              placeholder="Nhập giá sách"
              min="0"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-200 text-sm font-medium mb-2" htmlFor="category">
            Danh mục
          </label>
          <div className="relative">
            <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
            <select
              id="category"
              name="category"
              value={book.category}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none placeholder-gray-500 transition-all duration-200"
            >
              <option value="">Chọn danh mục</option>
              <option value="Tiểu thuyết">Tiểu thuyết</option>
              <option value="Khoa học">Khoa học</option>
              <option value="Lịch sử">Lịch sử</option>
            </select>
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-gray-200 text-sm font-medium mb-2">Hình ảnh</label>
          <div className="relative">
            <label
              htmlFor="image"
              className="group flex items-center justify-center w-full h-48 bg-gray-800 border-2 border-gray-700 rounded-xl cursor-pointer hover:bg-gray-700 hover:border-cyan-500 transition-all duration-300 shadow-md"
            >
              {previewImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-xl opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-cyan-400 font-medium bg-gray-900/70 px-3 py-1 rounded-full">Thay ảnh</span>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <PhotoIcon className="w-12 h-12 mx-auto text-cyan-400 group-hover:text-cyan-300 transition-colors duration-200" />
                  <p className="mt-2 text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                    Nhấp để chọn hoặc kéo ảnh vào đây
                  </p>
                </div>
              )}
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          {book.image && (
            <p className="mt-2 text-sm text-gray-400 truncate">Đã chọn: {book.image.name}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <BookOpenIcon className="w-5 h-5" />
          Tạo sách
        </button>
      </form>
    </div>
  );
};

export default CreateBook;