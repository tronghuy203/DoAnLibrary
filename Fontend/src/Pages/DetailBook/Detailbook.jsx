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
    return <p className="text-gray-400 text-center text-lg animate-fade-in">Đang tải...</p>;
  }

  return (
    <div className="bg-zinc-900 text-white px-10 py-8">
      <h4 className="text-3xl font-bold text-yellow-100 mb-6">Chi tiết sách</h4>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Hình ảnh sách */}
        <img src={book.image} alt={book.title} className="w-64 h-80 object-cover rounded-lg shadow-lg" />
        
        {/* Thông tin sách */}
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-white mb-2">{book.title}</h2>
          <p className="text-gray-400 text-lg mb-2"><span className="font-semibold">Tác giả:</span> {book.author}</p>
          <p className="text-green-400 text-lg mb-2"><span className="font-semibold">Thể loại:</span> {book.category}</p>
          <p className="text-gray-300 text-lg mb-4">{book.description}</p>
          <p className="text-red-400 font-bold text-xl mb-4">{book.price.toLocaleString("vi-VN")} ₫</p>
          
          {/* Nút mua sách */}
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg">
            Mua ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailBook;
