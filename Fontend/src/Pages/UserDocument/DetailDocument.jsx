import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { getDocumentDetail, downloadDocument } from "../../redux/apiDocument";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { pdfjs } from 'react-pdf';

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
    downloadDocument(id, user.accessToken, docData.title, dispatch, axiosJWT)
      .catch((err) => {
        console.error("Lỗi khi tải xuống:", err);
        setError("Không thể tải tài liệu xuống. Vui lòng thử lại.");
      });
  };

  if (isLoading) return <p>Đang tải...</p>;
  if (error) return <p>{error}</p>;
  if (!docData) return <p>Không tìm thấy tài liệu.</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold">{docData.title}</h2>
      <p className="text-gray-600 mt-2">{docData.description}</p>
      
      <button
        onClick={handleDownload}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Tải xuống tài liệu
      </button>

      {docData.fileUrl && (
        <div className="mt-4" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Worker workerUrl={pdfjs.GlobalWorkerOptions.workerSrc}>
            <Viewer fileUrl={docData.fileUrl} />
          </Worker>
        </div>
      )}
    </div>
  );
};

export default DetailDocument;