import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { getAllUsers } from "../../redux/apiRequest";
import { getAllBooks } from "../../redux/apiBooks";
import anhnen from "../../Assets/anhnenhome.png";

const Home = () => {
  // Lấy thông tin người dùng từ redux
  const user = useSelector((state) => state.auth.login?.currentUser);
  // Lấy danh sách sách từ redux (đã tạo ở bookSlice)
  const books = useSelector((state) => state.books.allBooks);
  const dispatch = useDispatch();
  const navigate = useNavigate();
 
  // Tạo instance axios có hỗ trợ interceptor cho token
  let axiosJWT = createAxios(user, dispatch, loginSuccess);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
   
    if (user?.accessToken) {
      // Gọi API lấy danh sách người dùng (nếu cần)
      getAllUsers(user?.accessToken, dispatch, axiosJWT);
      // Gọi API lấy danh sách sách
      getAllBooks(user?.accessToken, dispatch, axiosJWT);
    }
  }, [user, dispatch, navigate]);

  return (
    <div className="bg-slate-100 min-h-screen w-full">
      {/* Hiển thị hình nền */}
      <div>
        <img src={anhnen} alt="Background" className="w-full" />
      </div>
      {/* Hiển thị danh sách sách */}
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Danh sách sách</h2>
        {books && books.length > 0 ? (
          <ul className="grid grid-cols-3 gap-4">
            {books.map((book) => (
              <li key={book._id} className="bg-white p-4 shadow rounded">
                <h3 className="font-bold text-lg">{book.title}</h3>
                <p className="text-gray-600">{book.author}</p>
                <p>{book.description}</p>
                <p className="text-red-500 font-bold">{book.price} ₫</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Không có sách nào</p>
        )}
      </div>
    </div>
  );
};

export default Home;
