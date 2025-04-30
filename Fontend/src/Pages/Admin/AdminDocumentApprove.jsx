import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getPendingDocuments,
  approveDocument,
  rejectDocument,
  viewDocument,
} from "../../redux/apiDocument";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { FaFilePdf, FaFileWord, FaFileExcel, FaSearch } from "react-icons/fa";

const AdminDocumentApproval = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const dispatch = useDispatch();
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);
  const pendingDocuments = useSelector((state) => state.document.pendingDocuments);
  const isLoading = useSelector((state) => state.document.isFetching);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (!user.admin) {
      navigate("/");
    } else if (user?.accessToken) {
      getPendingDocuments(user?.accessToken, dispatch, axiosJWT);
    }
  }, [user, navigate, dispatch, axiosJWT]);

  const filteredDocuments = useMemo(() => {
    let result = pendingDocuments || [];
    if (searchQuery) {
      result = result.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterType !== "all") {
      result = result.filter((doc) => doc.type === filterType);
    }
    return result;
  }, [pendingDocuments, searchQuery, filterType]);

  const handleApprove = async (documentId) => {
    try {
      await approveDocument(documentId, user?.accessToken, dispatch, axiosJWT);
      alert("Tài liệu đã được phê duyệt!");
    } catch (err) {
      alert("Lỗi khi phê duyệt tài liệu!");
    }
  };

  const handleReject = async (documentId) => {
    try {
      await rejectDocument(documentId, user?.accessToken, dispatch, axiosJWT);
      alert("Tài liệu đã bị từ chối!");
    } catch (err) {
      alert("Lỗi khi từ chối tài liệu!");
    }
  };

  const handleViewClick = (id) => {
    if (user?.accessToken) {
      viewDocument(id, user?.accessToken, dispatch, axiosJWT);
    }
    navigate(`/document/${id}`);
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "pdf":
        return <FaFilePdf className="text-red-500 w-10 h-10" />;
      case "doc":
      case "docx":
        return <FaFileWord className="text-blue-500 w-10 h-10" />;
      case "xls":
      case "xlsx":
        return <FaFileExcel className="text-green-500 w-10 h-10" />;
      default:
        return <FaFilePdf className="text-gray-500 dark:text-gray-400 w-10 h-10" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex justify-center items-start py-32 transition-colors duration-500">
      <div className="container mx-auto px-6">
        <h2
          data-aos="slide-up"
          className="text-4xl font-extrabold text-cyan-500 dark:text-cyan-300 tracking-tight animate-slide-in-left mb-16"
        >
          Phê duyệt tài liệu
        </h2>

        <div className="mb-10 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-cyan-400 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-cyan-400 text-gray-900 dark:text-gray-100 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22gray%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20d%3D%22M8%2012L2%206h12z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center] pr-10"
          >
            <option value="all">Tất cả</option>
            <option value="pdf">PDF</option>
            <option value="doc">Word</option>
            <option value="xls">Excel</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-16 h-16 border-4 border-t-indigo-500 border-gray-300 dark:border-gray-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc, index) => (
                <div
                  key={doc._id}
                  className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100/20 dark:from-gray-700/20 to-blue-200/20 dark:to-cyan-900/20 rounded-2xl -z-10"></div>
                  <div className="flex flex-col items-center gap-4 mb-4">
                      {doc.thumbnailUrl ? (
                        <img
                          src={doc.thumbnailUrl}
                          alt={doc.title}
                          className="w-72 h-60 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-72 h-60 flex items-center justify-center">
                          {getFileIcon(doc.type)}
                        </div>
                      )}
                      
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-wide">
                        {doc.title}
                      </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 text-sm">
                    {doc.description}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
                    Người đăng: {doc.uploadedBy?.username || "Unknown"}
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleApprove(doc._id)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 dark:from-green-600 dark:to-teal-700 text-white font-medium rounded-lg shadow-md hover:from-green-600 hover:to-teal-700 dark:hover:from-green-700 dark:hover:to-teal-800 transform hover:scale-105 transition-all duration-300"
                    >
                      Phê duyệt
                    </button>
                    <button
                      onClick={() => handleReject(doc._id)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 dark:from-red-600 dark:to-pink-700 text-white font-medium rounded-lg shadow-md hover:from-red-600 hover:to-pink-700 dark:hover:from-red-700 dark:hover:to-pink-800 transform hover:scale-105 transition-all duration-300"
                    >
                      Từ chối
                    </button>
                  </div>
                  <button
                    onClick={() => handleViewClick(doc._id)}
                    className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 dark:from-teal-600 dark:to-cyan-700 text-white font-medium rounded-lg shadow-md hover:from-teal-600 hover:to-cyan-700 dark:hover:from-teal-700 dark:hover:to-cyan-800 transform hover:scale-105 transition-all duration-300"
                  >
                    Xem chi tiết
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center col-span-full text-lg animate-fade-in">
                Không có tài liệu nào đang chờ duyệt.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDocumentApproval;