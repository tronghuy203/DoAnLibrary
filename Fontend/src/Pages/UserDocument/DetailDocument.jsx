import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { getDocumentDetail, downloadDocument } from "../../redux/apiDocument";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { pdfjs } from "react-pdf";

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex justify-center items-start py-20 transition-colors duration-500">
      <div className="container mx-auto px-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-16 h-16 border-4 border-t-indigo-500 dark:border-t-indigo-400 border-gray-300 dark:border-gray-700 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <p className="text-red-500 dark:text-red-400 text-center text-xl font-medium animate-fade">
            {error}
          </p>
        ) : !docData ? (
          <p className="text-gray-600 dark:text-gray-400 text-center text-xl font-medium animate-fade">
            Không tìm thấy tài liệu.
          </p>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header Section */}
            <div data-aos="slide-up" className="relative bg-white dark:bg-gray-800/90 backdrop-blur-lg p-8 rounded-xl shadow-lg">
              <div data-aos="slide-up" className="absolute inset-0 bg-gradient-to-r from-gray-200/20 dark:from-gray-700/20 to-gray-100/20 dark:to-gray-600/20 rounded-xl -z-10"></div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                {docData.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-base leading-relaxed">
                {docData.description}
              </p>
              <button
                onClick={handleDownload}
                className="mt-6 px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-600 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Tải xuống tài liệu
              </button>
            </div>

            {/* PDF Viewer Section */}
            {docData.fileUrl && (
              <div className="relative bg-white dark:bg-gray-800/90 backdrop-blur-lg p-6 rounded-2xl shadow-lg animate-fade">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 dark:from-gray-700/20 to-gray-100/20 dark:to-gray-600/20 rounded-2xl -z-10"></div>
                <div
                  className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-800"
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
      </div>
    </div>
  );
};

export default DetailDocument;