import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { uploadDocument } from "../../redux/apiDocument";
import { BookOpenIcon, DocumentTextIcon, PaperClipIcon, CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

const CreateDocument = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const dispatch = useDispatch();
  const axiosJWT = createAxios(user, dispatch, loginSuccess);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    file: null,
  });
  const [previewFileName, setPreviewFileName] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      const file = files[0];
      setFormData({ ...formData, file });
      setPreviewFileName(file ? file.name : null);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.accessToken) {
      setMessage("Bạn cần đăng nhập để tạo tài liệu!");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("file", formData.file);

    try {
      await uploadDocument(data, user?.accessToken, dispatch, axiosJWT);
      setMessage("Tạo tài liệu thành công!");
      setFormData({ title: "", description: "", file: null });
      setPreviewFileName(null);
    } catch (error) {
      console.error("Lỗi khi tạo tài liệu:", error);
      setMessage("Có lỗi xảy ra khi tạo tài liệu!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-gray-100 flex flex-col items-center py-12 px-4 sm:px-8 lg:px-12">
      <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-cyan-400 mb-12 tracking-tight drop-shadow-lg">
        Tạo tài liệu mới
      </h2>

      {message && (
        <div
          className={`flex items-center gap-2 w-full max-w-2xl text-center text-base mb-8 px-6 py-3 rounded-lg shadow-xl ${
            message.includes("thành công") ? "bg-teal-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {message.includes("thành công") ? (
            <CheckCircleIcon className="w-6 h-6" />
          ) : (
            <ExclamationCircleIcon className="w-6 h-6" />
          )}
          <p>{message}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="w-full max-w-2xl bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800 transform transition-all hover:shadow-[0_0_20px_rgba(0,255,255,0.1)]"
      >
        <div className="mb-6">
          <label className="block text-gray-200 text-sm font-medium mb-2" htmlFor="title">
            Tiêu đề
          </label>
          <div className="relative">
            <BookOpenIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500 transition-all duration-200"
              placeholder="Nhập tiêu đề tài liệu"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-200 text-sm font-medium mb-2" htmlFor="description">
            Mô tả
          </label>
          <div className="relative">
            <DocumentTextIcon className="absolute left-3 top-4 w-5 h-5 text-cyan-400" />
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-y placeholder-gray-500 transition-all duration-200"
              placeholder="Nhập mô tả tài liệu (không bắt buộc)"
              rows="4"
            />
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-gray-200 text-sm font-medium mb-2">Tài liệu</label>
          <div className="relative">
            <label
              htmlFor="file"
              className="group flex items-center justify-center w-full h-48 bg-gray-800 border-2 border-gray-700 rounded-xl cursor-pointer hover:bg-gray-700 hover:border-cyan-500 transition-all duration-300 shadow-md"
            >
              {previewFileName ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <PaperClipIcon className="w-12 h-12 mx-auto text-cyan-400 group-hover:text-cyan-300 transition-colors duration-200" />
                    <p className="mt-2 text-gray-300 group-hover:text-gray-200 transition-colors duration-200 truncate px-4">
                      {previewFileName}
                    </p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-cyan-400 font-medium bg-gray-900/70 px-3 py-1 rounded-full">Thay file</span>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <PaperClipIcon className="w-12 h-12 mx-auto text-cyan-400 group-hover:text-cyan-300 transition-colors duration-200" />
                  <p className="mt-2 text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                    Nhấp để chọn hoặc kéo file vào đây
                  </p>
                </div>
              )}
              <input
                type="file"
                id="file"
                name="file"
                onChange={handleChange}
                className="hidden"
                required
              />
            </label>
          </div>
          {formData.file && (
            <p className="mt-2 text-sm text-gray-400 truncate">Đã chọn: {formData.file.name}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <PaperClipIcon className="w-5 h-5" />
          Tạo tài liệu
        </button>
      </form>
    </div>
  );
};

export default CreateDocument;