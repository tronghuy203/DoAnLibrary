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

  const chartData = useMemo(() => ({
    labels: dailyRevenue?.map((item) => item._id) || [],
    datasets: [
      {
        label: "Doanh thu theo ngày (VNĐ)",
        data: dailyRevenue?.map((item) => item.totalRevenue) || [],
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  }), [dailyRevenue]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#fff" },
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        ticks: { color: "#fff" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      y: {
        ticks: { color: "#fff" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  };

  return (
    <div className="min-h-screen mx-auto bg-gray-900 text-white px-4 sm:px-6 py-6">
      <div className="max-w-5xl ">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">
          Bảng điều khiển doanh thu
        </h2>

        <div className="mb-8 p-4 sm:p-6 bg-gray-800 rounded shadow">
          <h3 className="text-base sm:text-xl font-semibold mb-4">
            Tổng doanh thu: {totalRevenue?.toLocaleString("vi-VN") || "0"} VNĐ
          </h3>
        </div>

        {dailyRevenue?.length > 0 ? (
          <div className="bg-gray-800 rounded p-4 sm:p-6 shadow">
            <h3 className="text-base sm:text-xl font-semibold mb-4">
              Biểu đồ doanh thu 7 ngày gần đây
            </h3>
            <div className="relative w-full h-[300px] sm:h-[400px] overflow-x-auto">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 mt-6">Đang tải dữ liệu biểu đồ...</div>
        )}
      </div>
    </div>
  );
};

export default RevenueDashboard;
