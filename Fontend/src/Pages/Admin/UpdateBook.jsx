import React, { useEffect, useState } from "react";
import { updateBook, getAllBooks } from "../../redux/apiBooks";
import { useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";

const UpdateBook = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState({ title: "", author: "", description: "", price: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const books = await getAllBooks(accessToken, dispatch);
        const foundBook = books.find((b) => b._id === bookId);
        if (foundBook) {
          setBook(foundBook);
        } else {
          setError("Không tìm thấy sách.");
        }
      } catch (error) {
        setError("Lỗi khi tải dữ liệu sách.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [bookId, dispatch, accessToken]);

  const handleChange = (e) => {
    setBook({ ...book, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateBook(bookId, book, accessToken, dispatch);
      alert("Cập nhật thành công!");
      navigate("/admin/books/list");
    } catch (error) {
      alert("Cập nhật thất bại! Vui lòng thử lại.");
    }
  };

  if (loading) return <p>Đang tải dữ liệu sách...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: "500px", margin: "auto", padding: "20px" }}>
      <h2>Cập nhật sách</h2>
      <form onSubmit={handleSubmit}>
        <label>Tiêu đề:</label>
        <input type="text" name="title" value={book.title} onChange={handleChange} required />

        <label>Tác giả:</label>
        <input type="text" name="author" value={book.author} onChange={handleChange} required />

        <label>Mô tả:</label>
        <textarea name="description" value={book.description} onChange={handleChange} required />

        <label>Giá:</label>
        <input type="number" name="price" value={book.price} onChange={handleChange} required />

        <button type="submit" style={{ marginTop: "10px" }}>Cập nhật</button>
      </form>
    </div>
  );
};

export default UpdateBook;
