import {
  getDocumentsStart,
  getDocumentsSuccess,
  getDocumentsFailed,
  getPendingDocumentsStart,
  getPendingDocumentsSuccess,
  getPendingDocumentsFailed,
  approveDocumentStart,
  approveDocumentSuccess,
  approveDocumentFailed,
  rejectDocumentStart,
  rejectDocumentSuccess,
  rejectDocumentFailed,
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

export const getAllDocumentsAdmin = async (accessToken, dispatch, axiosJWT) => {
    dispatch(getDocumentsStart());
    try {
      const res = await axiosJWT.get(`${process.env.REACT_APP_SERVER_URL}/v1/documents`, {
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

export const getAllDocumentsUser = async (accessToken, dispatch, axiosJWT) => {
    dispatch(getDocumentsStart());
    try {
      const res = await axiosJWT.get(`${process.env.REACT_APP_SERVER_URL}/v1/documents`, {
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
  
export const getPendingDocuments = async (accessToken, dispatch, axiosJWT) => {
  dispatch(getPendingDocumentsStart());
  try {
    const res = await axiosJWT.get(`${process.env.REACT_APP_SERVER_URL}/v1/documents/pending`, {
      headers: { token: `Bearer ${accessToken}` },
    });
    dispatch(getPendingDocumentsSuccess(res.data));
    return res.data;
  } catch (err) {
    dispatch(getPendingDocumentsFailed());
    console.error("Lỗi khi tải danh sách tài liệu chờ duyệt:", err);
    return [];
  }
};

export const approveDocument = async (documentId, accessToken, dispatch, axiosJWT) => {
  dispatch(approveDocumentStart());
  try {
    const res = await axiosJWT.put(
      `${process.env.REACT_APP_SERVER_URL}/v1/documents/approve/${documentId}`,
      {},
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(approveDocumentSuccess(res.data.document));
    return res.data;
  } catch (err) {
    dispatch(approveDocumentFailed());
    console.error("Lỗi khi phê duyệt tài liệu:", err);
    throw err;
  }
};

export const rejectDocument = async (documentId, accessToken, dispatch, axiosJWT) => {
  dispatch(rejectDocumentStart());
  try {
    const res = await axiosJWT.put(
      `${process.env.REACT_APP_SERVER_URL}/v1/documents/reject/${documentId}`,
      {},
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(rejectDocumentSuccess(res.data.document));
    return res.data;
  } catch (err) {
    dispatch(rejectDocumentFailed());
    console.error("Lỗi khi từ chối tài liệu:", err);
    throw err;
  }
};

export const getDocumentDetail = async (documentId, accessToken, dispatch, axiosJWT) => {
  dispatch(getDocumentDetailStart());
  try {
    const res = await axiosJWT.get(`${process.env.REACT_APP_SERVER_URL}/v1/documents/${documentId}`, {
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

export const getUserDocuments = async (userId, accessToken, axiosJWT) => {
  try {
    const res = await axiosJWT.get(`${process.env.REACT_APP_SERVER_URL}/v1/documents/user/${userId}`, {
      headers: { token: `Bearer ${accessToken}` },
    });
    return res.data;
  } catch (err) {
    console.error("Lỗi khi lấy tài liệu của người dùng:", err.response ? err.response.data : err.message);
    return [];
  }
};

export const viewDocument = async (documentId, accessToken, dispatch, axiosJWT) => {
  try {
    const res = await axiosJWT.get(`${process.env.REACT_APP_SERVER_URL}/v1/documents/view/${documentId}`, {
      headers: { token: `Bearer ${accessToken}` },
    });
    const { _id, views, viewHistory } = res.data;
    dispatch(incrementViewSuccess({ id: _id, views, viewHistory }));
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const downloadDocument = async (documentId, accessToken, documentTitle, dispatch, axiosJWT) => {
  try {
    const response = await axiosJWT.get(`${process.env.REACT_APP_SERVER_URL}/v1/documents/download/${documentId}`, {
      headers: { token: `Bearer ${accessToken}` },
      responseType: "blob",
    });

    const contentType = response.headers["content-type"];
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!contentType || !allowedMimeTypes.includes(contentType)) {
      throw new Error("Phản hồi không phải file PDF, DOC hoặc DOCX hợp lệ");
    }

    let fileExtension = "pdf";
    if (contentType.includes("msword")) {
      fileExtension = "doc";
    } else if (contentType.includes("openxmlformats")) {
      fileExtension = "docx";
    }

    const blob = new Blob([response.data], { type: contentType });
    if (blob.size === 0) {
      throw new Error("File rỗng hoặc không hợp lệ");
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeTitle = (documentTitle || "document").replace(/[^a-zA-Z0-9-_]/g, "_");
    link.download = `${safeTitle}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    const updatedDoc = await axiosJWT.get(`${process.env.REACT_APP_SERVER_URL}/v1/documents/${documentId}`, {
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
    let errorMessage = "Không thể tải tài liệu. Vui lòng thử lại.";
    if (err.response) {
      if (err.response.status === 403) {
        errorMessage = "Bạn không có quyền tải tài liệu này.";
      } else if (err.response.status === 404) {
        errorMessage = "Tài liệu không tồn tại.";
      } else if (err.response.status === 500) {
        errorMessage = "Lỗi server khi tải tài liệu.";
      }
    } else if (err.message.includes("PDF") || err.message.includes("DOC") || err.message.includes("DOCX")) {
      errorMessage = err.message;
    }
    throw new Error(errorMessage);
  }
};

export const uploadDocument = async (documentData, accessToken, dispatch, axiosJWT) => {
    dispatch(uploadDocumentStart());
    try {
      const res = await axiosJWT.post(`${process.env.REACT_APP_SERVER_URL}/v1/documents/upload`, documentData, {
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
  

export const deleteDocument = async (documentId, accessToken, dispatch, axiosJWT) => {
  dispatch(deleteDocumentStart());
  try {
    await axiosJWT.delete(`${process.env.REACT_APP_SERVER_URL}/v1/documents/${documentId}`, {
      headers: { token: `Bearer ${accessToken}` },
    });
    dispatch(deleteDocumentSuccess(documentId));
  } catch (err) {
    dispatch(deleteDocumentFailed());
    console.error("Lỗi khi xóa tài liệu:", err);
    throw err;
  }
};
