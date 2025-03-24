import React, { useState } from "react";
import { createBook } from "../../redux/apiBooks";
import { useDispatch } from "react-redux";

const CreateBook = () => {
  const [book, setBook] = useState({
    title: "",
    author: "",
    description: "",
    price: 0,
  });
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setBook({ ...book, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Lấy accessToken từ localStorage (đảm bảo token của admin đã được lưu)
      const accessToken = localStorage.getItem("accessToken");
      const data = await createBook(book, accessToken, dispatch);
      setMessage("Sách đã được tạo thành công!");
      console.log("Created Book:", data);
    } catch (err) {
      setMessage("Có lỗi xảy ra khi tạo sách!");
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Tạo sách mới</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Tiêu đề:</label>
          <input
            type="text"
            name="title"
            value={book.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Tác giả:</label>
          <input
            type="text"
            name="author"
            value={book.author}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Mô tả:</label>
          <textarea
            name="description"
            value={book.description}
            onChange={handleChange}
          ></textarea>
        </div>
        <div>
          <label>Giá:</label>
          <input
            type="number"
            name="price"
            value={book.price}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Tạo sách</button>
      </form>
    </div>
  );
};

export default CreateBook;
