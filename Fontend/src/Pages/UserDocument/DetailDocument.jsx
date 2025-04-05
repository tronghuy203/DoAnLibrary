import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { getDocumentDetail, downloadDocument } from "../../redux/apiDocument";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { pdfjs } from "react-pdf";
import ReviewSection from "../ReviewSection/ReviewSection";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.0.279/build/pdf.worker.min.js`;

const DetailDocument = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.login?.currentUser);

  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  const [docData, setDocData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!user) {
        navigate("/login");
      } else if (user?.accessToken) {
        try {
          const res = await getDocumentDetail(id, user.accessToken, dispatch, axiosJWT);
          if (res) {
            setDocData(res);
          }
        } catch (err) {
          setError("Lỗi khi lấy tài liệu.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchDocument();
  }, [user, navigate, id, dispatch, user?.accessToken, axiosJWT]);

  const handleDownload = () => {
    if (!docData) {
      setError("Không có tài liệu để tải xuống.");
      return;
    }
    downloadDocument(id, user.accessToken, docData.title, dispatch, axiosJWT).catch((err) => {
      console.error("Lỗi khi tải xuống:", err);
      setError("Không thể tải tài liệu xuống. Vui lòng thử lại.");
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-50 via-blue-100 to-purple-100 dark:from-gray-900 dark:via-zinc-800 dark:to-indigo-900 flex justify-center items-start py-20 transition-colors duration-700">
      <div className="container mx-auto px-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-16 h-16 border-4 border-t-purple-500 border-indigo-200 dark:border-indigo-700 rounded-full animate-spin animate-pulse"></div>
          </div>
        ) : error ? (
          <p className="text-red-500 dark:text-red-300 text-center text-xl font-medium animate-bounce-in">
            {error}
          </p>
        ) : !docData ? (
          <p className="text-gray-600 dark:text-gray-400 text-center text-xl font-medium animate-bounce-in">
            Không tìm thấy tài liệu.
          </p>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg p-8 rounded-3xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-500 animate-slide-in-down">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-3xl -z-10"></div>
              <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                {docData.title}
              </h2>
              <p className="text-gray-700 dark:text-gray-200 mt-3 text-lg leading-relaxed">
                {docData.description}
              </p>
              <button
                onClick={handleDownload}
                className="mt-6 px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:from-purple-600 hover:to-indigo-700 transform hover:scale-110 transition-all duration-300 relative overflow-hidden"
              >
                <span className="relative z-10">Tải xuống tài liệu</span>
                <div className="absolute inset-0 bg-white opacity-25 transform -skew-x-12 animate-shimmer"></div>
              </button>
            </div>

            {/* PDF Viewer Section */}
            {docData.fileUrl && (
              <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg p-6 rounded-3xl shadow-xl animate-fade-in-up">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/20 to-purple-100/20 dark:from-indigo-800/20 dark:to-purple-800/20 rounded-3xl -z-10"></div>
                <div
                  className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-gray-100 dark:scrollbar-thumb-indigo-400 dark:scrollbar-track-gray-800"
                  style={{ height: "600px" }}
                >
                  <Worker workerUrl={pdfjs.GlobalWorkerOptions.workerSrc}>
                    <Viewer
                      fileUrl={docData.fileUrl}
                      defaultScale={1.0}
                      theme={{ theme: "auto" }}
                      scrollMode="vertical"
                    />
                  </Worker>
                </div>
              </div>
            )}
          </div>
        )}
        {docData && (
          <ReviewSection type="document" itemId={docData._id} user={user} />
        )}
      </div>   
    </div>
  );
};

export default DetailDocument;