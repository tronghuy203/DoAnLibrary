import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllDocumentsAdmin, deleteDocument, viewDocument } from "../../redux/apiDocument";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Đăng ký các thành phần của chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ListDocument = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const documents = useSelector((state) => state.document.documents);
  const isLoading = useSelector((state) => state.document.isFetching);
  const dispatch = useDispatch();

  // Tạo instance axiosJWT có xác thực
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  // Lấy danh sách tài liệu khi component được render
  useEffect(() => {
    if (user?.accessToken) {
      getAllDocumentsAdmin(user?.accessToken, dispatch, axiosJWT);
    }
  }, [user, dispatch, axiosJWT]);

  // Xử lý xóa tài liệu
  const handleDelete = async (documentId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) {
      await deleteDocument(documentId, user?.accessToken, dispatch, axiosJWT);
    }
  };

  // Xử lý xem tài liệu
  const handleView = (documentId) => {
    viewDocument(documentId, user?.accessToken, dispatch, axiosJWT);
  };

  // Helper function to format date
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0]; // Trả về "YYYY-MM-DD"
  };

  // Nhóm dữ liệu theo ngày (lượt xem và lượt tải theo ngày)
  const groupedData = documents.reduce((acc, doc) => {
    const date = formatDate(doc.updatedAt || doc.createdAt);
    if (!acc[date]) {
      acc[date] = { views: 0, downloads: 0 };
    }
    acc[date].views += doc.views || 0;
    acc[date].downloads += doc.downloads || 0;
    return acc;
  }, {});

  // Chuẩn bị dữ liệu cho biểu đồ
  const chartLabels = Object.keys(groupedData);
  const chartViewsData = chartLabels.map((date) => groupedData[date].views);
  const chartDownloadsData = chartLabels.map((date) => groupedData[date].downloads);

  // Dữ liệu cho biểu đồ
  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Lượt xem",
        data: chartViewsData,
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
      {
        label: "Lượt tải",
        data: chartDownloadsData,
        backgroundColor: "rgba(153, 102, 255, 0.5)",
      },
    ],
  };

  return (
    <div>
      <h2>Danh sách tài liệu</h2>
      {isLoading && <p>Đang tải...</p>}

      {/* Biểu đồ quản lý lượt xem và tải */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Biểu đồ lượt xem và tải tài liệu</h3>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: "top",
              },
              tooltip: {
                mode: "index",
                intersect: false,
              },
            },
          }}
        />
      </div>

      <table border="1">
        <thead>
          <tr>
            <th>Tiêu đề</th>
            <th>Mô tả</th>
            <th>Người tải lên</th>
            <th>Lượt xem</th>
            <th>Lượt tải</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {documents?.length > 0 ? (
            documents.map((doc) => (
              <tr key={doc._id}>
                <td>{doc.title}</td>
                <td>{doc.description}</td>
                <td>{doc.uploadedBy?.username || "Không xác định"}</td>
                <td>{doc.views}</td>
                <td>{doc.downloads}</td>
                <td>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleView(doc._id)}
                  >
                    Xem
                  </a>
                  <button onClick={() => handleDelete(doc._id)}>Xóa</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                Không có tài liệu nào
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ListDocument;