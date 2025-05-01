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
import { DocumentTextIcon } from "@heroicons/react/24/outline";

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
        return <FaFilePdf className="text-red-600 w-12 h-12 group-hover:text-red-700 transition-colors duration-200" />;
      case "doc":
      case "docx":
        return <FaFileWord className="text-blue-600 w-12 h-12 group-hover:text-blue-700 transition-colors duration-200" />;
      case "xls":
      case "xlsx":
        return <FaFileExcel className="text-green-600 w-12 h-12 group-hover:text-green-700 transition-colors duration-200" />;
      default:
        return <FaFilePdf className="text-gray-500 dark:text-gray-400 w-12 h-12 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 py-12 px-4 sm:px-8 lg:px-12 transition-all duration-500 ease-in-out relative overflow-hidden">
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

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-8 animate-slide-up">
          <DocumentTextIcon className="w-16 h-16 mx-auto text-cyan-600 dark:text-cyan-400 mb-3 animate-pulse" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-cyan-600 dark:text-cyan-400 tracking-tight drop-shadow-lg">
            Phê Duyệt Tài Liệu
          </h2>
          <p className="mt-2 text-lg sm:text-xl text-gray-600 dark:text-gray-300">
            Xem xét và quản lý các tài liệu đang chờ phê duyệt
          </p>
        </div>

        <div className="mb-10 flex flex-col sm:flex-row gap-4 animate-slide-up">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/95 dark:bg-gray-800/95 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 hover:bg-gradient-to-r hover:from-gray-100/80 hover:to-gray-50/80 dark:hover:from-gray-750/80 dark:hover:to-gray-700/80"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-6 py-4 bg-white/95 dark:bg-gray-800/95 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 text-gray-900 dark:text-gray-100 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22%236b7280%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20d%3D%22M8%2012L2%206h12z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center] pr-10 transition-all duration-200 hover:bg-gradient-to-r hover:from-gray-100/80 hover:to-gray-50/80 dark:hover:from-gray-750/80 dark:hover:to-gray-700/80"
          >
            <option value="all">Tất cả</option>
            <option value="pdf">PDF</option>
            <option value="doc">Word</option>
            <option value="xls">Excel</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64 animate-pulse">
            <div className="w-16 h-16 border-4 border-t-cyan-600 border-gray-300 dark:border-gray-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc, index) => (
                <div
                  key={doc._id}
                  className="relative group bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] transform hover:-translate-y-2 transition-all duration-500 animate-slide-up"
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
                  <div className="flex gap-4 mb-4">
                    <button
                      onClick={() => handleApprove(doc._id)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-500 dark:to-teal-500 hover:from-green-700 hover:to-teal-700 dark:hover:from-green-600 dark:hover:to-teal-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      Phê duyệt
                    </button>
                    <button
                      onClick={() => handleReject(doc._id)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 dark:from-red-500 dark:to-pink-500 hover:from-red-700 hover:to-pink-700 dark:hover:from-red-600 dark:hover:to-pink-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      Từ chối
                    </button>
                  </div>
                  <button
                    onClick={() => handleViewClick(doc._id)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-500 dark:to-cyan-500 hover:from-teal-700 hover:to-cyan-700 dark:hover:from-teal-600 dark:hover:to-cyan-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    Xem chi tiết
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16 animate-pulse">
                <DocumentTextIcon className="w-24 h-24 mx-auto text-cyan-600 dark:text-cyan-400 mb-6 animate-bounce" />
                <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-4">
                  Không có tài liệu nào đang chờ duyệt
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-500 hover:from-cyan-700 hover:to-blue-700 dark:hover:from-cyan-600 dark:hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center gap-2 mx-auto text-base sm:text-lg"
                >
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                  Quay lại trang chính
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDocumentApproval;