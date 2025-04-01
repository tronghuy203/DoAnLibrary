import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadDocument } from "../../redux/apiDocument";
import { createAxios } from "../../createInstance"; // Assuming axiosJWT setup is here
import { loginSuccess } from "../../redux/authSlice";
import { useNavigate } from "react-router-dom"; // Import useNavigate từ react-router-dom

const UploadDocument = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate(); 
  // Create axios instance with user token and dispatch logic
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  // State variables for document upload form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleUpload = useCallback(
    async (e) => {
      e.preventDefault();
      
      if (!file || !title || !description) {
        setMessage("Vui lòng điền đầy đủ thông tin.");
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("file", file);

      try {
        // Call the uploadDocument function with proper arguments
        await uploadDocument(formData, user.accessToken, dispatch, axiosJWT);
        
        setMessage("Tài liệu đã được tải lên thành công!");
        // Reset form state
        setTitle("");
        setDescription("");
        setFile(null);
      } catch (error) {
        console.error("Upload failed", error);
        setMessage("Có lỗi xảy ra khi tải lên tài liệu!");
      }
    },
    [title, description, file, user?.accessToken, dispatch, axiosJWT]
  );

  // Hàm xử lý quay lại trang document-list
  const handleBackClick = () => {
    navigate("/document-list"); // Điều hướng quay lại trang document-list
  };
  
  useEffect(()=>{
    if (!user) {
      navigate("/login")
    } 
  },[user,navigate])

  return (
    <div>
      <h2>Tải lên tài liệu</h2>

      {message && (
        <div
          className={`mb-4 p-4 rounded-md text-center text-sm ${
            message.includes("thành công")
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Tiêu đề"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-2 rounded-lg"
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Mô tả"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full p-2 rounded-lg"
          />
        </div>

        <div>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            required
            className="w-full p-2 rounded-lg"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg"
        >
          Tải lên
        </button>
      </form>

      {/* Nút quay lại trang document-list */}
      <button
        onClick={handleBackClick}
        className="mt-4 w-full bg-gray-500 text-white py-2 rounded-lg"
      >
        Quay lại danh sách tài liệu
      </button>
    </div>
  );
};

export default UploadDocument;
