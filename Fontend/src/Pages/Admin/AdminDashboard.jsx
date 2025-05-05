import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { UserGroupIcon, BookOpenIcon, ClockIcon } from "@heroicons/react/24/outline";
import { getAllBooks } from "../../redux/apiBooks";
import { getAllUsers } from "../../redux/apiRequest";
import { getAllBorrowRecords, getTotalRevenue, getDailyRevenue } from "../../redux/apiBorrow";
import { getRevenueByType } from "../../redux/apiPayment";
import { createAxios } from "../../createInstance";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { loginSuccess } from "../../redux/authSlice";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.login.currentUser);
  const { allBooks, isFetching: booksFetching } = useSelector((state) => state.books);
  const usersState = useSelector((state) => state.users);
  const { borrowRecords, isFetching: borrowsFetching } = useSelector((state) => state.borrow);
  const { revenueByType, isFetching: paymentFetching, error: paymentError } = useSelector((state) => state.payment);

  const allUsers = usersState?.users?.allUsers || [];
  const usersFetching = usersState?.users?.isFetching || false;
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);
  const [mostBorrowedBook, setMostBorrowedBook] = useState(null);
  const [mostActiveUser, setMostActiveUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    const handleDarkModeChange = () => {
      const savedMode = localStorage.getItem("darkMode");
      setIsDarkMode(savedMode ? JSON.parse(savedMode) : false);
    };

    window.addEventListener("darkModeChange", handleDarkModeChange);
    window.addEventListener("storage", handleDarkModeChange);

    return () => {
      window.removeEventListener("darkModeChange", handleDarkModeChange);
      window.removeEventListener("storage", handleDarkModeChange);
    };
  }, []);

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
      getRevenueByType(user.accessToken, dispatch, axiosJWT)()
        .catch((err) => console.error("Failed to fetch revenue by type:", err));
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

  if (booksFetching || usersFetching || borrowsFetching || paymentFetching) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8 animate-pulse transition-all duration-300 ease-in-out">
        <p className="text-xl text-gray-500 dark:text-gray-400">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (paymentError) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
        <p className="text-xl text-red-500 dark:text-red-400">Lỗi khi tải dữ liệu doanh thu: {paymentError}</p>
      </div>
    );
  }

  const hasRevenueData =
    revenueByType.rental_fee > 0 || revenueByType.penalty > 0 || revenueByType.membership > 0;

  const chartData = {
    labels: ["Phí mượn sách", "Phí phạt", "Gói thành viên"],
    datasets: [
      {
        label: "Doanh thu (VNĐ)",
        data: [revenueByType.rental_fee, revenueByType.penalty, revenueByType.membership],
        backgroundColor: [
          isDarkMode ? "rgba(59, 130, 246, 0.5)" : "rgba(37, 99, 235, 0.5)",
          isDarkMode ? "rgba(239, 68, 68, 0.5)" : "rgba(220, 38, 38, 0.5)",
          isDarkMode ? "rgba(236, 72, 153, 0.5)" : "rgba(219, 39, 119, 0.5)",
        ],
        borderColor: [
          isDarkMode ? "rgba(59, 130, 246, 1)" : "rgba(37, 99, 235, 1)",
          isDarkMode ? "rgba(239, 68, 68, 1)" : "rgba(220, 38, 38, 1)",
          isDarkMode ? "rgba(236, 72, 153, 1)" : "rgba(219, 39, 119, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: isDarkMode ? "#e5e7eb" : "#1f2937",
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: "Phân bổ doanh thu",
        color: isDarkMode ? "#e5e7eb" : "#1f2937",
        font: {
          size: 16,
        },
        padding: {
          bottom: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: ${value.toLocaleString("vi-VN")} VNĐ`;
          },
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8 transition-all duration-300 ease-in-out">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="animate exfoliative-in w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-500 dark:text-blue-300 mb-2 mt-4 sm:mt-5">
            Bảng điều khiển quản trị viên
          </h1>
          <p className="text-gray-700 dark:text-gray-400 text-base sm:text-lg">
            Chào mừng bạn đến với trang quản trị.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
        <div className="relative bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:-translate-y-1 transition-all duration-300 ease-in-out animate-fade-in">
          <div className="flex items-center gap-3 sm:gap-4">
            <UserGroupIcon className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 dark:text-blue-300" />
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Tổng số người dùng
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-blue-500 dark:text-blue-300">{totalUsers}</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">
                Tăng <span className="text-green-500 dark:text-green-300">10%</span> so với tháng trước
              </p>
            </div>
          </div>
        </div>

        <div className="relative bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-green-500/20 transform hover:-translate-y-1 transition-all duration-300 ease-in-out animate-fade-in">
          <div className="flex items-center gap-3 sm:gap-4">
            <BookOpenIcon className="w-8 h-8 sm:w-10 sm:h-10 text-green-500 dark:text-green-300" />
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Tổng số sách
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-green-500 dark:text-green-300">{totalBooks}</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">
                Tăng <span className="text-green-500 dark:text-green-300">5%</span> so với tháng trước
              </p>
            </div>
          </div>
        </div>

        <div className="relative bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-yellow-500/20 transform hover:-translate-y-1 transition-all duration-300 ease-in-out animate-fade-in">
          <div className="flex items-center gap-3 sm:gap-4">
            <ClockIcon className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500 dark:text-yellow-300" />
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Hoạt động gần đây
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-500 dark:text-yellow-300">{recentActivities}</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">
                Đơn mượn trong 24 giờ qua
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-2xl shadow-lg transition-all duration-300 ease-in-out animate-fade-in">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 sm:mb-6">
          Thống kê chi tiết
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg transition-all duration-300 ease-in-out">
            <h4 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">
              Phân bổ doanh thu
            </h4>
            <div className="w-full max-w-[3800px] sm:max-w-[4400px] lg:max-w-[540px] mx-auto h-[280px] sm:h-[340px] lg:h-[400px]">
              {hasRevenueData ? (
                <Pie data={chartData} options={chartOptions} />
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center text-sm sm:text-base">
                  Chưa có dữ liệu doanh thu để hiển thị
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg transition-all duration-300 ease-in-out">
              <h4 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Sách được mượn nhiều nhất
              </h4>
              <p className="text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                <span className="font-bold text-green-500 dark:text-green-300">{mostBorrowedBook?.title}</span> -{" "}
                {mostBorrowedBook?.count} lượt mượn
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg transition-all duration-300 ease-in-out">
              <h4 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Người dùng tích cực nhất
              </h4>
              <p className="text-gray-800 dark:text-gray-200 text-sm sm:text-base">
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