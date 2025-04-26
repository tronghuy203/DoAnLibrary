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

    approveDocumentStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    approveDocumentSuccess: (state, action) => {
      state.isFetching = false;
      state.pendingDocuments = state.pendingDocuments.filter(
        (doc) => doc._id !== action.payload._id
      );
      state.documents.push(action.payload);
    },
    approveDocumentFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    rejectDocumentStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    rejectDocumentSuccess: (state, action) => {
      state.isFetching = false;
      state.pendingDocuments = state.pendingDocuments.filter(
        (doc) => doc._id !== action.payload._id
      );
    },
    rejectDocumentFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

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

    uploadDocumentStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    uploadDocumentSuccess: (state, action) => {
        state.isFetching = false;
        
        if (!Array.isArray(state.documents)) {
            state.documents = [];
          }
        
        if (action.payload && Array.isArray(state.documents)) {
          state.documents.push(action.payload);
        } else {
          state.error = true;
          console.error("Invalid payload in uploadDocumentSuccess:", action.payload);
        }
      },
      
    uploadDocumentFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

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
