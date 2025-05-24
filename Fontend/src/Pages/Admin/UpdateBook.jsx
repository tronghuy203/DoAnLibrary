import React, { useEffect, useMemo, useState } from "react";
import { updateBook, getAllBooks } from "../../redux/apiBooks";
import { getCategory } from "../../redux/apiCategory";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import {
  BookOpenIcon,
  UserIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon,
  PhotoIcon,
  TagIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  HashtagIcon,
} from "@heroicons/react/24/outline";
import LoadingSpinner from "./LoadingSpinner";

const UpdateBook = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState({
    title: "",
    author: "",
    description: "",
    publishedYear: 0,
    price: "0",
    quantity: "1",
    category: "",
    image: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.login.currentUser);
  const books = useSelector((state) => state.books.allBooks);

  const axiosJWT = useMemo(
    () => createAxios(user, dispatch, loginSuccess),
    [user, dispatch]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (!user?.accessToken) {
          setError("Bạn cần đăng nhập để cập nhật sách.");
          return;
        }

        const categoryData = await getCategory(
          user.accessToken,
          dispatch,
          axiosJWT
        );
        setCategories(Array.isArray(categoryData) ? categoryData : []);

        await dispatch(getAllBooks(user.accessToken, axiosJWT));
      } catch (error) {
        setError("Lỗi khi tải dữ liệu sách hoặc danh mục.");
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dispatch, user, axiosJWT]);

  useEffect(() => {
    if (isLoading) return;

    const foundBook = books.find((b) => b._id === bookId);
    if (foundBook) {
      setBook({
        ...foundBook,
        price: formatPrice(foundBook.price.toString()),
        quantity: foundBook.quantity ? foundBook.quantity.toString() : "1",
        publishedYear: foundBook.publishedYear || 0,
        image: foundBook.image || null,
      });
      if (foundBook.image) {
        setPreviewImage(foundBook.image);
      }
    } else if (books.length > 0) {
      setError("Không tìm thấy sách.");
    }
  }, [books, bookId, isLoading]);

  const formatPrice = (value) => {
    const num = parseInt(value.replace(/\./g, "")) || 0;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "price") {
      const rawValue = value.replace(/\./g, "");
      if (!/^\d*$/.test(rawValue)) return;
      const formattedValue = formatPrice(rawValue);
      setBook({ ...book, [name]: formattedValue });
    } else if (name === "quantity") {
      const rawValue = value.replace(/\./g, "");
      if (!/^\d*$/.test(rawValue)) return;
      setBook({ ...book, [name]: rawValue });
    } else if (name === "image") {
      const file = e.target.files[0];
      if (file) {
        setBook({ ...book, image: file });
        setPreviewImage(URL.createObjectURL(file));
      }
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
      setIsLoading(true);
      if (!user?.accessToken) {
        setError("Bạn cần đăng nhập để cập nhật sách.");
        return;
      }

      const formData = new FormData();
      Object.keys(book).forEach((key) => {
        if (key === "price" || key === "quantity") {
          formData.append(key, book[key].replace(/\./g, ""));
        } else if (key === "image" && book[key]) {
          formData.append(key, book[key]);
        } else if (key !== "image") {
          formData.append(key, book[key] || "");
        }
      });
      await updateBook(bookId, formData, user.accessToken, dispatch, axiosJWT);
      navigate("/admin/books/list");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Cập nhật thất bại! Vui lòng thử lại.";
      setError(errorMessage);
      console.error("Error updating book:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center py-8 px-4 transition-all duration-500 ease-in-out relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/40 via-blue-200/30 to-purple-200/40 dark:from-cyan-800/30 dark:via-blue-800/30 dark:to-purple-800/30 animate-gradient-slow"></div>
          <svg
            className="absolute bottom-0 left-0 w-full h-48 text-cyan-300/30 dark:text-cyan-700/30"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              fill="currentColor"
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,186.7C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
        <LoadingSpinner isLoading={isLoading} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center py-8 px-4 transition-all duration-500 ease-in-out relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/40 via-blue-200/30 to-purple-200/40 dark:from-cyan-800/30 dark:via-blue-800/30 dark:to-purple-800/30 animate-gradient-slow"></div>
          <svg
            className="absolute bottom-0 left-0 w-full h-48 text-cyan-300/30 dark:text-cyan-700/30"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              fill="currentColor"
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,186.7C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
        <div className="relative z-10 flex items-center gap-2 bg-red-500/90 dark:bg-red-400/90 text-white px-6 py-3 rounded-xl shadow-xl transition-all duration-300 animate-pulse">
          <ExclamationCircleIcon className="w-6 h-6" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col items-center py-12 px-4 sm:px-8 lg:px-12 transition-all duration-500 ease-in-out relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/40 via-blue-200/30 to-purple-200/40 dark:from-cyan-800/30 dark:via-blue-800/30 dark:to-purple-800/30 animate-gradient-slow"></div>
        <div className="absolute top-[-15%] left-[-15%] w-80 h-80 bg-cyan-400/20 dark:bg-cyan-600/15 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-blue-400/20 dark:bg-blue-600/15 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-[50%] left-[70%] w-64 h-64 bg-purple-400/20 dark:bg-purple-600/15 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-[10%] right-[20%] w-56 h-56 bg-cyan-300/20 dark:bg-cyan-500/15 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute inset-0">
          <div className="absolute w-3 h-3 bg-cyan-500/50 dark:bg-cyan-400/40 rounded-full top-[15%] left-[10%] animate-particle"></div>
          <div className="absolute w-2 h-2 bg-blue-500/50 dark:bg-blue-400/40 rounded-full top-[45%] left-[75%] animate-particle-slow"></div>
          <div className="absolute w-3 h-3 bg-purple-500/50 dark:bg-purple-400/40 rounded-full top-[65%] left:[25%] animate-particle"></div>
          <div className="absolute w-2 h-2 bg-cyan-500/50 dark:bg-cyan-400/40 rounded-full top-[5%] left-[55%] animate-particle-slow"></div>
          <div className="absolute w-3 h-3 bg-blue-500/50 dark:bg-blue-400/40 rounded-full top-[30%] left-[85%] animate-particle"></div>
        </div>
        <svg
          className="absolute bottom-0 left-0 w-full h-48 text-cyan-300/30 dark:text-cyan-700/30"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,186.7C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      <LoadingSpinner isLoading={isLoading} />
      <div className="w-full max-w-4xl relative z-10">
        <div className="text-center mb-10 animate-slide-up">
          <BookOpenIcon className="w-16 h-16 mx-auto text-cyan-600 dark:text-cyan-400 mb-3 animate-pulse" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-cyan-600 dark:text-cyan-400 tracking-tight drop-shadow-lg">
            Cập Nhật Sách
          </h2>
          <p className="mt-2 text-lg sm:text-xl text-gray-600 dark:text-gray-300">
            Chỉnh sửa thông tin sách một cách dễ dàng
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] animate-slide-up"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label
                  className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2"
                  htmlFor="title"
                >
                  Tiêu đề
                </label>
                <div className="relative">
                  <BookOpenIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={book.title}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 hover:bg-gray-100/80 dark:hover:bg-gray-600/80 ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
                    placeholder="Nhập tiêu đề sách"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2"
                  htmlFor="author"
                >
                  Tác giả
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={book.author}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 hover:bg-gray-100/80 dark:hover:bg-gray-600/80 ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
                    placeholder="Nhập tên tác giả"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2"
                  htmlFor="publishedYear"
                >
                  Năm xuất bản
                </label>
                <div className="relative">
                  <DocumentTextIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                  <input
                    type="number"
                    id="publishedYear"
                    name="publishedYear"
                    value={book.publishedYear}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 hover:bg-gray-100/80 dark:hover:bg-gray-600/80 ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
                    placeholder="Nhập năm xuất bản"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2"
                  htmlFor="category"
                >
                  Danh mục
                </label>
                <div className="relative">
                  <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                  <select
                    id="category"
                    name="category"
                    value={book.category}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 appearance-none placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 hover:bg-gray-100/80 dark:hover:bg-gray-600/80 ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
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
            </div>

            <div className="space-y-6">
              <div>
                <label
                  className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2"
                  htmlFor="price"
                >
                  Giá
                </label>
                <div className="relative flex items-center">
                  <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                  <input
                    type="text"
                    id="price"
                    name="price"
                    value={book.price}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className={`w-full pl-10 pr-12 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 hover:bg-gray-100/80 dark:hover:bg-gray-600/80 ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
                    placeholder="Nhập giá sách"
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                  <div className="absolute right-2 flex flex-col">
                    <button
                      type="button"
                      onClick={handleIncrease}
                      disabled={isLoading}
                      className={`p-0.5 text-cyan-500 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors duration-200 ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
                    >
                      <ChevronUpIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleDecrease}
                      disabled={isLoading}
                      className={`p-0.5 text-cyan-500 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors duration-200 ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
                    >
                      <ChevronDownIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label
                  className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2"
                  htmlFor="quantity"
                >
                  Số lượng
                </label>
                <div className="relative flex items-center">
                  <HashtagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                  <input
                    type="text"
                    id="quantity"
                    name="quantity"
                    value={book.quantity}
                    onChange={handleChange}
                    min="1"
                    required
                    disabled={isLoading}
                    className={`w-full pl-10 pr-12 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 hover:bg-gray-100/80 dark:hover:bg-gray-600/80 ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
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
                      disabled={isLoading}
                      className={`p-0.5 text-cyan-500 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors duration-200 ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
                    >
                      <ChevronUpIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleDecreaseQuantity}
                      disabled={isLoading}
                      className={`p-0.5 text-cyan-500 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors duration-200 ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
                    >
                      <ChevronDownIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label
                  className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2"
                  htmlFor="description"
                >
                  Mô tả
                </label>
                <div className="relative">
                  <DocumentTextIcon className="absolute left-3 top-4 w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                  <textarea
                    id="description"
                    name="description"
                    value={book.description}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 resize-y placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 hover:bg-gray-100/80 dark:hover:bg-gray-600/80 ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
                    placeholder="Nhập mô tả sách"
                    rows="3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                  Hình ảnh
                </label>
                <div className="relative">
                  <label
                    htmlFor="image"
                    className={`group flex items-center justify-center w-full h-32 bg-gray-50 dark:bg-gray-700 border-2 border-gray-300/50 dark:border-gray-600/50 rounded-xl cursor-pointer hover:bg-gray-100/80 dark:hover:bg-gray-600/80 hover:border-cyan-500 dark:hover:border-cyan-400 transition-all duration-300 shadow-md ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
                  >
                    {previewImage ? (
                      <div className="relative w-full h-full">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-xl opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-cyan-500 dark:text-cyan-400 font-medium bg-gray-900/70 dark:bg-gray-800/70 px-3 py-1 rounded-full">
                            Thay ảnh
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <PhotoIcon className="w-10 h-10 mx-auto text-cyan-500 dark:text-cyan-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors duration-200" />
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-200">
                          Chọn hoặc kéo ảnh vào đây
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      id="image"
                      name="image"
                      accept="image/*"
                      onChange={handleChange}
                      disabled={isLoading}
                      className="hidden"
                    />
                  </label>
                </div>
                {book.image && book.image instanceof File && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 truncate transition-all duration-300">
                    Đã chọn: {book.image.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 dark:from-cyan-400 to-teal-500 dark:to-teal-400 text-white font-semibold py-2.5 rounded-xl transition-all duration-300 shadow-md ${isLoading ? "opacity-75 cursor-not-allowed" : "hover:from-cyan-600 dark:hover:from-cyan-500 hover:to-teal-600 dark:hover:to-teal-500 hover:shadow-lg hover:scale-105"}`}
            >
              <BookOpenIcon className="w-5 h-5" />
              Cập nhật
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/books/list")}
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100 font-semibold py-2.5 rounded-xl transition-all duration-300 shadow-md ${isLoading ? "opacity-75 cursor-not-allowed" : "hover:bg-gray-400 dark:hover:bg-gray-500 hover:shadow-lg hover:scale-105"}`}
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateBook;
