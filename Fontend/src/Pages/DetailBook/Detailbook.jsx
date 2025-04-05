import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getBookDetail } from "../../redux/apiBooks";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import ReviewSection from "../ReviewSection/ReviewSection";

const DetailBook = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.login?.currentUser);
  const book = useSelector((state) => state.books.detailBook);
  const axiosJWT = createAxios(user, dispatch, loginSuccess);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    getBookDetail(id, user.accessToken, dispatch, axiosJWT);
  }, [id, user, dispatch, axiosJWT, navigate]);

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300 dark:from-zinc-900 dark:to-zinc-800 text-gray-900 dark:text-white transition-all duration-300">
        <p className="text-gray-600 dark:text-gray-400 text-lg italic font-serif animate-fade-in">
          Đang tải sách...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-300 dark:from-zinc-900 dark:to-zinc-800 text-gray-900 dark:text-white px-6 sm:px-12 py-32 transition-all duration-300">
      <h4 data-aos="slide-up" className="text-4xl sm:text-5xl font-bold text-center mb-12 tracking-tight animate-fade-in bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-500 bg-clip-text text-transparent">
        Chi Tiết Sách
      </h4>

      <div data-aos="zoom-in" className="max-w-4xl mx-auto bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 md:p-10 transform transition-all duration-500 hover:shadow-2xl animate-slide-up">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="relative flex-shrink-0 group">
            <img
              src={book.image || "https://via.placeholder.com/150"}
              alt={book.title}
              className="w-72 h-full object-cover rounded-lg shadow-md border border-gray-200 dark:border-zinc-700 transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300"></div>
          </div>

          <div className="flex flex-col space-y-5 text-gray-900 dark:text-white">
            <h2 className="text-3xl font-bold mb-2 tracking-tight border-b-2 border-cyan-500 dark:border-cyan-400 pb-1 animate-fade-in-up">
              {book.title}
            </h2>
            <p className="text-lg animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Tác giả:</span>{" "}
              <span className="text-gray-800 dark:text-gray-200 italic">{book.author}</span>
            </p>
            <p className="text-lg animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Thể loại:</span>{" "}
              <span className="text-green-700 dark:text-green-400 font-medium">{book.category}</span>
            </p>
            <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed italic bg-gray-50 dark:bg-zinc-700 p-4 rounded-lg shadow-inner animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              "{book.description || "Không có mô tả"}"
            </p>
            <p className="text-red-600 dark:text-red-400 font-bold text-2xl mt-2 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              {book.price.toLocaleString("vi-VN")} ₫
            </p>

            <button className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg hover:from-cyan-600 hover:to-blue-700 dark:hover:from-cyan-700 dark:hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
              Mua ngay
            </button>
          </div>
         
        </div>
        <ReviewSection type="book" itemId={book._id} user={user} />
      </div>
      
    </div>
  );
};

export default DetailBook;