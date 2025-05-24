import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllDocumentsAdmin, deleteDocument, viewDocument } from "../../redux/apiDocument";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { DocumentTextIcon, EyeIcon, TrashIcon } from "@heroicons/react/24/outline";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

const ListDocument = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const documents = useSelector((state) => state.document.documents);
  const isLoading = useSelector((state) => state.document.isFetching);
  const dispatch = useDispatch();
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  const [currentPage, setCurrentPage] = useState(1);
  const documentsPerPage = 3;
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

  const approvedDocuments = useMemo(() => {
    return documents.filter((doc) => doc.status === "approved");
  }, [documents]);

  const groupedData = approvedDocuments.reduce((acc, doc) => {
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
        text: "Lượt xem và tải (7 ngày)",
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
        },
        grid: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  };

  const indexOfLastDocument = currentPage * documentsPerPage;
  const indexOfFirstDocument = indexOfLastDocument - documentsPerPage;
  const currentDocuments = approvedDocuments.slice(indexOfFirstDocument, indexOfLastDocument);
  const totalPages = Math.ceil(approvedDocuments.length / documentsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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
          <DocumentTextIcon className="w-16 h-16 mx-auto text-cyan-600 dark:text-cyan-400 mb-3 animate-pulse" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-cyan-600 dark:text-cyan-400 tracking-tight drop-shadow-lg">
            Danh Sách Tài Liệu
          </h2>
          <p className="mt-2 text-lg sm:text-xl text-gray-600 dark:text-gray-300">
            Quản lý và theo dõi tài liệu của bạn
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-3 w-full text-center text-base sm:text-lg mb-10 px-6 py-4 rounded-xl shadow-xl bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-400 dark:to-blue-400 text-white animate-pulse">
            <p>Đang tải...</p>
          </div>
        )}

        <div className="mb-8 sm:mb-12 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] animate-slide-up">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
            Biểu đồ lượt xem và tải (7 ngày)
          </h3>
          <div className="w-full mx-auto" style={{ height: "350px", maxHeight: "400px" }}>
            <Bar key={windowWidth} data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
          {currentDocuments?.length > 0 ? (
            currentDocuments.map((doc) => (
              <div
                key={doc._id}
                className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] hover:scale-105 animate-fade-in"
              >
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate mb-2">
                  {doc.title}
                </h4>
                <p
                  className="text-sm text-gray-700 dark:text-gray-300 mb-3 truncate"
                  title={doc.description}
                >
                  {truncateText(doc.description, windowWidth < 640 ? 50 : 100)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Người tải: {doc.uploadedBy?.username || "Không xác định"}
                </p>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span>Lượt xem: {doc.views}</span>
                  <span>Lượt tải: {doc.downloads}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDetailClick(doc._id)}
                    className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-500 text-white font-medium text-sm py-2 px-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
                  >
                    <EyeIcon className="w-5 h-5" />
                    Xem
                  </button>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-500 dark:to-red-600 text-white font-medium text-sm py-2 px-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
                  >
                    <TrashIcon className="w-5 h-5" />
                    Xóa
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400 text-base sm:text-lg p-6 animate-fade-in">
              Không có tài liệu nào
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center gap-3 p-6 animate-slide-up">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-110 ${
                  currentPage === index + 1
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-500 text-white shadow-lg"
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
  );
};

export default ListDocument;