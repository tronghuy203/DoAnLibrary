import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllDocumentsAdmin, deleteDocument, viewDocument } from "../../redux/apiDocument";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { useNavigate } from "react-router-dom";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ListDocument = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const documents = useSelector((state) => state.document.documents);
  const isLoading = useSelector((state) => state.document.isFetching);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  const [currentPage, setCurrentPage] = useState(1);
  const documentsPerPage = 5;

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    if (user?.accessToken) {
      getAllDocumentsAdmin(user?.accessToken, dispatch, axiosJWT);
    }
  }, [user, dispatch, axiosJWT]);

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

  const handleDelete = async (documentId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) {
      await deleteDocument(documentId, user?.accessToken, dispatch, axiosJWT);
    }
  };

  const handleDetailClick = (id) => {
    if (user?.accessToken) {
      viewDocument(id, user?.accessToken, dispatch, axiosJWT);
    }
    window.open(`/document/${id}`, "_blank");
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const groupedData = documents.reduce((acc, doc) => {
    if (Array.isArray(doc.viewHistory)) {
      doc.viewHistory.forEach((v) => {
        const date = formatDate(v.date);
        acc[date] = acc[date] || { views: 0, downloads: 0 };
        acc[date].views += v.count;
      });
    }
    if (Array.isArray(doc.downloadHistory)) {
      doc.downloadHistory.forEach((d) => {
        const date = formatDate(d.date);
        acc[date] = acc[date] || { views: 0, downloads: 0 };
        acc[date].downloads += d.count;
      });
    }
    return acc;
  }, {});

  const today = new Date();
  const chartLabels = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    return formatDate(date);
  }).reverse();

  const chartViewsData = chartLabels.map((date) => groupedData[date]?.views || 0);
  const chartDownloadsData = chartLabels.map((date) => groupedData[date]?.downloads || 0);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Lượt xem",
        data: chartViewsData,
        backgroundColor: isDarkMode ? "rgba(75, 192, 192, 0.7)" : "rgba(75, 192, 192, 0.5)",
        borderColor: isDarkMode ? "rgba(75, 192, 192, 1)" : "rgba(75, 192, 192, 0.8)",
        borderWidth: 1,
      },
      {
        label: "Lượt tải",
        data: chartDownloadsData,
        backgroundColor: isDarkMode ? "rgba(153, 102, 255, 0.7)" : "rgba(153, 102, 255, 0.5)",
        borderColor: isDarkMode ? "rgba(153, 102, 255, 1)" : "rgba(153, 102, 255, 0.8)",
        borderWidth: 1,
      },
    ],
  };

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
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)",
        titleColor: isDarkMode ? "#e5e7eb" : "#1f2937",
        bodyColor: isDarkMode ? "#e5e7eb" : "#1f2937",
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

  const indexOfLastDocument = currentPage * documentsPerPage;
  const indexOfFirstDocument = indexOfLastDocument - documentsPerPage;
  const currentDocuments = documents.slice(indexOfFirstDocument, indexOfLastDocument);
  const totalPages = Math.ceil(documents.length / documentsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-6 transition-all duration-500 ease-in-out relative overflow-hidden">
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
        <svg className="absolute bottom-0 left-0 w-full h-48 text-cyan-300/30 dark:text-cyan-700/30" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,186.7C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 animate-fade-in">
          Danh sách tài liệu
        </h2>

        {isLoading && (
          <p className="text-gray-500 dark:text-gray-400 text-center mb-6 animate-pulse">
            Đang tải...
          </p>
        )}

        <div className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700/50 animate-slide-up">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Biểu đồ lượt xem và tải tài liệu (7 ngày gần nhất)
          </h3>
          <div className="max-w-4xl mx-auto" style={{ height: "300px" }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700/50 animate-slide-up">
          <table className="w-full text-left">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-200">
                  Tiêu đề
                </th>
                <th className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-200">
                  Mô tả
                </th>
                <th className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-200">
                  Người tải lên
                </th>
                <th className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-200">
                  Lượt xem
                </th>
                <th className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-200">
                  Lượt tải
                </th>
                <th className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-200">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {currentDocuments?.length > 0 ? (
                currentDocuments.map((doc) => (
                  <tr
                    key={doc._id}
                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-300 ease-in-out transform hover:scale-[1.01] animate-fade-in"
                  >
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{doc.title}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{doc.description}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {doc.uploadedBy?.username || "Không xác định"}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{doc.views}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{doc.downloads}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleDetailClick(doc._id)}
                        className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium transition duration-200 transform hover:scale-105"
                      >
                        Xem
                      </button>
                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 font-medium transition duration-200 transform hover:scale-105"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500 dark:text-gray-400 animate-fade-in"
                  >
                    Không có tài liệu nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4 animate-slide-up">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-3 py-1 rounded-md transition duration-300 ease-in-out transform hover:scale-110 ${
                    currentPage === index + 1
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 hover:shadow-md"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListDocument;