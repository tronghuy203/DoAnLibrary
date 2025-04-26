import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { UserGroupIcon, BookOpenIcon, ClockIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline";
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
  const { allBooks, isFetching: booksFetching } = useSelector((state) => state.books);
  const usersState = useSelector((state) => state.users);
  const { borrowRecords, isFetching: borrowsFetching } = useSelector((state) => state.borrow);

  const allUsers = usersState?.users?.allUsers || [];
  const usersFetching = usersState?.users?.isFetching || false;
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);
  const [mostBorrowedBook, setMostBorrowedBook] = useState(null);
  const [mostActiveUser, setMostActiveUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

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
  }, [dispatch, user?.accessToken, axiosJWT]);

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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-6 lg:p-8 animate-pulse transition-all duration-300 ease-in-out">
        <p className="text-xl text-gray-500 dark:text-gray-400">Đang tải dữ liệu...</p>
      </div>
    );
  }

  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Người dùng hoạt động",
        data: [24, 32, 20, 28, 36, 16, 24],
        backgroundColor: isDarkMode ? "rgba(59, 130, 246, 0.5)" : "rgba(37, 99, 235, 0.5)",
        borderColor: isDarkMode ? "rgba(59, 130, 246, 1)" : "rgba(37, 99, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: isDarkMode ? "#e5e7eb" : "#1f2937",
        },
      },
      title: {
        display: true,
        text: "Người dùng hoạt động (7 ngày qua)",
        color: isDarkMode ? "#e5e7eb" : "#1f2937",
      },
    },
    scales: {
      x: {
        ticks: {
          color: isDarkMode ? "#9ca3af" : "#6b7280",
        },
        grid: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
      y: {
        ticks: {
          color: isDarkMode ? "#9ca3af" : "#6b7280",
        },
        grid: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-6 lg:p-8 transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-center mb-6">
        <div className="animate-fade-in">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-500 dark:text-blue-300 mb-4 mt-5">
            Admin Dashboard
          </h1>
          <p className="text-gray-700 dark:text-gray-400 text-lg sm:text-xl">
            Chào mừng bạn đến với trang quản trị.
          </p>
        </div>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-300 ease-in-out"
        >
          {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        <div className="relative bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:-translate-y-1 transition-all duration-300 ease-in-out animate-fade-in">
          <div className="flex items-center gap-4">
            <UserGroupIcon className="w-10 h-10 text-blue-500 dark:text-blue-300" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Tổng số người dùng
              </h3>
              <p className="text-3xl font-bold text-blue-500 dark:text-blue-300">{totalUsers}</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Tăng <span className="text-green-500 dark:text-green-300">10%</span> so với tháng trước
              </p>
            </div>
          </div>
        </div>

        <div className="relative bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-green-500/20 transform hover:-translate-y-1 transition-all duration-300 ease-in-out animate-fade-in">
          <div className="flex items-center gap-4">
            <BookOpenIcon className="w-10 h-10 text-green-500 dark:text-green-300" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Tổng số sách
              </h3>
              <p className="text-3xl font-bold text-green-500 dark:text-green-300">{totalBooks}</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Tăng <span className="text-green-500 dark:text-green-300">5%</span> so với tháng trước
              </p>
            </div>
          </div>
        </div>

        <div className="relative bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-yellow-500/20 transform hover:-translate-y-1 transition-all duration-300 ease-in-out animate-fade-in">
          <div className="flex items-center gap-4">
            <ClockIcon className="w-10 h-10 text-yellow-500 dark:text-yellow-300" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Hoạt động gần đây
              </h3>
              <p className="text-3xl font-bold text-yellow-500 dark:text-yellow-300">{recentActivities}</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Đơn mượn trong 24 giờ qua
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg transition-all duration-300 ease-in-out animate-fade-in">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
          Thống kê chi tiết
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg transition-all duration-300 ease-in-out">
            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Người dùng hoạt động (7 ngày qua)
            </h4>
            <Bar data={chartData} options={chartOptions} />
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg transition-all duration-300 ease-in-out">
              <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Sách được mượn nhiều nhất
              </h4>
              <p className="text-gray-800 dark:text-gray-200">
                <span className="font-bold text-green-500 dark:text-green-300">{mostBorrowedBook?.title}</span> -{" "}
                {mostBorrowedBook?.count} lượt mượn
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg transition-all duration-300 ease-in-out">
              <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Người dùng tích cực nhất
              </h4>
              <p className="text-gray-800 dark:text-gray-200">
                <span className="font-bold text-blue-500 dark:text-blue-300">
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