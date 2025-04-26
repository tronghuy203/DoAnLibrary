import { createSlice } from "@reduxjs/toolkit";

const bookSlice = createSlice({
  name: "books",
  initialState: {
    allBooks: [],
    detailBook: null,
    isFetching: false,
    error: false,
    createBookStatus: "",
  },
  reducers: {
    getBooksStart: (state) => {
      state.isFetching = true;
    },
    getBooksSuccess: (state, action) => {
      state.isFetching = false;
      state.allBooks = action.payload;
      state.error = false;
    },
    getBooksFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    getBookDetailStart: (state) => {
      state.isFetching = true;
    },
    getBookDetailSuccess: (state, action) => {
      state.isFetching = false;
      state.detailBook = action.payload;
      state.error = false;
    },
    getBookDetailFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    createBookStart: (state) => {
      state.isFetching = true;
      state.error = false;
      state.createBookStatus = "loading";
    },
    createBookSuccess: (state, action) => {
      state.isFetching = false;
      state.createBookStatus = "success";
      state.allBooks.push(action.payload);
    },
    createBookFailed: (state) => {
      state.isFetching = false;
      state.error = true;
      state.createBookStatus = "failed";
    },

    updateBookStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    updateBookSuccess: (state, action) => {
      state.isFetching = false;
      state.allBooks = state.allBooks.map((book) =>
        book._id === action.payload._id ? action.payload : book
      );
    },
    updateBookFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    deleteBookStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    deleteBookSuccess: (state, action) => {
      state.isFetching = false;
      state.allBooks = state.allBooks.filter((book) => book._id !== action.payload);
    },
    deleteBookFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },
  },
});

export const {
  getBooksStart,
  getBooksSuccess,
  getBooksFailed,
  getBookDetailStart,
  getBookDetailSuccess,
  getBookDetailFailed,
  incrementViewSuccess,
  incrementDownloadSuccess,
  createBookStart,
  createBookSuccess,
  createBookFailed,
  updateBookStart,
  updateBookSuccess,
  updateBookFailed,
  deleteBookStart,
  deleteBookSuccess,
  deleteBookFailed,

} = bookSlice.actions;

export default bookSlice.reducer;
