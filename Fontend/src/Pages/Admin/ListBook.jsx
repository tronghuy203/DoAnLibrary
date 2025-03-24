import React, { useEffect, useState } from "react";
import { getAllBooks, deleteBook } from "../../redux/apiBooks";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

const ListBook = () => {
  const [books, setBooks] = useState([]); // Ensure books is an array
  const dispatch = useDispatch();
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await getAllBooks(accessToken, dispatch);
        setBooks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Lỗi khi tải danh sách sách:", err);
        setBooks([]); // Ensure books is always an array
      }
    };
    fetchBooks();
  }, [dispatch, accessToken]);

  const handleDelete = async (bookId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sách này không?")) {
      try {
        await deleteBook(bookId, accessToken, dispatch);
        setBooks((prevBooks) => prevBooks.filter((book) => book._id !== bookId));
      } catch (err) {
        console.error("Lỗi khi xóa sách:", err);
      }
    }
  };

  return (
    <div>
      <h2>Danh sách sách</h2>
      {books.length === 0 ? (
        <p>Không có sách nào</p>
      ) : (
        <ul>
          {books.map((book) => (
            <li key={book._id}>
              {book.title} - {book.author} - {book.price} VND
              <Link to={`/admin/books/update/${book._id}`}>
                <button>Cập nhật</button>
              </Link>
              <button onClick={() => handleDelete(book._id)}>Xóa</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ListBook;
