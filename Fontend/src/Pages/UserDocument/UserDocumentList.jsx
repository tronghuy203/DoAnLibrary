import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllDocumentsUser } from "../../redux/apiDocument";
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
    if (!user){
      navigate("/login")
    }else if (user?.accessToken) {
      getAllDocumentsUser(user?.accessToken, dispatch, axiosJWT);
    }
  }, [user, navigate, user?.accessToken, dispatch, axiosJWT]);

  const handleUploadClick = () => {
    navigate("/upload-document");
  };

  const handleDetailClick = (id) => {
    navigate(`/document/${id}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Danh sách tài liệu</h2>
      <button
        onClick={handleUploadClick}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Tải lên tài liệu
      </button>
      {isLoading ? (
        <p className="text-gray-600">Đang tải...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents && documents.length > 0 ? (
            documents.map((doc) => (
              <div key={doc._id} className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold">{doc.title}</h3>
                <p className="text-gray-600">{doc.description}</p>
                <button
                  onClick={() => handleDetailClick(doc._id)}
                  className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Xem chi tiết
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-600">Không có tài liệu nào.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDocumentList;
