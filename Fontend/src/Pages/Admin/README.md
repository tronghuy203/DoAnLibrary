import React, { useMemo, useState } from "react";
import { createBook } from "../../redux/apiBooks";
import { useDispatch, useSelector } from "react-redux";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { BookOpenIcon, UserIcon, DocumentTextIcon, CurrencyDollarIcon, CheckCircleIcon, ExclamationCircleIcon, PhotoIcon } from "@heroicons/react/24/outline";

const CreateBook = () => {
  const [book, setBook] = useState({
    title: "",
    author: "",
    description: "",
    price: 0,
  });
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [message, setMessage] = useState("");

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login.currentUser);
  const accessToken = user?.accessToken;
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  const handleChange = (e) => {
    setBook({ ...book, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setCoverImage(null);
      setCoverImagePreview(null);
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
      formData.append("title", book.title);
      formData.append("author", book.author);
      formData.append("description", book.description);
      formData.append("price", book.price);
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      const data = await createBook(formData, accessToken, dispatch, axiosJWT);
      setMessage("Sách đã được tạo thành công!");
      console.log("Created Book:", data);

      setBook({
        title: "",
        author: "",
        description: "",
        price: 0,
      });
      setCoverImage(null);
      setCoverImagePreview(null);
    } catch (err) {
      setMessage("Có lỗi xảy ra khi tạo sách!");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center py-8 px-4 lg:px-8">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-blue-400 mb-12 animate-fade-in">
        Tạo sách mới
      </h2>

      {message && (
        <div
          className={`flex items-center gap-2 w-full max-w-2xl text-center text-sm sm:text-base mb-6 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 animate-fade-in ${
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
        className="w-full max-w-2xl bg-gradient-to-br from-gray-800 to-gray-700 p-8 rounded-xl shadow-lg transform transition-all duration-300 animate-fade-in"
        encType="multipart/form-data" 
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
              className="w-full pl-10 pr-4 py-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-y shadow-sm hover:shadow-md"
              placeholder="Nhập mô tả sách"
              rows="4"
            />
          </div>
        </div>

        <div className="mb-6">
          <label
            className="block text-gray-300 text-sm font-semibold mb-2"
            htmlFor="coverImage"
          >
            Ảnh bìa
          </label>
          <div className="relative">
            <PhotoIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="file"
              id="coverImage"
              name="coverImage"
              accept="image/*" 
              onChange={handleImageChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm hover:shadow-md file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>
          {coverImagePreview && (
            <div className="mt-4 flex justify-center">
              <img
                src={coverImagePreview}
                alt="Cover Preview"
                className="w-32 h-48 object-cover rounded-lg shadow-md"
              />
            </div>
          )}
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

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
        >
          <BookOpenIcon className="w-5 h-5" />
          Tạo sách
        </button>
      </form>
    </div>
  );
};

export default CreateBook;