import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllDocumentsAdmin, deleteDocument, viewDocument } from "../../redux/apiDocument";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { useNavigate } from "react-router-dom";

// Đăng ký các thành phần của chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ListDocument = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const documents = useSelector((state) => state.document.documents);
  const isLoading = useSelector((state) => state.document.isFetching);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  useEffect(() => {
    if (user?.accessToken) {
      getAllDocumentsAdmin(user?.accessToken, dispatch, axiosJWT);
    }
  }, [user, dispatch, axiosJWT]);

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
    doc.viewHistory.forEach((v) => {
      const date = formatDate(v.date);
      acc[date] = acc[date] || { views: 0, downloads: 0 };
      acc[date].views += v.count;
    });
    doc.downloadHistory.forEach((d) => {
      const date = formatDate(d.date);
      acc[date] = acc[date] || { views: 0, downloads: 0 };
      acc[date].downloads += d.count;
    });
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
        backgroundColor: "rgba(75, 192, 192, 0.7)",
      },
      {
        label: "Lượt tải",
        data: chartDownloadsData,
        backgroundColor: "rgba(153, 102, 255, 0.7)",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-6">Danh sách tài liệu</h2>

        {isLoading && <p className="text-gray-400 text-center mb-6">Đang tải...</p>}

        <div className="mb-12 bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Biểu đồ lượt xem và tải tài liệu (7 ngày gần nhất)
          </h3>
          <div className="max-w-4xl mx-auto">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "top", labels: { color: "#fff" } },
                  tooltip: { mode: "index", intersect: false },
                },
                scales: {
                  x: { ticks: { color: "#fff" }, grid: { color: "rgba(255, 255, 255, 0.1)" } },
                  y: { ticks: { color: "#fff" }, grid: { color: "rgba(255, 255, 255, 0.1)" } },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-sm font-medium text-gray-200">Tiêu đề</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-200">Mô tả</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-200">Người tải lên</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-200">Lượt xem</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-200">Lượt tải</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-200">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {documents?.length > 0 ? (
                documents.map((doc) => (
                  <tr
                    key={doc._id}
                    className="border-t border-gray-700 hover:bg-gray-700 transition duration-200"
                  >
                    <td className="px-6 py-4 text-gray-300">{doc.title}</td>
                    <td className="px-6 py-4 text-gray-300">{doc.description}</td>
                    <td className="px-6 py-4 text-gray-300">
                      {doc.uploadedBy?.username || "Không xác định"}
                    </td>
                    <td className="px-6 py-4 text-gray-300">{doc.views}</td>
                    <td className="px-6 py-4 text-gray-300">{doc.downloads}</td>
                    <td className="px-6 py-4 flex gap-2">

                      <button
                        onClick={() => handleDetailClick(doc._id)}
                        className="text-blue-400 hover:text-blue-300 font-medium transition duration-200"
                      >
                        Xem
                      </button>
                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="text-red-400 hover:text-red-300 font-medium transition duration-200"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                    Không có tài liệu nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListDocument;