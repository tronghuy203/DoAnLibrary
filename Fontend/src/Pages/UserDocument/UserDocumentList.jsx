import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllDocumentsUser, viewDocument } from "../../redux/apiDocument";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";

const UserDocumentList = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const dispatch = useDispatch();
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);
  const documents = useSelector((state) => state.document.documents);
  const isLoading = useSelector((state) => state.document.isFetching);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user?.accessToken) {
      getAllDocumentsUser(user?.accessToken, dispatch, axiosJWT);
    }
  }, [user, navigate, user?.accessToken, dispatch, axiosJWT]);

  const handleUploadClick = () => {
    navigate("/upload-document");
  };

  const handleDetailClick = (id) => {
    if (user?.accessToken) {
      viewDocument(id, user?.accessToken, dispatch, axiosJWT);
    }
    navigate(`/document/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-zinc-800 flex justify-center items-start py-32 transition-colors duration-500">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-16">
          <h2 data-aos="slide-up" className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight animate-slide-in-left">
            Danh sách tài liệu
          </h2>
          <button data-aos="slide-up"
            onClick={handleUploadClick}
            className="relative px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-2xl hover:from-indigo-600 hover:to-purple-700 transform hover:scale-110 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10">Tải lên tài liệu</span>
            <div className="absolute inset-0 bg-white opacity-20 transform -skew-x-12 animate-shimmer"></div>
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-16 h-16 border-4 border-t-indigo-500 border-gray-300 dark:border-gray-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {documents && documents.length > 0 ? (
              documents.map((doc, index) => (
                <div
                  key={doc._id}
                  className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Glassmorphism Card */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100/20 to-blue-200/20 dark:from-gray-700/20 dark:to-indigo-900/20 rounded-2xl -z-10"></div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-wide">
                    {doc.title}
                  </h3>
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
                Không có tài liệu nào để hiển thị.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDocumentList;