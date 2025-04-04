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
  incrementDownloadSuccess,
  incrementViewSuccess
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


// Tăng lượt xem tài liệu
export const viewDocument = async (documentId, accessToken, dispatch, axiosJWT) => {
  try {
    const res = await axiosJWT.get(`/v1/documents/view/${documentId}`, {
      headers: { token: `Bearer ${accessToken}` },
    });
    const { _id, views, viewHistory } = res.data; // Lấy viewHistory từ response
    dispatch(incrementViewSuccess({ id: _id, views, viewHistory }));
    return res.data; // Trả về dữ liệu để component có thể sử dụng nếu cần
  } catch (err) {
    console.error("Lỗi khi xem tài liệu:", err);
    throw err;
  }
};


// Tải tài liệu
export const downloadDocument = async (documentId, accessToken, documentTitle, dispatch, axiosJWT) => {
  try {
    const response = await axiosJWT.get(`/v1/documents/download/${documentId}`, {
      headers: { token: `Bearer ${accessToken}` },
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${documentTitle || "document"}.pdf`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // Gọi API để lấy thông tin cập nhật sau khi tải
    const updatedDoc = await axiosJWT.get(`/v1/documents/${documentId}`, {
      headers: { token: `Bearer ${accessToken}` },
    });
    dispatch(
      incrementDownloadSuccess({
        id: documentId,
        downloads: updatedDoc.data.downloads,
        downloadHistory: updatedDoc.data.downloadHistory,
      })
    );
    return updatedDoc.data;
  } catch (err) {
    console.error("Lỗi khi tải tài liệu:", err);
    throw err;
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
