import { createSlice } from "@reduxjs/toolkit";

const documentSlice = createSlice({
  name: "document",
  initialState: {
    documents: [],
    pendingDocuments: [],
    documentDetail: null,
    isFetching: false,
    error: false,
  },
  reducers: {
    // Lấy danh sách tài liệu
    getDocumentsStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    getDocumentsSuccess: (state, action) => {
      state.isFetching = false;
      state.documents = action.payload;
    },
    getDocumentsFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    // Lấy danh sách tài liệu chờ duyệt
    getPendingDocumentsStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    getPendingDocumentsSuccess: (state, action) => {
      state.isFetching = false;
      state.pendingDocuments = action.payload;
    },
    getPendingDocumentsFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    // Phê duyệt tài liệu
    approveDocumentStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    approveDocumentSuccess: (state, action) => {
      state.isFetching = false;
      // Cập nhật trạng thái tài liệu trong pendingDocuments
      state.pendingDocuments = state.pendingDocuments.filter(
        (doc) => doc._id !== action.payload._id
      );
      // Thêm tài liệu vào documents nếu cần
      state.documents.push(action.payload);
    },
    approveDocumentFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    // Từ chối tài liệu
    rejectDocumentStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    rejectDocumentSuccess: (state, action) => {
      state.isFetching = false;
      // Xóa tài liệu khỏi pendingDocuments
      state.pendingDocuments = state.pendingDocuments.filter(
        (doc) => doc._id !== action.payload._id
      );
    },
    rejectDocumentFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    // Lấy chi tiết tài liệu
    getDocumentDetailStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    getDocumentDetailSuccess: (state, action) => {
      state.isFetching = false;
      state.documentDetail = action.payload;
    },
    getDocumentDetailFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

     incrementViewSuccess: (state, action) => {
          const document = state.documents.find(doc => doc._id === action.payload.id);
          if (document) {
            document.views = action.payload.views;
          }
        },
        incrementDownloadSuccess: (state, action) => {
          const document = state.documents.find(doc => doc._id === action.payload.id);
          if (document) {
            document.downloads = action.payload.downloads;
          }
        },

    // Upload tài liệu mới
    uploadDocumentStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    uploadDocumentSuccess: (state, action) => {
        state.isFetching = false;
        
        if (!Array.isArray(state.documents)) {
            state.documents = [];  // Initialize it as an empty array if not
          }
        
        if (action.payload && Array.isArray(state.documents)) {
          state.documents.push(action.payload);
        } else {
          state.error = true; // Optional: Set an error flag if payload is invalid
          console.error("Invalid payload in uploadDocumentSuccess:", action.payload);
        }
      },
      
    uploadDocumentFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    // Xóa tài liệu
    deleteDocumentStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    deleteDocumentSuccess: (state, action) => {
      state.isFetching = false;
      state.documents = state.documents.filter(doc => doc._id !== action.payload);
    },
    deleteDocumentFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },
  },
});

export const {
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
  incrementViewSuccess,
  incrementDownloadSuccess,
  uploadDocumentStart,
  uploadDocumentSuccess,
  uploadDocumentFailed,
  deleteDocumentStart,
  deleteDocumentSuccess,
  deleteDocumentFailed,
} = documentSlice.actions;

export default documentSlice.reducer;
