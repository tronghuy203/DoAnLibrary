import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllDocumentsUser, viewDocument } from "../../redux/apiDocument";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { FaFilePdf, FaFileWord, FaFileExcel, FaSearch } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserDocumentList = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const currentMembership = useSelector((state) => state.membership.currentMembership);
  const dispatch = useDispatch();
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);
  const documents = useSelector((state) => state.document.documents);
  const isLoading = useSelector((state) => state.document.isFetching);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [visibleDocs, setVisibleDocs] = useState(8);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user?.accessToken) {
      getAllDocumentsUser(user?.accessToken, dispatch, axiosJWT);
    }
  }, [user, navigate, user?.accessToken, dispatch, axiosJWT]);

  const filteredDocuments = useMemo(() => {
    let result = documents || [];
    result = result.filter((doc) => doc.status === "approved");
    if (searchQuery) {
      result = result.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterType !== "all") {
      result = result.filter((doc) => doc.type === filterType);
    }
    return result;
  }, [documents, searchQuery, filterType]);

  const handleUploadClick = () => {
    navigate("/upload-document");
  };

  const handleDetailClick = async (id) => {
    if (!user?.accessToken) {
      toast.error("Vui lòng đăng nhập để xem tài liệu.", {
        position: "top-right",
        autoClose: 5000,
        className: "bg-red-100/90 dark:bg-red-900/90 text-red-600 dark:text-red-200 rounded-xl shadow-lg backdrop-blur-sm",
        progressClassName: "bg-red-500",
      });
      navigate("/login");
      return;
    }
    try {
      await viewDocument(id, user.accessToken, dispatch, axiosJWT);
      navigate(`/document/${id}`);
    } catch (err) {
      let errorMessage =
        err.response?.data?.message || "Lỗi khi xem tài liệu. Vui lòng thử lại.";
      if (err.response?.status === 403) {
        errorMessage = `Bạn đã vượt quá giới hạn lượt xem hôm nay${
          currentMembership ? ` với gói ${currentMembership.membershipId.name}` : ""
        }. Nâng cấp gói để xem thêm!`;
        toast(
          <div className="flex items-center gap-3">
            <span className="text-sm">{errorMessage}</span>
            <button
              onClick={() => navigate("/membership-list")}
              className="w-40 h-20 px-3 py-1 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all duration-300 text-sm"
            >
              Nâng cấp ngay
            </button>
          </div>,
          {
            position: "top-right",
            autoClose: 4000,
            closeButton: false,
            className: "bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 rounded-xl shadow-lg backdrop-blur-sm",
            progressClassName: "bg-teal-500",
          }
        );
      } else if (err.response?.status === 500) {
        toast.error("Lỗi server. Vui lòng thử lại sau.", {
          position: "top-right",
          autoClose: 5000,
          className: "bg-red-100/90 dark:bg-red-900/90 text-red-600 dark:text-red-200 rounded-xl shadow-lg backdrop-blur-sm",
          progressClassName: "bg-red-500",
        });
      }
      if (err.response?.status === 403 || err.response?.status === 500) {
        return;
      }
      navigate(`/document/${id}`);
    }
  };

  const handleLoadMore = () => {
    setVisibleDocs((prev) => prev + 6);
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "pdf":
        return <FaFilePdf className="text-red-500 w-12 h-12" />;
      case "doc":
      case "docx":
        return <FaFileWord className="text-blue-500 w-12 h-12" />;
      case "xls":
      case "xlsx":
        return <FaFileExcel className="text-green-500 w-12 h-12" />;
      default:
        return <FaFilePdf className="text-gray-500 w-12 h-12" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 py-24 transition-colors duration-500 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-6"
        >
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Danh sách tài liệu
          </h2>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUploadClick}
            className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-full shadow-lg hover:bg-teal-600 transition-all duration-300"
          >
            Tải lên tài liệu
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-10 flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <motion.div
              animate={{ scale: searchQuery ? 1.2 : 1 }}
              transition={{ duration: 0.3 }}
              className="absolute left-4 top-1/3"
            >
              <FaSearch className="text-gray-500 dark:text-gray-400" />
            </motion.div>
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/90 dark:bg-gray-800/90 border border-gray-200/30 dark:border-gray-700/30 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-900 dark:text-white transition-all duration-300"
            />
          </div>
          <motion.select
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-6 py-3 bg-white/90 dark:bg-gray-800/90 border border-gray-200/30 dark:border-gray-700/30 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-900 dark:text-white appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22gray%22%20viewBox%3D%220%200%2016%1616%22%3E%3Cpath%20d%3D%22M8%2012L2%206h12z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center] pr-10"
          >
            <option value="all">Tất cả</option>
            <option value="pdf">PDF</option>
            <option value="doc">Word</option>
            <option value="xls">Excel</option>
          </motion.select>
        </motion.div>

        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white/90 dark:bg-gray-800/90 p-6 rounded-3xl shadow-lg animate-pulse"
              >
                <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            ))}
          </motion.div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredDocuments.length > 0 ? (
                filteredDocuments.slice(0, visibleDocs).map((doc) => (
                  <motion.div
                    key={doc._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4 }}
                    className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-6 rounded-3xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/10 to-teal-100/10 dark:from-indigo-400/10 dark:to-teal-400/10 opacity-0 hover:opacity-50 transition-opacity duration-300 rounded-3xl -z-10" />
                    <div className="flex flex-col items-center gap-4 mb-4">
                      {doc.thumbnailUrl ? (
                        <img
                          src={doc.thumbnailUrl}
                          alt={doc.title}
                          className="w-full h-40 object-cover rounded-lg shadow-sm"
                        />
                      ) : (
                        <div className="w-full h-40 flex items-center justify-center bg-gray-100/50 dark:bg-gray-700/50 rounded-lg">
                          {getFileIcon(doc.type)}
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight line-clamp-1">
                      {doc.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 text-sm">
                      {doc.description}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mb-4">
                      Người đăng: {doc.uploadedBy?.username || "Unknown"}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDetailClick(doc._id)}
                      className="w-full px-4 py-2 bg-teal-500 text-white font-medium rounded-lg shadow-sm hover:bg-teal-600 transition-all duration-300"
                    >
                      Xem chi tiết
                    </motion.button>
                  </motion.div>
                ))
              ) : (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-500 dark:text-gray-400 text-center col-span-full text-lg"
                >
                  Không có tài liệu nào phù hợp.
                </motion.p>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {filteredDocuments.length > visibleDocs && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLoadMore}
              className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-full shadow-lg hover:bg-teal-600 transition-all duration-300"
            >
              Xem thêm
            </motion.button>
          </motion.div>
        )}
      </div>

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        closeOnClick={true}
        pauseOnHover={true}
        draggable={true}
        theme="colored"
        className="z-50"
      />
    </div>
  );
};

export default UserDocumentList;