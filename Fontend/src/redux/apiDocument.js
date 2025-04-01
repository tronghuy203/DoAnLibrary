import axios from "axios";
import {
  getDocumentsStart,
  getDocumentsSuccess,
  getDocumentsFailed,
  getDocumentDetailStart,
  getDocumentDetailSuccess,
  getDocumentDetailFailed,
  uploadDocumentStart,
  uploadDocumentSuccess,
  uploadDocumentFailed,
  deleteDocumentStart,
  deleteDocumentSuccess,
  deleteDocumentFailed,
} from "./documentSlice";

// Lấy tất cả tài liệu (Admin)
export const getAllDocumentsAdmin = async (accessToken, dispatch, axiosJWT) => {
    dispatch(getDocumentsStart());
    try {
      const res = await axiosJWT.get("http://localhost:8000/v1/documents", {
        headers: { token: `Bearer ${accessToken}` },
      });
      dispatch(getDocumentsSuccess(res.data));
      return res.data;
    } catch (err) {
      dispatch(getDocumentsFailed());
      console.error("Lỗi khi tải danh sách tài liệu (Admin):", err);
      return [];
    }
  };
  
  // Lấy danh sách tài liệu có thể tải xuống (User)
  export const getAllDocumentsUser = async (accessToken, dispatch, axiosJWT) => {
    dispatch(getDocumentsStart());
    try {
      const res = await axiosJWT.get("http://localhost:8000/v1/documents", {
        headers: { token: `Bearer ${accessToken}` },
      });
      dispatch(getDocumentsSuccess(res.data));
      return res.data;
    } catch (err) {
      dispatch(getDocumentsFailed());
      console.error("Lỗi khi tải danh sách tài liệu (User):", err);
      return [];
    }
  };
  
  
// Lấy chi tiết tài liệu
export const getDocumentDetail = async (documentId, accessToken, dispatch, axiosJWT) => {
  dispatch(getDocumentDetailStart());
  try {
    const res = await axiosJWT.get(`/v1/documents/${documentId}`, {
      headers: { token: `Bearer ${accessToken}` },
    });
    dispatch(getDocumentDetailSuccess(res.data));
    return res.data;
  } catch (err) {
    dispatch(getDocumentDetailFailed());
    console.error("Error fetching document:", err.response ? err.response.data : err);
    return null;
  }
};




// Tải lên tài liệu mới
export const uploadDocument = async (documentData, accessToken, dispatch, axiosJWT) => {
    dispatch(uploadDocumentStart());
    try {
      const res = await axiosJWT.post("http://localhost:8000/v1/documents/upload", documentData, {
        headers: {
          "Content-Type": "multipart/form-data",
          token: `Bearer ${accessToken}`,
        },
      });
      dispatch(uploadDocumentSuccess(res.data));
      return res.data;
    } catch (err) {
      console.error("Lỗi khi tải lên tài liệu:", err.response ? err.response.data : err.message);
      dispatch(uploadDocumentFailed());
      throw err;
    }
  };
  

// Xóa tài liệu
export const deleteDocument = async (documentId, accessToken, dispatch, axiosJWT) => {
  dispatch(deleteDocumentStart());
  try {
    await axiosJWT.delete(`http://localhost:8000/v1/documents/${documentId}`, {
      headers: { token: `Bearer ${accessToken}` },
    });
    dispatch(deleteDocumentSuccess(documentId)); // Xóa thành công
  } catch (err) {
    dispatch(deleteDocumentFailed());
    console.error("Lỗi khi xóa tài liệu:", err);
    throw err;
  }
};
