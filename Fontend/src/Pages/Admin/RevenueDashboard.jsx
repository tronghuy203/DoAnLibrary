import React, { useEffect, useMemo } from "react";
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RevenueDashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login?.currentUser);
  const dailyRevenue = useSelector((state) => state.borrow.dailyRevenue);
  const totalRevenue = useSelector((state) => state.borrow.totalRevenue);
  const loading = useSelector((state) => state.borrow.loading);
  const error = useSelector((state) => state.borrow.error);
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  useEffect(() => {
    if (user?.accessToken) {
      getDailyRevenue(user.accessToken, dispatch, axiosJWT);
      getTotalRevenue(user.accessToken, dispatch, axiosJWT);
    }
  }, [user, dispatch, axiosJWT]);

  const chartData = useMemo(
    () => ({
      labels: dailyRevenue?.map((item) => item._id) || [],
      datasets: [
        {
          label: "Doanh thu theo ngày (VNĐ)",
          data: dailyRevenue?.map((item) => item.totalRevenue) || [],
          backgroundColor: "rgba(34, 197, 94, 0.6)",
          borderColor: "rgba(34, 197, 94, 1)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(34, 197, 94, 0.8)",
        },
      ],
    }),
    [dailyRevenue]
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: (context) => (context.chart.canvas.closest(".dark") ? "#e5e7eb" : "#374151"),
          font: { size: 14 },
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: (context) =>
          context.chart.canvas.closest(".dark") ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)",
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        titleColor: (context) => (context.chart.canvas.closest(".dark") ? "#e5e7eb" : "#374151"),
        bodyColor: (context) => (context.chart.canvas.closest(".dark") ? "#e5e7eb" : "#374151"),
      },
    },
    scales: {
      x: {
        ticks: {
          color: (context) => (context.chart.canvas.closest(".dark") ? "#e5e7eb" : "#374151"),
          maxRotation: window.innerWidth < 640 ? 45 : 0, // Xoay nhãn trên mobile
          minRotation: window.innerWidth < 640 ? 45 : 0,
          font: {
            size: window.innerWidth < 640 ? 10 : 12, // Giảm kích thước chữ trên mobile
          },
        },
        grid: {
          color: (context) =>
            context.chart.canvas.closest(".dark") ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
        },
      },
      y: {
        ticks: {
          color: (context) => (context.chart.canvas.closest(".dark") ? "#e5e7eb" : "#374151"),
          font: {
            size: window.innerWidth < 640 ? 10 : 12, // Giảm kích thước chữ trên mobile
          },
        },
        grid: {
          color: (context) =>
            context.chart.canvas.closest(".dark") ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
        },
        beginAtZero: true,
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center transition-all duration-500 ease-in-out relative overflow-hidden">
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
          className="absolute bottom-0 left-0 w-full h-48 text-cyan-300/30 dark:text-cyan-700/30"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,186.7C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      <div className="w-full max-w-6xl relative z-10 space-y-8">
        <div className="text-center mb-10 animate-slide-up">
          <ChartBarIcon className="w-16 h-16 mx-auto text-cyan-600 dark:text-cyan-400 mb-3 animate-pulse" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-cyan-600 dark:text-cyan-400 tracking-tight drop-shadow-lg">
            Bảng Điều Khiển Doanh Thu
          </h2>
          <p className="mt-2 text-lg sm:text-xl text-gray-600 dark:text-gray-300">
            Theo dõi doanh thu của bạn qua biểu đồ và số liệu chi tiết
          </p>
        </div>

        {loading && (
          <div className="text-center text-gray-500 dark:text-gray-300 animate-pulse py-10 text-lg">
            Đang tải dữ liệu...
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 w-full max-w-2xl mx-auto text-center text-base sm:text-lg mb-10 px-6 py-4 rounded-xl shadow-xl transition-all duration-300 animate-pulse bg-gradient-to-r from-red-500 to-red-600 dark:from-red-400 dark:to-red-500 text-white">
            <p>Lỗi: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="p-4 sm:p-6 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] animate-slide-up">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Tổng doanh thu:{" "}
                <span className="text-green-500 dark:text-green-400">
                  {totalRevenue?.toLocaleString("vi-VN") || "0"} VNĐ
                </span>
              </h3>
            </div>

            {dailyRevenue?.length > 0 ? (
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] animate-slide-up">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  Biểu đồ doanh thu 7 ngày gần đây
                </h3>
                <div className="relative w-full h-[250px] sm:h-[350px] lg:h-[450px] overflow-x-auto">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-6 animate-pulse text-lg">
                Không có dữ liệu doanh thu để hiển thị
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RevenueDashboard;