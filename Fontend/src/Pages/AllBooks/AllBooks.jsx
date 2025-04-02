import { Link } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { getAllUsers } from "../../redux/apiRequest";
import { getAllBooks } from "../../redux/apiBooks";

const AllBooks = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const books = useSelector((state) => state.books.allBooks);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        await getAllUsers(user.accessToken, dispatch, axiosJWT);
        await getAllBooks(user.accessToken, dispatch, axiosJWT);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };

    fetchData();
  }, [user, dispatch, axiosJWT, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-gray-800 text-white px-4 sm:px-10 py-12">
      <h4 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-yellow-200 mb-10 mt-10 text-center tracking-tight animate-fade-in">
        Thư viện sách
      </h4>
      {books && books.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {books.map((book) => (
            <li
              key={book._id}
              className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transform hover:scale-105 hover:shadow-2xl transition-all duration-300 animate-fade-in-up"
            >
              <div className="relative">
                <img
                  src={
                    book.image && book.image.trim() !== ""
                      ? book.image
                      : "https://via.placeholder.com/150"
                  }
                  alt={book.title}
                  className="w-full h-64 object-cover transition-transform duration-300 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <div className="p-5">
                <h5 className="text-lg font-semibold text-white mb-2 truncate">{book.title}</h5>
                <p className="text-red-400 font-bold text-xl mb-4">
                  {book.price.toLocaleString("vi-VN")} ₫
                </p>

                <Link to={`/books/${book._id}`}>
                  <button className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg">
                    Xem chi tiết
                  </button>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-300 text-lg text-center italic animate-fade-in">
          Hiện chưa có sách nào trong thư viện
        </p>
      )}
    </div>
  );
};

export default AllBooks;