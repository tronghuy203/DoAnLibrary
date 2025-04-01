import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllDocumentsAdmin, deleteDocument } from "../../redux/apiDocument";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";

const AdminDocumentList = () => {
  const user = useSelector((state) => state.auth.login?.currentUser); // Lấy user hiện tại
  const documents = useSelector((state) => state.document.documents); // Lấy danh sách tài liệu
  const isLoading = useSelector((state) => state.document.isFetching); // Kiểm tra trạng thái loading
  const dispatch = useDispatch();

  // Tạo instance axiosJWT có xác thực
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  // Lấy danh sách tài liệu khi component được render
  useEffect(() => {
    if (user?.accessToken) {
      getAllDocumentsAdmin(user?.accessToken, dispatch, axiosJWT); // Gọi API lấy danh sách tài liệu
    }
  }, [user, dispatch, axiosJWT]);

  // Xử lý xóa tài liệu
  const handleDelete = async (documentId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) {
      await deleteDocument(documentId, user?.accessToken, dispatch, axiosJWT);
    }
  };

  return (
    <div>
      <h2>Quản lý tài liệu</h2>
      {isLoading && <p>Đang tải...</p>}
      <table border="1">
        <thead>
          <tr>
            <th>Tiêu đề</th>
            <th>Mô tả</th>
            <th>Người tải lên</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {documents?.length > 0 ? (
            documents.map((doc) => (
              <tr key={doc._id}>
                <td>{doc.title}</td>
                <td>{doc.description}</td>
                <td>{doc.uploadedBy?.username || "Không xác định"}</td> {/* Hiển thị username */}
                <td>
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">Xem</a>
                  <button onClick={() => handleDelete(doc._id)}>Xóa</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">Không có tài liệu nào</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDocumentList;
