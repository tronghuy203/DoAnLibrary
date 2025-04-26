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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RevenueDashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login?.currentUser);
  const dailyRevenue = useSelector((state) => state.borrow.dailyRevenue);
  const totalRevenue = useSelector((state) => state.borrow.totalRevenue);
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
          color: (context) =>
            context.chart.canvas.closest(".dark") ? "#e5e7eb" : "#374151",
          font: { size: 14 },
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: (context) =>
          context.chart.canvas.closest(".dark")
            ? "rgba(0, 0, 0, 0.8)"
            : "rgba(255, 255, 255, 0.8)",
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        titleColor: (context) =>
          context.chart.canvas.closest(".dark") ? "#e5e7eb" : "#374151",
        bodyColor: (context) =>
          context.chart.canvas.closest(".dark") ? "#e5e7eb" : "#374151",
      },
    },
    scales: {
      x: {
        ticks: {
          color: (context) =>
            context.chart.canvas.closest(".dark") ? "#e5e7eb" : "#374151",
        },
        grid: {
          color: (context) =>
            context.chart.canvas.closest(".dark")
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.05)",
        },
      },
      y: {
        ticks: {
          color: (context) =>
            context.chart.canvas.closest(".dark") ? "#e5e7eb" : "#374151",
        },
        grid: {
          color: (context) =>
            context.chart.canvas.closest(".dark")
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.05)",
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
    <div className="min-h-screen bg-gray-100 dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-center transition-all duration-300 ease-in-out">
      <div className="w-full max-w-6xl space-y-8 animate-fade-in">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center sm:text-left text-blue-500 dark:text-blue-400 transition-transform duration-500 hover:scale-105">
          Bảng điều khiển doanh thu
        </h2>

        <div
          className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700/50 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        >
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Tổng doanh thu:{" "}
            <span className="text-green-500 dark:text-green-400">
              {totalRevenue?.toLocaleString("vi-VN") || "0"} VNĐ
            </span>
          </h3>
        </div>

        {dailyRevenue?.length > 0 ? (
          <div
            className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700/50 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Biểu đồ doanh thu 7 ngày gần đây
            </h3>
            <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] overflow-x-auto">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-6 animate-pulse transition-all duration-300 ease-in-out">
            Đang tải dữ liệu biểu đồ...
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueDashboard;