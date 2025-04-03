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
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-300 dark:from-zinc-900 dark:to-zinc-800 text-gray-900 dark:text-white px-4 sm:px-10 py-12 transition-all duration-300">
      <h4 data-aos="slide-up" className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-12 mt-10 tracking-tight animate-fade-in bg-clip-text text-transparent bg-gradient-to-b from-sky-600 to-cyan-200">
        Thư Viện Sách
      </h4>

      {books && books.length > 0 ? (
        <ul data-aos="zoom-in" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {books.map((book, index) => (
            <li
              key={book._id}
              className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 hover:shadow-2xl transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div  className="relative group">
                <img
                  src={
                    book.image && book.image.trim() !== ""
                      ? book.image
                      : "https://via.placeholder.com/150"
                  }
                  alt={book.title}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                  <Link to={`/books/${book._id}`}>
                    <button className="bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1">
                      Xem chi tiết
                    </button>
                  </Link>
                </div>
              </div>

              <div className="p-5">
                <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">
                  {book.title}
                </h5>
                <p className="text-red-500 dark:text-red-400 font-bold text-xl">
                  {book.price.toLocaleString("vi-VN")} ₫
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p data-aos="slide-up" className="text-gray-600 dark:text-gray-400 text-lg text-center italic animate-fade-in">
          Hiện chưa có sách nào trong thư viện
        </p>
      )}
    </div>
  );
};

export default AllBooks;