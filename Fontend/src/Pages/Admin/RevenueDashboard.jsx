import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { getDailyRevenue, getTotalRevenue } from "../../redux/apiBorrow";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { getMonthlyRevenue, getRevenueByType } from "../../redux/apiPayment";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RevenueDashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login?.currentUser);
  const dailyRevenue = useSelector((state) => state.borrow.dailyRevenue);
  const totalRevenue = useSelector((state) => state.borrow.totalRevenue);
  const { revenueByType, monthlyRevenue, isFetching, error } = useSelector(
    (state) => state.payment
  );
  const axiosJWT = useMemo(
    () => createAxios(user, dispatch, loginSuccess),
    [user, dispatch]
  );

  const [activeChart, setActiveChart] = useState("daily");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    if (user?.accessToken) {
      getDailyRevenue(user.accessToken, dispatch, axiosJWT);
      getTotalRevenue(user.accessToken, dispatch, axiosJWT);
      getRevenueByType(user.accessToken, dispatch, axiosJWT);
      getMonthlyRevenue(user.accessToken, dispatch, axiosJWT)();
    }
  }, [user, dispatch, axiosJWT]);

  const recentDailyRevenue = useMemo(
    () => dailyRevenue?.slice(-7) || [],
    [dailyRevenue]
  );
  const recentMonthlyRevenue = useMemo(
    () => monthlyRevenue?.slice(-12) || [],
    [monthlyRevenue]
  );

  const dailyChartData = useMemo(
    () => ({
      labels: recentDailyRevenue.map((item) => item._id) || [],
      datasets: [
        {
          label: "Doanh thu theo ngày (VNĐ)",
          data: recentDailyRevenue.map((item) => item.totalRevenue) || [],
          backgroundColor: isDarkMode ? "rgba(34, 197, 94, 0.7)" : "rgba(34, 197, 94, 0.5)",
          borderColor: isDarkMode ? "rgba(34, 197, 94, 1)" : "rgba(34, 197, 94, 0.8)",
          borderWidth: 1,
          hoverBackgroundColor: isDarkMode ? "rgba(34, 197, 94, 0.9)" : "rgba(34, 197, 94, 0.8)",
        },
      ],
    }),
    [recentDailyRevenue, isDarkMode]
  );

  const monthlyChartData = useMemo(() => {
    return {
      labels: recentMonthlyRevenue.map((item) => item.month) || [],
      datasets: [
        {
          label: "Doanh thu theo tháng (VNĐ)",
          data: recentMonthlyRevenue.map((item) => item.totalRevenue) || [],
          backgroundColor: isDarkMode ? "rgba(59, 130, 246, 0.7)" : "rgba(59, 130, 246, 0.5)",
          borderColor: isDarkMode ? "rgba(59, 130, 246, 1)" : "rgba(59, 130, 246, 0.8)",
          borderWidth: 1,
          hoverBackgroundColor: isDarkMode ? "rgba(59, 130, 246, 0.9)" : "rgba(59, 130, 246, 0.8)",
        },
      ],
    };
  }, [recentMonthlyRevenue, isDarkMode]);

  const typeChartData = useMemo(
    () => ({
      labels: ["Phí thuê", "Phí phạt", "Thành viên"],
      datasets: [
        {
          label: "Doanh thu theo loại (VNĐ)",
          data: [
            revenueByType.rental_fee || 0,
            revenueByType.penalty || 0,
            revenueByType.membership || 0,
          ],
          backgroundColor: [
            isDarkMode ? "rgba(34, 197, 94, 0.7)" : "rgba(34, 197, 94, 0.5)",
            isDarkMode ? "rgba(239, 68, 68, 0.7)" : "rgba(239, 68, 68, 0.5)",
            isDarkMode ? "rgba(59, 130, 246, 0.7)" : "rgba(59, 130, 246, 0.5)",
          ],
          borderColor: [
            isDarkMode ? "rgba(34, 197, 94, 1)" : "rgba(34, 197, 94, 0.8)",
            isDarkMode ? "rgba(239, 68, 68, 1)" : "rgba(239, 68, 68, 0.8)",
            isDarkMode ? "rgba(59, 130, 246, 1)" : "rgba(59, 130, 246, 0.8)",
          ],
          borderWidth: 1,
          hoverBackgroundColor: [
            isDarkMode ? "rgba(34, 197, 94, 0.9)" : "rgba(34, 197, 94, 0.8)",
            isDarkMode ? "rgba(239, 68, 68, 0.9)" : "rgba(239, 68, 68, 0.8)",
            isDarkMode ? "rgba(59, 130, 246, 0.9)" : "rgba(59, 130, 246, 0.8)",
          ],
        },
      ],
    }),
    [revenueByType, isDarkMode]
  );

  const chartTitle = useMemo(() => {
    switch (activeChart) {
      case "daily":
        return "Doanh thu 7 ngày gần đây";
      case "monthly":
        return "Doanh thu 12 tháng gần đây";
      case "type":
        return "Doanh thu theo loại";
      default:
        return "";
    }
  }, [activeChart]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: isDarkMode ? "#e5e7eb" : "#1f2937",
          font: { size: windowWidth < 640 ? 12 : 14 },
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)",
        titleColor: isDarkMode ? "#e5e7eb" : "#1f2937",
        bodyColor: isDarkMode ? "#e5e7eb" : "#1f2937",
        titleFont: { size: windowWidth < 640 ? 12 : 14 },
        bodyFont: { size: windowWidth < 640 ? 10 : 12 },
      },
      title: {
        display: true,
        text: chartTitle,
        color: isDarkMode ? "#e5e7eb" : "#1f2937",
        font: { size: windowWidth < 640 ? 14 : 16 },
      },
    },
    scales: {
      x: {
        ticks: {
          color: isDarkMode ? "#9ca3af" : "#6b7280",
          font: { size: windowWidth < 640 ? 10 : 12 },
          maxRotation: windowWidth < 640 ? 45 : 0,
          minRotation: windowWidth < 640 ? 45 : 0,
        },
        grid: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
      y: {
        ticks: {
          color: isDarkMode ? "#9ca3af" : "#6b7280",
          font: { size: windowWidth < 640 ? 10 : 12 },
          callback: (value) => value.toLocaleString("vi-VN"),
        },
        grid: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
        beginAtZero: true,
      },
    },
  };

  const currentChartData = useMemo(() => {
    if (activeChart === "daily" && recentDailyRevenue.length > 0) {
      return dailyChartData;
    } else if (activeChart === "monthly" && recentMonthlyRevenue.length > 0) {
      return monthlyChartData;
    } else if (activeChart === "type") {
      return typeChartData;
    }
    return null;
  }, [activeChart, dailyChartData, monthlyChartData, typeChartData, recentDailyRevenue, recentMonthlyRevenue]);

  

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col items-center py-8 px-4 sm:px-8 lg:px-12 transition-all duration-500 ease-in-out relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/40 via-blue-200/30 to-purple-200/40 dark:from-cyan-800/30 dark:via-blue-800/30 dark:to-purple-800/30 animate-gradient-slow"></div>
        <div className="absolute top-[-15%] left-[-15%] w-80 h-80 bg-cyan-400/20 dark:bg-cyan-600/15 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-blue-400/20 dark:bg-blue-600/15 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-[50%] left-[70%] w-64 h-64 bg-purple-400/20 dark:bg-purple-600/15 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-[10%] right-[20%] w-56 h-56 bg-cyan-300/20 dark:bg-cyan-500/15 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute inset-0">
          <div className="absolute w-3 h-3 bg-cyan-500/50 dark:bg-cyan-400/40 rounded-full top-[15%] left-[10%] animate-particle"></div>
          <div className="absolute w-2 h-2 bg-blue-500/50 dark:bg-blue-400/40 rounded-full top-[45%] left-[75%] animate-particle-slow"></div>
          <div className="absolute w-3 h-3 bg-purple-500/50 dark:bg-purple-400/40 rounded-full top-[65%] left-[25%] animate-particle"></div>
          <div className="absolute w-2 h-2 bg-cyan-500/50 dark:bg-cyan-400/40 rounded-full top-[5%] left-[55%] animate-particle-slow"></div>
          <div className="absolute w-3 h-3 bg-blue-500/50 dark:bg-blue-400/40 rounded-full top-[30%] left-[85%] animate-particle"></div>
        </div>
        <svg
          className="absolute bottom-0 left-0 w-full h-32 sm:h-48 text-cyan-300/30 dark:text-cyan-700/30"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,186.7C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      <div className="w-full max-w-7xl relative z-10">
        <div className="text-center mb-6 animate-slide-up">
          <ChartBarIcon className="w-16 h-16 mx-auto text-cyan-600 dark:text-cyan-400 mb-3 animate-pulse" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-cyan-600 dark:text-cyan-400 tracking-tight drop-shadow-lg">
            Bảng Điều Khiển Doanh Thu
          </h2>
          <p className="mt-2 text-lg sm:text-xl text-gray-600 dark:text-gray-300">
            Theo dõi doanh thu của bạn qua biểu đồ và số liệu chi tiết
          </p>
        </div>

        {isFetching && (
          <div className="flex items-center justify-center gap-3 w-full text-center text-base sm:text-lg mb-10 px-6 py-4 rounded-xl shadow-xl bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-400 dark:to-blue-400 text-white animate-pulse">
            <p>Đang tải dữ liệu...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center gap-3 w-full max-w-2xl mx-auto text-center text-base sm:text-lg mb-10 px-6 py-4 rounded-xl shadow-xl bg-gradient-to-r from-red-500 to-red-600 dark:from-red-500 dark:to-red-600 text-white animate-pulse">
            <p>Lỗi: {error}</p>
          </div>
        )}

        {!isFetching && !error && (
          <>
            <div className="mb-8 sm:mb-12 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] animate-slide-up">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                Tổng doanh thu:{" "}
                <span className="text-green-500 dark:text-green-400">
                  {totalRevenue?.toLocaleString("vi-VN") || "0"} VNĐ
                </span>
              </h3>
            </div>

            <div className="mb-8 sm:mb-12 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] animate-slide-up">
              <div className="flex flex-wrap justify-center mb-4 sm:mb-6 gap-2 sm:gap-3">
                <button
                  onClick={() => setActiveChart("daily")}
                  className={`px-3 sm:px-5 py-2 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 transform hover:scale-105 ${
                    activeChart === "daily"
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-500 text-white shadow-lg"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 hover:shadow-md"
                  } ${recentDailyRevenue.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={recentDailyRevenue.length === 0}
                >
                  Theo ngày
                </button>
                <button
                  onClick={() => setActiveChart("monthly")}
                  className={`px-3 sm:px-5 py-2 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 transform hover:scale-105 ${
                    activeChart === "monthly"
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-500 text-white shadow-lg"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 hover:shadow-md"
                  } ${recentMonthlyRevenue.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={recentMonthlyRevenue.length === 0}
                >
                  Theo tháng
                </button>
                <button
                  onClick={() => setActiveChart("type")}
                  className={`px-3 sm:px-5 py-2 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 transform hover:scale-105 ${
                    activeChart === "type"
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-500 text-white shadow-lg"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 hover:shadow-md"
                  }`}
                >
                  Theo loại
                </button>
              </div>
              {currentChartData ? (
                <div className="w-full mx-auto" style={{ height: windowWidth < 640 ? "250px" : "350px", maxHeight: "400px" }}>
                  <Bar key={windowWidth} data={currentChartData} options={chartOptions} />
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 text-base sm:text-lg p-6 animate-fade-in">
                  Không có dữ liệu cho biểu đồ này
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RevenueDashboard;