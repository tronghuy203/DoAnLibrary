import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getBookDetail } from "../../redux/apiBooks";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-100 to-yellow-50">
        <p className="text-gray-600 text-lg italic font-serif animate-fade-in">Đang tải sách...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-100 to-yellow-50 px-6 sm:px-12 py-12 font-serif">
      <h4 className="text-4xl sm:text-5xl font-bold text-amber-900 mb-10 text-center tracking-wide drop-shadow-md">
        Chi tiết sách
      </h4>

      <div className="max-w-4xl mx-auto bg-yellow-50 border-4 border-amber-200 rounded-lg shadow-lg p-8 md:p-10 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="relative flex-shrink-0">
            <img
              src={book.image || "https://via.placeholder.com/150"}
              alt={book.title}
              className="w-72 h-96 object-cover rounded-md shadow-md border-4 border-amber-300 transform rotate-1 hover:rotate-0 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-amber-900/10 rounded-md pointer-events-none"></div>
          </div>

          <div className="flex flex-col space-y-4 text-amber-900">
            <h2 className="text-3xl font-bold text-amber-800 mb-2 tracking-tight border-b-2 border-amber-300 pb-1">
              {book.title}
            </h2>
            <p className="text-lg">
              <span className="font-semibold text-amber-700">Tác giả:</span>{" "}
              <span className="text-amber-800 italic">{book.author}</span>
            </p>
            <p className="text-lg">
              <span className="font-semibold text-amber-700">Thể loại:</span>{" "}
              <span className="text-green-800 font-medium">{book.category}</span>
            </p>
            <p className="text-amber-800 text-lg leading-relaxed italic bg-amber-100 p-4 rounded-md shadow-inner">
              "{book.description || "Không có mô tả"}"
            </p>
            <p className="text-red-700 font-bold text-2xl mt-2">
              {book.price.toLocaleString("vi-VN")} ₫
            </p>

            <button className="mt-4 bg-amber-700 text-white font-semibold py-3 px-8 rounded-lg hover:bg-amber-800 transition-all duration-300 shadow-md hover:shadow-lg border-2 border-amber-600">
              Mua ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailBook;