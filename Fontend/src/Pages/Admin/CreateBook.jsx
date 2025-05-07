import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createBook } from "../../redux/apiBooks";
import { getCategory } from "../../redux/apiCategory";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import {
  BookOpenIcon,
  UserIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PhotoIcon,
  TagIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  HashtagIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import LoadingSpinner from "./LoadingSpinner";

const CreateBook = () => {
  const [book, setBook] = useState({
    title: "",
    author: "",
    publishedYear: 0,
    price: "0",
    quantity: "1",
    category: "",
    image: null,
    description: "",
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login.currentUser);
  const accessToken = user?.accessToken;
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        if (!accessToken) {
          console.warn("Chưa đăng nhập, không thể lấy danh mục.");
          return;
        }
        const data = await getCategory(accessToken, dispatch, axiosJWT);
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error("Dữ liệu danh mục không hợp lệ:", data);
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh sách danh mục:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [accessToken, axiosJWT, dispatch]);

  const formatPrice = (value) => {
    const num = parseInt(value.replace(/\./g, ""), 10) || 0;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "price" || name === "quantity") {
      const rawValue = value.replace(/\./g, "");
      if (!/^\d*$/.test(rawValue)) return;
      const formattedValue = formatPrice(rawValue);
      setBook({ ...book, [name]: formattedValue });
    } else {
      setBook({ ...book, [name]: value });
    }
  };

  const handleIncrease = () => {
    const rawValue = parseInt(book.price.replace(/\./g, ""), 10) || 0;
    const newValue = rawValue + 1000;
    setBook({ ...book, price: formatPrice(newValue.toString()) });
  };

  const handleDecrease = () => {
    const rawValue = parseInt(book.price.replace(/\./g, ""), 10) || 0;
    const newValue = Math.max(0, rawValue - 1000);
    setBook({ ...book, price: formatPrice(newValue.toString()) });
  };

  const handleIncreaseQuantity = () => {
    const rawValue = parseInt(book.quantity.replace(/\./g, ""), 10) || 1;
    const newValue = rawValue + 1;
    setBook({ ...book, quantity: newValue.toString() });
  };

  const handleDecreaseQuantity = () => {
    const rawValue = parseInt(book.quantity.replace(/\./g, ""), 10) || 1;
    const newValue = Math.max(1, rawValue - 1);
    setBook({ ...book, quantity: newValue.toString() });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBook({ ...book, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (!accessToken) {
        setMessage("Bạn cần đăng nhập để tạo sách.");
        return;
      }

      const formData = new FormData();
      Object.keys(book).forEach((key) => {
        if (key === "price" || key === "quantity") {
          formData.append(key, book[key].replace(/\./g, ""));
        } else {
          formData.append(key, book[key]);
        }
      });

      const data = await createBook(formData, accessToken, dispatch, axiosJWT);
      setMessage("Sách đã được tạo thành công!");

      setBook({
        title: "",
        author: "",
        publishedYear: 0,
        price: "0",
        quantity: "1",
        category: "",
        image: null,
        description: "",
      });
      setPreviewImage(null);
    } catch (err) {
      setMessage("Có lỗi xảy ra khi tạo sách!");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
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
        <svg
          className="absolute bottom-0 left-0 w-full h-32 text-cyan-200/20 dark:text-cyan-800/20"
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
      <div className="w-full max-w-2xl bg-white/90 dark:bg-gray-800/90 p-6 sm:p-8 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] relative z-10">

        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-cyan-600 dark:text-cyan-400 mb-8 sm:mb-12 tracking-tight drop-shadow-lg animate-slide-up">
          Tạo sách mới
        </h2>

        {message && (
          <div
            className={`flex items-center gap-2 w-full text-center text-sm sm:text-base mb-6 sm:mb-8 px-4 sm:px-6 py-3 rounded-xl shadow-xl transition-all duration-300 ease-in-out animate-fade-in ${
              message.includes("thành công")
                ? "bg-teal-500 dark:bg-teal-400 text-white"
                : "bg-red-500 dark:bg-red-400 text-white"
            }`}
          >
            {message.includes("thành công") ? (
              <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            ) : (
              <ExclamationCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            )}
            <p>{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 animate-slide-up">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2" htmlFor="title">
                Tiêu đề
              </label>
              <div className="relative">
                <BookOpenIcon className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 dark:text-cyan-400" />
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={book.title}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className={`w-full pl-8 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-600 text-xs sm:text-base ${
                    isLoading ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                  placeholder="Nhập tiêu đề sách"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2" htmlFor="author">
                Tác giả
              </label>
              <div className="relative">
                <UserIcon className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 dark:text-cyan-400" />
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={book.author}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className={`w-full pl-8 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-600 text-xs sm:text-base ${
                    isLoading ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                  placeholder="Nhập tên tác giả"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 animate-slide-up">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2" htmlFor="price">
                Giá
              </label>
              <div className="relative flex items-center">
                <CurrencyDollarIcon className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 dark:text-cyan-400" />
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={book.price}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className={`w-full pl-8 sm:pl-12 pr-16 py-2 sm:py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-600 text-xs sm:text-base ${
                    isLoading ? "opacity-75 cursor-not-allowed" : ""
                  }`}
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
                    className={`p-0.5 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors duration-200 ${
                      isLoading ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                  >
                    <ChevronUpIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDecrease}
                    disabled={isLoading}
                    className={`p-0.5 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors duration-200 ${
                      isLoading ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                  >
                    <ChevronDownIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2" htmlFor="quantity">
                Số lượng
              </label>
              <div className="relative flex items-center">
                <HashtagIcon className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 dark:text-cyan-400" />
                <input
                  id="quantity"
                  name="quantity"
                  value={book.quantity}
                  onChange={handleChange}
                  min="1"
                  required
                  type="text"
                  disabled={isLoading}
                  className={`w-full pl-8 sm:pl-12 pr-16 py-2 sm:py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-600 text-xs sm:text-base ${
                    isLoading ? "opacity-75 cursor-not-allowed" : ""
                  }`}
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
                    className={`p-0.5 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors duration-200 ${
                      isLoading ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                  >
                    <ChevronUpIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDecreaseQuantity}
                    disabled={isLoading}
                    className={`p-0.5 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors duration-200 ${
                      isLoading ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                  >
                    <ChevronDownIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 animate-slide-up">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2" htmlFor="publishedYear">
              Năm xuất bản
            </label>
            <div className="relative">
              <UserIcon className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 dark:text-cyan-400" />
              <input
                id="publishedYear"
                name="publishedYear"
                value={book.publishedYear}
                onChange={handleChange}
                required
                type="number"
                disabled={isLoading}
                className={`w-full pl-8 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-600 text-xs sm:text-base ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
                placeholder="Nhập năm xuất bản"
              />
            </div>
          </div>

          <div className="mb-6 animate-slide-up">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2" htmlFor="description">
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
                className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 resize-y placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
                placeholder="Nhập mô tả sách"
                rows="4"
              />
            </div>
          </div>

          <div className="mb-6 animate-slide-up">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2" htmlFor="category">
              Danh mục
            </label>
            <div className="relative">
              <TagIcon className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 dark:text-cyan-400" />
              <select
                id="category"
                name="category"
                value={book.category}
                onChange={handleChange}
                required
                disabled={isLoading}
                className={`w-full pl-8 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 appearance-none placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-600 text-xs sm:text-base ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
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

          <div className="mb-8 animate-slide-up">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Hình ảnh</label>
            <div className="relative">
              <label
                htmlFor="image"
                className={`group flex items-center justify-center w-full h-48 bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-cyan-500 dark:hover:border-cyan-400 transition-all duration-300 shadow-md ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {previewImage ? (
                  <div className="relative w-full h-full">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-xl group-hover:opacity-90 transition-opacity duration-300"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-cyan-600 dark:text-cyan-400 font-medium bg-gray-900/70 dark:bg-gray-800/70 px-3 py-1 rounded-full">
                        Thay ảnh
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <PhotoIcon className="w-12 h-12 mx-auto text-cyan-600 dark:text-cyan-400 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors duration-200" />
                    <p className="mt-2 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-200">
                      Nhấp để chọn hoặc kéo ảnh vào đây
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className="hidden"
                />
              </label>
            </div>
            {book.image && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 truncate transition-all duration-300 ease-in-out">
                Đã chọn: {book.image.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-cyan-500 dark:from-cyan-400 to-blue-600 dark:to-blue-500 text-white font-semibold py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 shadow-md sm:shadow-lg transform ${
              isLoading ? "opacity-75 cursor-not-allowed" : "hover:from-cyan-600 dark:hover:from-cyan-500 hover:to-blue-700 dark:hover:to-blue-600 hover:shadow-lg sm:hover:shadow-xl hover:-translate-y-0.5 sm:hover:-translate-y-1"
            }`}
          >
            <BookOpenIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            Tạo sách
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBook;