import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadDocument } from "../../redux/apiDocument";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaFilePdf, FaImage, FaInfoCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";
import LoadingSpinner from "../Admin/LoadingSpinner";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  const allowedFileTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const allowedImageTypes = ["image/jpeg", "image/png"];

  const handleUpload = useCallback(
    async (e) => {
      e.preventDefault();
      if (!file || !title || !description) {
        setMessage("Vui lòng điền đầy đủ tất cả các trường.");
        return;
      }

      if (!allowedFileTypes.includes(file.type)) {
        setMessage("Chỉ hỗ trợ các định dạng: PDF, Word.");
        return;
      }

      if (thumbnail && !allowedImageTypes.includes(thumbnail.type)) {
        setMessage("Ảnh bìa chỉ hỗ trợ định dạng: JPEG, PNG.");
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("file", file);
      if (thumbnail) formData.append("thumbnail", thumbnail);

      try {
        setIsLoading(true);
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
      } finally {
        setIsLoading(false);
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

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isLoading) {
      e.currentTarget.classList.add("border-indigo-500", "bg-indigo-100/20");
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-indigo-500", "bg-indigo-100/20");
  };

  const handleDropFile = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-indigo-500", "bg-indigo-100/20");
    if (isLoading) return;
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && allowedFileTypes.includes(droppedFile.type)) {
      setFile(droppedFile);
    } else {
      setMessage("Vui lòng thả file PDF hoặc Word hợp lệ.");
    }
  };

  const handleDropThumbnail = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-indigo-500", "bg-indigo-100/20");
    if (isLoading) return;
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && allowedImageTypes.includes(droppedFile.type)) {
      setThumbnail(droppedFile);
    } else {
      setMessage("Vui lòng thả ảnh JPEG hoặc PNG hợp lệ.");
    }
  };

  return (
    <div className="min-h-screen py-12 mt-10 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-zinc-900 dark:via-zinc-800 dark:to-black flex items-center justify-center transition-colors duration-500 relative overflow-hidden">
      <LoadingSpinner isLoading={isLoading} />
      <div className="mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6 sm:gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full lg:max-w-lg p-6 sm:p-8 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/30 dark:border-zinc-700/30 z-10"
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-6 sm:mb-8 tracking-tight">
            Tải lên tài liệu của bạn
          </h2>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`mb-6 p-4 rounded-xl text-center text-sm sm:text-base font-medium shadow-sm ${
                message.includes("thành công") || message.includes("phê duyệt")
                  ? "bg-green-100 text-green-900 dark:bg-green-900/80 dark:text-green-100"
                  : "bg-red-100 text-red-900 dark:bg-red-900/80 dark:text-red-100"
              }`}
            >
              {message}
            </motion.div>
          )}

          <form onSubmit={handleUpload} className="space-y-5 sm:space-y-6">
            <div>
              <input
                type="text"
                placeholder="Tiêu đề"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isLoading}
                className={`w-full p-3 sm:p-4 rounded-xl bg-gray-100/70 dark:bg-zinc-700/70 text-gray-800 dark:text-white border border-gray-300/50 dark:border-zinc-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500 dark:placeholder-zinc-400 transition-all duration-300 text-sm sm:text-base ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              />
            </div>

            <div>
              <textarea
                placeholder="Mô tả"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={isLoading}
                rows={4}
                className={`w-full p-3 sm:p-4 rounded-xl bg-gray-100/70 dark:bg-zinc-700/70 text-gray-800 dark:text-white border border-gray-300/50 dark:border-zinc-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500 dark:placeholder-zinc-400 transition-all duration-300 text-sm sm:text-base ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              />
            </div>

            <div
              className={`relative p-5 sm:p-6 rounded-xl bg-gray-100/50 dark:bg-zinc-700/50 border-2 border-dashed border-gray-300/50 dark:border-zinc-600/50 transition-all duration-300 ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDropFile}
            >
              <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                <FaFilePdf className="text-indigo-500 text-xl sm:text-2xl" />
                <label className="text-gray-700 dark:text-zinc-300 font-medium text-sm sm:text-base">
                  {file ? file.name : "Kéo và thả hoặc chọn file PDF, Word"}
                </label>
              </div>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                required
                accept=".pdf,.doc,.docx"
                disabled={isLoading}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {file && (
                <button
                  type="button"
                  onClick={handleClearFile}
                  disabled={isLoading}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <FaTimes className="w-4 sm:w-5 h-4 sm:h-5" />
                </button>
              )}
            </div>

            <div
              className={`relative p-5 sm:p-6 rounded-xl bg-gray-100/50 dark:bg-zinc-700/50 border-2 border-dashed border-gray-300/50 dark:border-zinc-600/50 transition-all duration-300 ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDropThumbnail}
            >
              <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                <FaImage className="text-purple-500 text-xl sm:text-2xl" />
                <label className="text-gray-700 dark:text-zinc-300 font-medium text-sm sm:text-base">
                  {thumbnail ? thumbnail.name : "Kéo và thả hoặc chọn ảnh JPEG, PNG"}
                </label>
              </div>
              <input
                type="file"
                onChange={(e) => setThumbnail(e.target.files[0])}
                accept="image/jpeg,image/png"
                disabled={isLoading}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {thumbnail && (
                <button
                  type="button"
                  onClick={handleClearThumbnail}
                  disabled={isLoading}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <FaTimes className="w-4 sm:w-5 h-4 sm:h-5" />
                </button>
              )}
            </div>

            <div className="lg:hidden mt-4 sm:mt-6">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={(e) => {
                  e.preventDefault();
                  setIsNotesOpen(!isNotesOpen);}}
                className="w-full flex items-center justify-between p-3 sm:p-4 bg-white/95 dark:bg-zinc-800/95 rounded-xl shadow-md text-gray-900 dark:text-white font-semibold text-sm sm:text-base"
              >
                <span className="flex items-center gap-2">
                  <FaInfoCircle className="text-indigo-500" /> Lưu ý và Quy trình tính điểm
                </span>
                {isNotesOpen ? (
                  <FaChevronUp className="text-gray-500" />
                ) : (
                  <FaChevronDown className="text-gray-500" />
                )}
              </motion.button>
              <AnimatePresence>
                {isNotesOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="overflow-hidden mt-2 p-4 sm:p-6 bg-white/95 dark:bg-zinc-800/95 rounded-xl shadow-md"
                  >
                    <div className="space-y-4 text-gray-700 dark:text-zinc-300 text-sm sm:text-base">
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-zinc-200">Quy trình tính điểm:</h4>
                        <ul className="list-disc pl-5 space-y-2">
                          <li>Tài liệu sau khi tải lên sẽ được admin xem xét và phê duyệt.</li>
                          <li>Mỗi tài liệu được phê duyệt sẽ nhận <span className="font-bold">3000 điểm</span>.</li>
                          <li>Điểm sẽ được cộng vào tài khoản của bạn sau khi tài liệu được phê duyệt.</li>
                          <li>Điểm có thể được sử dụng để mua các gói thành viên (1 điểm = 1 VND).</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-zinc-200">Lưu ý:</h4>
                        <ul className="list-disc pl-5 space-y-2">
                          <li>
                            Chỉ tải lên tài liệu ở định dạng PDF hoặc Word, dung lượng tối đa{" "}
                            <span className="font-bold">10MB</span>.
                          </li>
                          <li>Ảnh bìa (nếu có) phải là JPEG hoặc PNG.</li>
                          <li>Tài liệu cần có tiêu đề và mô tả rõ ràng để dễ dàng được phê duyệt.</li>
                          <li>Tài liệu vi phạm bản quyền hoặc không phù hợp sẽ bị từ chối.</li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 4px 14px rgba(0, 0, 0, 0.2)" }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={isLoading}
              className={`w-full bg-indigo-600 text-white py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all duration-300 shadow-md ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              Tải lên
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 4px 14px rgba(0, 0, 0, 0.2)" }}
              whileTap={{ scale: 0.97 }}
              onClick={handleBackClick}
              disabled={isLoading}
              className={`mt-4 sm:mt-6 w-full bg-gray-600 text-white py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base hover:bg-gray-700 dark:bg-zinc-600 dark:hover:bg-zinc-700 transition-all duration-300 shadow-md ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              Quay lại danh sách tài liệu
            </motion.button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="hidden lg:block w-full p-6 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/30 dark:border-zinc-700/30"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaInfoCircle className="text-indigo-500" /> Lưu ý và Quy trình tính điểm
          </h3>
          <div className="space-y-4 text-gray-700 dark:text-zinc-300">
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-zinc-200">Quy trình tính điểm:</h4>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Tài liệu sau khi tải lên sẽ được admin xem xét và phê duyệt.</li>
                <li>Mỗi tài liệu được phê duyệt sẽ nhận <span className="font-bold">3000 điểm</span>.</li>
                <li>Điểm sẽ được cộng vào tài khoản của bạn sau khi tài liệu được phê duyệt.</li>
                <li>Điểm có thể được sử dụng để mua các gói thành viên (1 điểm = 1 VND).</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-zinc-200">Lưu ý:</h4>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Chỉ tải lên tài liệu ở định dạng PDF hoặc Word, dung lượng tối đa <span className="font-bold">10MB</span>.</li>
                <li>Ảnh bìa (nếu có) phải là JPEG hoặc PNG.</li>
                <li>Tài liệu cần có tiêu đề và mô tả rõ ràng để dễ dàng được phê duyệt.</li>
                <li>Tài liệu vi phạm bản quyền hoặc không phù hợp sẽ bị từ chối.</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UploadDocument;