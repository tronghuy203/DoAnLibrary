import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { getUserDocuments } from "../../redux/apiDocument";
import { deleteUser } from "../../redux/apiRequest";
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  Bars3Icon,
  CogIcon,
} from "@heroicons/react/24/outline";
import Sidebar from "./Sidebar";

const DocumentsPage = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const axiosJWT = useMemo(() => {
    if (!user || !dispatch) {
      console.warn("User or dispatch is undefined, axiosJWT will not be created.");
      return null;
    }
    return createAxios(user, dispatch, loginSuccess);
  }, [user, dispatch]);

  const [userDocuments, setUserDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchDocuments = useCallback(async () => {
    if (!user?.accessToken || !user?._id || !axiosJWT) {
      setError("Thiếu thông tin người dùng hoặc token. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      setLoadingDocuments(true);
      setError(null);

      const documents = await getUserDocuments(user._id, user.accessToken, axiosJWT);
      setUserDocuments(Array.isArray(documents) ? documents : []);
    } catch (err) {
      console.error("API Error:", err);
      setError(err.response?.data?.message || err.message || "Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoadingDocuments(false);
    }
  }, [user?.accessToken, user?._id, axiosJWT]);

  const handleDelete = (id) => {
    if (!user || !axiosJWT) {
      setError("Không thể xóa tài khoản. Vui lòng đăng nhập lại.");
      return;
    }
    try {
      dispatch(deleteUser(id, user.accessToken, navigate, axiosJWT)).then((result) => {
        if (result?.error) {
          throw result.error;
        }
      });
    } catch (err) {
      setError(err.message || "Xóa tài khoản thất bại. Vui lòng thử lại.");
      setTimeout(() => setError(null), 3000);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchDocuments();
  }, [user, fetchDocuments, navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const getDocumentStatus = (status) => {
    switch (status) {
      case "pending":
        return { text: "Chờ duyệt", icon: <ClockIcon className="h-4 w-4" /> };
      case "approved":
        return { text: "Đã duyệt", icon: <CheckCircleIcon className="h-4 w-4" /> };
      case "rejected":
        return { text: "Bị từ chối", icon: <XCircleIcon className="h-4 w-4" /> };
      default:
        return { text: "Không xác định", icon: null };
    }
  };

  const totalPages = Math.ceil(userDocuments.length / itemsPerPage);
  const paginatedDocuments = userDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-6 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto mt-16 sm:mt-20">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CogIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-900 dark:text-white" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white animate-fade-in">
              Tài liệu đã tải
            </h1>
          </div>
          <button
            className="lg:hidden p-2 rounded-md bg-gray-200 dark:bg-gray-700"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6 text-gray-900 dark:text-white" />
          </button>
        </header>

        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-xl shadow-md animate-slide-in flex items-center gap-2 sm:gap-3">
            <XCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-sm sm:text-base">{error}</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-14rem)]">
          <Sidebar
            user={user}
            handleDelete={handleDelete}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
          <main className="lg:w-3/4 space-y-6">
            <section className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg animate-fade-in-up">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                Tài liệu đã tải lên
              </h2>
              {loadingDocuments ? (
                <p className="text-gray-500 dark:text-gray-400 animate-pulse flex items-center gap-2 text-sm sm:text-base">
                  <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  Đang tải danh sách tài liệu...
                </p>
              ) : userDocuments.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 text-sm sm:text-base">
                  <DocumentTextIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  Bạn chưa tải lên tài liệu nào.
                </p>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-gray-900 dark:text-white">
                      <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3">Tiêu đề</th>
                          <th className="px-4 py-3">Ngày tải lên</th>
                          <th className="px-4 py-3">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedDocuments.map((doc, index) => (
                          <tr
                            key={doc._id || index}
                            className={`${
                              index % 2 === 0
                                ? "bg-white dark:bg-gray-800"
                                : "bg-gray-50 dark:bg-gray-700"
                            } hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200`}
                          >
                            <td className="px-4 py-3 truncate max-w-[300px]">{doc.title || "N/A"}</td>
                            <td className="px-4 py-3">
                              {doc.createdAt
                                ? new Date(doc.createdAt).toLocaleDateString("vi-VN")
                                : "N/A"}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${
                                  doc.status === "approved"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    : doc.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                }`}
                              >
                                {doc.status === "approved" ? (
                                  <CheckCircleIcon className="h-5 w-5" />
                                ) : doc.status === "pending" ? (
                                  <ClockIcon className="h-5 w-5" />
                                ) : (
                                  <XCircleIcon className="h-5 w-5" />
                                )}
                                {getDocumentStatus(doc.status).text}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {totalPages > 1 && (
                      <div className="mt-6 flex justify-center gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                        >
                          Trước
                        </button>
                        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded-md ${
                              currentPage === page
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                        >
                          Sau
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="md:hidden space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {userDocuments.map((doc, index) => {
                      const statusDisplay = getDocumentStatus(doc.status);
                      return (
                        <div
                          key={doc._id || index}
                          className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                              {doc.title || "N/A"}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                                doc.status === "approved"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : doc.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              }`}
                            >
                              {statusDisplay.icon}
                              {statusDisplay.text}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <div>
                              <span className="font-medium">Ngày tải lên:</span>{" "}
                              {doc.createdAt
                                ? new Date(doc.createdAt).toLocaleDateString("vi-VN")
                                : "N/A"}
                            </div>
                            <div>
                              <span className="font-medium">Trạng thái:</span>{" "}
                              <span
                                className={`inline-flex items-center gap-1 ${
                                  doc.status === "approved"
                                    ? "text-green-800 dark:text-green-300"
                                    : doc.status === "pending"
                                    ? "text-yellow-800 dark:text-yellow-300"
                                    : "text-red-800 dark:text-red-300"
                                }`}
                              >
                                {statusDisplay.text}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;