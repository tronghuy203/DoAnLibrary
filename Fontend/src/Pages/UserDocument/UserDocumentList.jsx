import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllDocumentsUser, viewDocument } from "../../redux/apiDocument";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { FaFilePdf, FaFileWord, FaFileExcel, FaSearch } from "react-icons/fa";

const UserDocumentList = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const dispatch = useDispatch();
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);
  const documents = useSelector((state) => state.document.documents);
  const isLoading = useSelector((state) => state.document.isFetching);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [visibleDocs, setVisibleDocs] = useState(6);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user?.accessToken) {
      getAllDocumentsUser(user?.accessToken, dispatch, axiosJWT);
    }
  }, [user, navigate, user?.accessToken, dispatch, axiosJWT]);

  const filteredDocuments = useMemo(() => {
    let result = documents || [];
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

  const handleDetailClick = (id) => {
    if (user?.accessToken) {
      viewDocument(id, user?.accessToken, dispatch, axiosJWT);
    }
    navigate(`/document/${id}`);
  };

  const handleLoadMore = () => {
    setVisibleDocs((prev) => prev + 6);
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
        return <FaFilePdf className="text-gray-500 w-10 h-10" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-zinc-800 flex justify-center items-start py-32 transition-colors duration-500">
      <div className="container mx-auto px-6">

        <div className="flex flex-col sm:flex-row justify-between items-center mb-16 gap-6">
          <h2
            data-aos="slide-up"
            className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight animate-slide-in-left"
          >
            Danh sách tài liệu
          </h2>
          <button
            data-aos="slide-up"
            onClick={handleUploadClick}
            className="relative px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-2xl hover:from-indigo-600 hover:to-purple-700 transform hover:scale-110 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10">Tải lên tài liệu</span>
            <div className="absolute inset-0 bg-white opacity-20 transform -skew-x-12 animate-shimmer"></div>
          </button>
        </div>

        <div className="mb-10 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
            />
          </div>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22gray%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20d%3D%22M8%2012L2%206h12z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center] pr-10"
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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.slice(0, visibleDocs).map((doc, index) => (
                  <div
                    key={doc._id}
                    className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100/20 to-blue-200/20 dark:from-gray-700/20 dark:to-indigo-900/20 rounded-2xl -z-10"></div>
                    <div className="flex items-center gap-4 mb-4">
                      {getFileIcon(doc.type)}
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-wide">
                        {doc.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 text-sm">
                      {doc.description}
                    </p>
                    <button
                      onClick={() => handleDetailClick(doc._id)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-medium rounded-lg shadow-md hover:from-teal-600 hover:to-cyan-700 transform hover:scale-105 transition-all duration-300"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center col-span-full text-lg animate-fade-in">
                  Không có tài liệu nào phù hợp.
                </p>
              )}
            </div>

            {filteredDocuments.length > visibleDocs && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-2xl hover:from-indigo-600 hover:to-purple-700 transform hover:scale-110 transition-all duration-300"
                >
                  Xem thêm
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserDocumentList;