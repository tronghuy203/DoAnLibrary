import React, { useMemo, useState } from "react";
import { createBook } from "../../redux/apiBooks";
import { useDispatch, useSelector } from "react-redux";
import { createAxios } from "../../createInstance"; // Import axiosJWT
import { loginSuccess } from "../../redux/authSlice";

const CreateBook = () => {
  const [book, setBook] = useState({
    title: "",
    author: "",
    description: "",
    price: 0,
  });
  const [message, setMessage] = useState("");

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login.currentUser);
  const accessToken = user?.accessToken;
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  const handleChange = (e) => {
    setBook({ ...book, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!accessToken) {
        setMessage("Bạn cần đăng nhập để tạo sách.");
        return;
      }
      const data = await createBook(book, accessToken, dispatch, axiosJWT);
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
            required
          />
        </div>
        <button type="submit">Tạo sách</button>
      </form>
    </div>
  );
};

export default CreateBook;
