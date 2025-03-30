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
    <div className="bg-zinc-900 text-white px-10 py-8">
      {/* Tiêu đề */}
      <h4 className="text-3xl sm:text-4xl font-bold text-yellow-100 mb-8 animate-fade-in">
        Toàn bộ Sách
      </h4>

      {/* Danh sách sách */}
      {books && books.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <li
              key={book._id}
              className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 animate-fade-in"
            >
              {/* Hình ảnh sách */}
              <img 
                src={book.image && book.image.trim() !== "" ? book.image : "https://via.placeholder.com/150"} 
                alt={book.title} 
                className="w-full h-52 object-cover rounded-lg mb-4"
              />

              {/* Giá sách */}
              <p className="text-red-400 font-bold text-lg sm:text-xl mb-4 text-center">
                {book.price.toLocaleString("vi-VN")} ₫
              </p>

              {/* Nút xem chi tiết */}
              <Link to={`/books/${book._id}`}>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200 shadow-md hover:shadow-lg">
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
  );
};

export default AllBooks;
