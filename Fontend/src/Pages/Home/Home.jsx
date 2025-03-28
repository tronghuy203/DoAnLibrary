import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { getAllUsers } from "../../redux/apiRequest";
import { getAllBooks } from "../../redux/apiBooks";
import Hero from "../Home/Hero";
import { Link } from "react-router-dom";
// import RecentlyAdded  from "../Home/RecentlyAdded";

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
    <div className="">
      <div className="bg-zinc-900 text-white px-10 py-8">
        <Hero />
        <div className="p-4 lg:p-6">
          <h4 className="text-3xl sm:text-4xl font-bold text-yellow-100 mb-8 animate-fade-in">
            Recently Added Books
          </h4>

          {books && books.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <li
                  key={book._id}
                  className="bg-gradient-to-br from-gray-800 to-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 animate-fade-in"
                >
                  <h3 className="font-bold text-lg sm:text-xl text-gray-100 mb-2 truncate">
                    {book.title}
                  </h3>
                  <p className="text-gray-400 text-sm sm:text-base mb-2">
                    <span className="font-semibold">Tác giả:</span> {book.author}
                  </p>
                  <p className="text-gray-300 text-sm sm:text-base mb-3 line-clamp-3">
                    {book.description}
                  </p>
                  <p className="text-red-400 font-bold text-lg sm:text-xl mb-4">
                    {book.price.toLocaleString("vi-VN")} ₫
                  </p>
                  <Link to={`/books/${book._id}`}>
                    <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200 shadow-md hover:shadow-lg">
                      Xem chi tiết
                    </button>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center text-lg animate-fade-in">
              Không có sách nào
            </p>
          )}
        </div>
      </div>

    </div>
  );
};

export default Home;
