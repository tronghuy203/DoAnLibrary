import {
  getBooksStart,
  getBooksSuccess,
  getBooksFailed,
  createBookStart,
  createBookSuccess,
  createBookFailed,
  updateBookStart,
  updateBookSuccess,
  updateBookFailed,
  deleteBookStart,
  deleteBookSuccess,
  deleteBookFailed,
  getBookDetailStart,
  getBookDetailSuccess,
  getBookDetailFailed
} from "./bookSlice";

export const getAllBooks = async (accessToken, dispatch,axiosJWT) => {
  dispatch(getBooksStart());
  try {
    const res = await axiosJWT.get("http://localhost:8000/v1/books", {
      headers: { token: `Bearer ${accessToken}` },
    });
    dispatch(getBooksSuccess(Array.isArray(res.data) ? res.data : []));
    return res.data;
  } catch (err) {
    dispatch(getBooksFailed());
    console.error("Lỗi khi tải sách:", err);
    return [];
  }
};

export const getBookDetail = async (bookId, accessToken, dispatch, axiosJWT) => {
  dispatch(getBookDetailStart());
  try {
    const res = await axiosJWT.get(`http://localhost:8000/v1/books/${bookId}`, {
      headers: { token: `Bearer ${accessToken}` },
    });
    dispatch(getBookDetailSuccess(res.data));
    return res.data;
  } catch (err) {
    dispatch(getBookDetailFailed());
    console.error("Lỗi khi lấy chi tiết sách:", err);
    return null;
  }
};

export const createBook = async (book, accessToken, dispatch,axiosJWT) => {
  dispatch(createBookStart());
  try {
    const res = await axiosJWT.post("http://localhost:8000/v1/books", book, {
      headers: { token: `Bearer ${accessToken}` },
    });
    dispatch(createBookSuccess(res.data));
    return res.data;
  } catch (err) {
    dispatch(createBookFailed());
    console.error("Lỗi khi tạo sách:", err);
    throw err;
  }
};

export const updateBook = async (bookId, updatedBook, accessToken, dispatch,axiosJWT) => {
  dispatch(updateBookStart());
  try {
    const res = await axiosJWT.put(`http://localhost:8000/v1/books/${bookId}`, updatedBook, {
      headers: {  
        "Content-Type": "multipart/form-data",
        token: `Bearer ${accessToken}` },
    });
    dispatch(updateBookSuccess(res.data));
    return res.data;
  } catch (err) {
    dispatch(updateBookFailed());
    console.error("Lỗi khi cập nhật sách:", err);
    throw err;
  }
};

export const deleteBook = async (bookId, accessToken, dispatch,axiosJWT) => {
  dispatch(deleteBookStart());
  try {
    await axiosJWT.delete(`http://localhost:8000/v1/books/${bookId}`, {
      headers: { token: `Bearer ${accessToken}` },
    });
    dispatch(deleteBookSuccess(bookId));
  } catch (err) {
    dispatch(deleteBookFailed());
    console.error("Lỗi khi xóa sách:", err);
    throw err;
  }
};
