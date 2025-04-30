import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadDocument } from "../../redux/apiDocument";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";

const UploadDocument = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [message, setMessage] = useState("");

  const allowedFileTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
  const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];
  const handleUpload = useCallback(
    async (e) => {
      e.preventDefault();
      if (!file || !title || !description) {
        setMessage("Vui lòng điền đầy đủ tất cả các trường.");
        return;
      }

      if (!allowedFileTypes.includes(file.type)) {
        setMessage("Chỉ hỗ trợ các định dạng: PDF, Word, Excel.");
        return;
      }

      if (thumbnail && !allowedImageTypes.includes(thumbnail.type)) {
        setMessage("Ảnh bìa chỉ hỗ trợ định dạng: JPEG, PNG, GIF.");
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("file", file);
      if (thumbnail) formData.append("thumbnail", thumbnail);
      try {
        await uploadDocument(formData, user.accessToken, dispatch, axiosJWT);
        setMessage("Tài liệu đã được tải lên và đang chờ admin phê duyệt!");
        setTitle("");
        setDescription("");
        setFile(null);
        setThumbnail(null);
      } catch (error) {
        console.error("Upload failed:", error);
        const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi khi tải lên tài liệu!";
        setMessage(errorMessage);
      }
    },
    [title, description, file, thumbnail, user?.accessToken, dispatch, axiosJWT]
  );

  const handleBackClick = () => {
    navigate("/document-list");
  };

  const handleClearFile = () => {
    setFile(null);
  };
  const handleClearThumbnail = () => {
    setThumbnail(null);
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 dark:from-zinc-800 dark:via-zinc-900 dark:to-black flex items-center justify-center transition-colors duration-500">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-lg p-8 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-zinc-700/50"
      >
        <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-8 tracking-tight">
          Tải lên tài liệu của bạn
        </h2>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`mb-6 p-4 rounded-xl text-center text-sm font-medium shadow-sm ${
              message.includes("thành công") || message.includes("phê duyệt")
                ? "bg-green-100 text-green-900 dark:bg-green-900/70 dark:text-green-100"
                : "bg-red-100 text-red-900 dark:bg-red-900/70 dark:text-red-100"
            }`}
          >
            {message}
          </motion.div>
        )}

        <form onSubmit={handleUpload} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Tiêu đề"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full p-4 rounded-xl bg-gray-100/50 dark:bg-zinc-700/50 text-gray-800 dark:text-white border border-gray-300/50 dark:border-zinc-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500 dark:placeholder-zinc-400 transition-all duration-300"
            />
          </div>

          <div>
            <textarea
              placeholder="Mô tả"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full p-4 rounded-xl bg-gray-100/50 dark:bg-zinc-700/50 text-gray-800 dark:text-white border border-gray-300/50 dark:border-zinc-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500 dark:placeholder-zinc-400 transition-all duration-300"
            />
          </div>

          <div className="relative">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              required
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              className="w-full p-4 rounded-xl bg-gray-100/50 dark:bg-zinc-700/50 text-gray-800 dark:text-white border border-gray-300/50 dark:border-zinc-600/50 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-500 file:text-white hover:file:bg-indigo-600 transition-all duration-300"
            />
            {file && (
              <button
                type="button"
                onClick={handleClearFile}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500"
              >
                <FaTimes />
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="file"
              onChange={(e) => setThumbnail(e.target.files[0])}
              accept="image/jpeg,image/png,image/gif"
              className="w-full p-4 rounded-xl bg-gray-100/50 dark:bg-zinc-700/50 text-gray-800 dark:text-white border border-gray-300/50 dark:border-zinc-600/50 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-500 file:text-white hover:file:bg-indigo-600 transition-all duration-300"
            />
            {thumbnail && (
              <button
                type="button"
                onClick={handleClearThumbnail}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all duration-300 shadow-md"
          >
            Tải lên
          </motion.button>
        </form>

        <motion.button
          whileHover={{ scale: 1.03, boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)" }}
          whileTap={{ scale: 0.97 }}
          onClick={handleBackClick}
          className="mt-6 w-full bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 dark:bg-zinc-600 dark:hover:bg-zinc-700 transition-all duration-300 shadow-md"
        >
          Quay lại danh sách tài liệu
        </motion.button>
      </motion.div>
    </div>
  );
};

export default UploadDocument;