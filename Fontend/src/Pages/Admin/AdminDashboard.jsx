
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { UserGroupIcon, BookOpenIcon, ClockIcon } from "@heroicons/react/24/outline";
import { getAllBooks } from "../../redux/apiBooks";
import { getAllUsers } from "../../redux/apiRequest";
import { getAllBorrowRecords, getTotalRevenue, getDailyRevenue } from "../../redux/apiBorrow";
import { createAxios } from "../../createInstance";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { loginSuccess } from "../../redux/authSlice";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.login.currentUser);
  const { allBooks, isFetching: booksFetching} = useSelector((state) => state.books);
  const usersState = useSelector((state) => state.users);
  const { borrowRecords, isFetching: borrowsFetching} = useSelector((state) => state.borrow);

  const allUsers = usersState?.users?.allUsers || [];
  const usersFetching = usersState?.users?.isFetching || false;  const axiosJWT = useMemo(() => (createAxios(user, dispatch, loginSuccess)),[user, dispatch]);
  const [mostBorrowedBook, setMostBorrowedBook] = useState(null)
  const [mostActiveUser, setMostActiveUser] = useState(null);


  useEffect(() => {
    if (!user?.accessToken) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.accessToken) {
      getAllBooks(user.accessToken, dispatch, axiosJWT);
      getAllUsers(user.accessToken, dispatch, axiosJWT);
      getAllBorrowRecords(user.accessToken, dispatch, axiosJWT);
      getTotalRevenue(user.accessToken, dispatch, axiosJWT);
      getDailyRevenue(user.accessToken, dispatch, axiosJWT);
    }
  }, [dispatch, user?.accessToken,axiosJWT]);


  const totalUsers = allUsers?.length || 0;
  const totalBooks = allBooks?.length || 0;
  const recentActivities = borrowRecords?.length || 0;

  useEffect(() => {
    if (borrowRecords && allBooks) {
      const borrowCounts = borrowRecords.reduce((acc, borrow) => {
        const bookId = borrow.bookId?._id || borrow.bookId;
        acc[bookId] = (acc[bookId] || 0) + 1;
        return acc;
      }, {});
  
      const mostBorrowedId = Object.keys(borrowCounts).reduce(
        (a, b) => (borrowCounts[a] > borrowCounts[b] ? a : b),
        null
      );
      const book = allBooks.find((b) => b._id === mostBorrowedId);
      setMostBorrowedBook({
        title: book?.title || `Sách không tồn tại (ID: ${mostBorrowedId})`,
        count: borrowCounts[mostBorrowedId] || 0,
      });
    }
  }, [borrowRecords, allBooks]);

  useEffect(() => {
    if (borrowRecords?.length && allUsers?.length) {
      const borrowCountsByUser = borrowRecords.reduce((acc, borrow) => {
        const userId = borrow.userId?._id || borrow.userId;
        acc[userId] = (acc[userId] || 0) + 1;
        return acc;
      }, {});
      const mostActiveUserId = Object.keys(borrowCountsByUser).reduce(
        (a, b) => (borrowCountsByUser[a] > borrowCountsByUser[b] ? a : b),
        null
      );
      const user = allUsers.find((u) => u._id === mostActiveUserId);
      setMostActiveUser({
        name: user?.username || `Người dùng không tồn tại (ID: ${mostActiveUserId})`,
        count: borrowCountsByUser[mostActiveUserId] || 0,
      });
    } else {
      setMostActiveUser({ name: "Chưa có dữ liệu", count: 0 });
    }
  }, [borrowRecords, allUsers]);

  if (booksFetching || usersFetching || borrowsFetching) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-6 lg:p-8">
        <p className="text-xl text-gray-300">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 lg:p-8">
      <div className="animate-fade-in">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-400 mb-4 mt-5">
          Admin Dashboard
        </h1>
        <p className="text-gray-300 text-lg sm:text-xl mb-8">
          Chào mừng bạn đến với trang quản trị.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="relative bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 animate-fade-in">
        <div className="flex items-center gap-4">
            <UserGroupIcon className="w-10 h-10 text-blue-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-1">
                Tổng số người dùng
              </h3>
              <p className="text-3xl font-bold text-blue-400">{totalUsers}</p>
              <p className="text-gray-400 text-sm mt-1">
                Tăng <span className="text-green-400">10%</span> so với tháng trước
              </p>
            </div>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 animate-fade-in">
        <div className="flex items-center gap-4">
            <BookOpenIcon className="w-10 h-10 text-green-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-1">
                Tổng số sách
              </h3>
              <p className="text-3xl font-bold text-green-400">{totalBooks}</p>
              <p className="text-gray-400 text-sm mt-1">
                Tăng <span className="text-green-400">5%</span> so với tháng trước
              </p>
            </div>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 animate-fade-in">
          <div className="flex items-center gap-4">
            <ClockIcon className="w-10 h-10 text-yellow-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-1">
                Hoạt động gần đây
              </h3>
              <p className="text-3xl font-bold text-yellow-400">{recentActivities}</p>
              <p className="text-gray-400 text-sm mt-1">
                Đơn mượn trong 24 giờ qua
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl shadow-lg animate-fade-in">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-200 mb-6">
          Thống kê chi tiết
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-300 mb-4">
              Người dùng hoạt động (7 ngày qua)
            </h4>
            <div className="flex items-end gap-2 h-48">
              <div className="flex-1 bg-blue-500 rounded-t h-24 hover:h-28 transition-all duration-200"></div>
              <div className="flex-1 bg-blue-500 rounded-t h-32 hover:h-36 transition-all duration-200"></div>
              <div className="flex-1 bg-blue-500 rounded-t h-20 hover:h-24 transition-all duration-200"></div>
              <div className="flex-1 bg-blue-500 rounded-t h-28 hover:h-32 transition-all duration-200"></div>
              <div className="flex-1 bg-blue-500 rounded-t h-36 hover:h-40 transition-all duration-200"></div>
              <div className="flex-1 bg-blue-500 rounded-t h-16 hover:h-20 transition-all duration-200"></div>
              <div className="flex-1 bg-blue-500 rounded-t h-24 hover:h-28 transition-all duration-200"></div>
            </div>
            <div className="flex justify-between text-gray-400 text-sm mt-2">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-300 mb-2">
                Sách được mượn nhiều nhất
              </h4>
              <p className="text-gray-200">
                <span className="font-bold text-green-400">{mostBorrowedBook?.title}</span> - {mostBorrowedBook?.count} lượt mượn
              </p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-300 mb-2">
                Người dùng tích cực nhất
              </h4>
              <p className="text-gray-200">
              <span className="font-bold text-blue-400">
                  {mostActiveUser?.name || "Chưa có dữ liệu"}
                </span>{" "}
                - {mostActiveUser?.count || 0} hoạt động
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;