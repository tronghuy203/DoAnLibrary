import React, { useEffect, useMemo, useState } from "react";
import { updateBook, getAllBooks } from "../../redux/apiBooks";
import { getCategory } from "../../redux/apiCategory";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { BookOpenIcon, UserIcon, DocumentTextIcon, CurrencyDollarIcon, ArrowLeftIcon, ExclamationCircleIcon, ArrowPathIcon, PhotoIcon, TagIcon, ChevronUpIcon, ChevronDownIcon, HashtagIcon } from "@heroicons/react/24/outline";

const UpdateBook = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState({ title: "", author: "", description: "", price: "0", quantity: "1", category: "", image: null });
  const [previewImage, setPreviewImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.login.currentUser);

  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryData = await getCategory(user.accessToken, dispatch, axiosJWT);
        setCategories(categoryData);
      } catch (err) {
        console.error("Error fetching categories", err);
      }
    };

    const fetchBooks = async () => {
      try {
        setLoading(true);
        const books = await getAllBooks(user.accessToken, dispatch, axiosJWT);
        const foundBook = books.find((b) => b._id === bookId);
        if (foundBook) {
          setBook({
            ...foundBook,
            price: formatPrice(foundBook.price.toString()),
            quantity: foundBook.quantity ? foundBook.quantity.toString() : "1"
          });
          if (foundBook.image) {
            setPreviewImage(foundBook.image);
          }
        } else {
          setError("Không tìm thấy sách.");
        }
      } catch (error) {
        setError("Lỗi khi tải dữ liệu sách.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    fetchBooks();
  }, [bookId, dispatch, user, axiosJWT]);

  const formatPrice = (value) => {
    const num = parseInt(value.replace(/\./g, "")) || 0;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "price" || name === "quantity") {
      const rawValue = value.replace(/\./g, "");
      if (!/^\d*$/.test(rawValue)) return;
      const formattedValue = name === "price" ? formatPrice(rawValue) : rawValue;
      setBook({ ...book, [name]: formattedValue });
    } else if (name === "image") {
      const file = e.target.files[0];
      setBook({ ...book, image: file });
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setBook({ ...book, [name]: value });
    }
  };

  const handleIncrease = () => {
    const rawValue = parseInt(book.price.replace(/\./g, "")) || 0;
    const newValue = rawValue + 1000;
    setBook({ ...book, price: formatPrice(newValue.toString()) });
  };

  const handleDecrease = () => {
    const rawValue = parseInt(book.price.replace(/\./g, "")) || 0;
    const newValue = Math.max(0, rawValue - 1000);
    setBook({ ...book, price: formatPrice(newValue.toString()) });
  };

  const handleIncreaseQuantity = () => {
    const newValue = parseInt(book.quantity) + 1;
    setBook({ ...book, quantity: newValue.toString() });
  };

  const handleDecreaseQuantity = () => {
    const newValue = Math.max(1, parseInt(book.quantity) - 1);
    setBook({ ...book, quantity: newValue.toString() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(book).forEach((key) => {
        if (key === "price" || key === "quantity") {
          formData.append(key, book[key].replace(/\./g, ""));
        } else {
          formData.append(key, book[key]);
        }
      });

      await updateBook(bookId, formData, user.accessToken, dispatch, axiosJWT);
      alert("Cập nhật thành công!");
      navigate("/admin/books/list");
    } catch (error) {
      alert("Cập nhật thất bại! Vui lòng thử lại.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-gray-100 flex flex-col items-center justify-center py-8 px-4">
        <div className="flex items-center gap-2 text-gray-300 text-lg animate-pulse">
          <ArrowPathIcon className="w-6 h-6 animate-spin" />
          <p>Đang tải dữ liệu sách...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-gray-100 flex flex-col items-center justify-center py-8 px-4">
        <div className="flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-xl">
          <ExclamationCircleIcon className="w-6 h-6" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-gray-100 flex flex-col items-center py-12 px-4 sm:px-8 lg:px-12">
      <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-cyan-400 mb-12 tracking-tight drop-shadow-lg">
        Cập nhật sách
      </h2>

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
          <label className="block text-gray-200 text-sm font-medium mb-2" htmlFor="quantity">
            Số lượng
          </label>
          <div className="relative flex items-center">
            <HashtagIcon className="absolute left-3 w-5 h-5 text-cyan-400" />
            <input
              id="quantity"
              name="quantity"
              value={book.quantity}
              onChange={handleChange}
              min="1"
              required
              className="w-full pl-10 pr-16 py-3 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500 transition-all duration-200"
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
            <div className="absolute right-2 flex flex-col">
              <button
                type="button"
                onClick={handleIncreaseQuantity}
                className="p-0.5 text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
              >
                <ChevronUpIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleDecreaseQuantity}
                className="p-0.5 text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
              >
                <ChevronDownIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-200 text-sm font-medium mb-2" htmlFor="price">
            Giá
          </label>
          <div className="relative flex items-center">
            <CurrencyDollarIcon className="absolute left-3 w-5 h-5 text-cyan-400" />
            <input
              type="text"
              id="price"
              name="price"
              value={book.price}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-16 py-3 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500 transition-all duration-200"
              placeholder="Nhập giá sách"
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
            <div className="absolute right-2 flex flex-col gap-0.5">
              <button
                type="button"
                onClick={handleIncrease}
                className="p-0.5 text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
              >
                <ChevronUpIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleDecrease}
                className="p-0.5 text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
              >
                <ChevronDownIcon className="w-4 h-4" />
              </button>
            </div>
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
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
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
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
            </label>
          </div>
          {book.image && book.image.name && (
            <p className="mt-2 text-sm text-gray-400 truncate">Đã chọn: {book.image.name}</p>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <BookOpenIcon className="w-5 h-5" />
            Cập nhật
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/books/list")}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
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