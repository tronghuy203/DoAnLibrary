import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { getDocumentDetail } from "../../redux/apiDocument";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry"; // Import worker cục bộ

const DetailDocument = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.login?.currentUser);

  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user,dispatch]);

  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocument = async () => {
      if(!user){
        navigate("/login")
      }else if(user?.accessToken) {
        try {
          const res = await getDocumentDetail(id, user.accessToken, dispatch, axiosJWT);
          if (res) {
            setDocument(res);
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

  if (isLoading) return <p>Đang tải...</p>;
  if (error) return <p>{error}</p>;
  if (!document) return <p>Không tìm thấy tài liệu.</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold">{document.title}</h2>
      <p className="text-gray-600 mt-2">{document.description}</p>
      {document.fileUrl && (
        <div className="mt-4">
          <Worker workerUrl={pdfjsWorker}>
            <Viewer fileUrl={document.fileUrl} />
          </Worker>
        </div>
      )}
    </div>
  );
};

export default DetailDocument;