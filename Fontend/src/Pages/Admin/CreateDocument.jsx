import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { uploadDocument } from "../../redux/apiDocument";
import { BookOpenIcon, DocumentTextIcon, PaperClipIcon, CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import LoadingSpinner from "./LoadingSpinner";

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
  const [isLoading, setIsLoading] = useState(false);

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
      setIsLoading(true);
      await uploadDocument(data, user?.accessToken, dispatch, axiosJWT);
      setMessage("Tạo tài liệu thành công!");
      setFormData({ title: "", description: "", file: null });
      setPreviewFileName(null);
    } catch (error) {
      console.error("Lỗi khi tạo tài liệu:", error);
      setMessage("Có lỗi xảy ra khi tạo tài liệu!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col items-center py-12 px-4 sm:px-8 lg:px-12 transition-all duration-500 ease-in-out relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/40 via-blue-200/30 to-purple-200/40 dark:from-cyan-800/30 dark:via-blue-800/30 dark:to-purple-800/30 animate-gradient-slow"></div>
        <div className="absolute top-[-15%] left-[-15%] w-80 h-80 bg-cyan-400/20 dark:bg-cyan-600/15 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-blue-400/20 dark:bg-blue-600/15 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-[50%] left-[70%] w-64 h-64 bg-purple-400/20 dark:bg-purple-600/15 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-[10%] right-[20%] w-56 h-56 bg-cyan-300/20 dark:bg-cyan-500/15 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute inset-0">
          <div className="absolute w-3 h-3 bg-cyan-500/50 dark:bg-cyan-400/40 rounded-full top-[15%] left-[10%] animate-particle"></div>
          <div className="absolute w-2 h-2 bg-blue-500/50 dark:bg-blue-400/40 rounded-full top-[45%] left-[75%] animate-particle-slow"></div>
          <div className="absolute w-3 h-3 bg-purple-500/50 dark:bg-purple-400/40 rounded-full top-[65%] left-[25%] animate-particle"></div>
          <div className="absolute w-2 h-2 bg-cyan-500/50 dark:bg-cyan-400/40 rounded-full top-[5%] left-[55%] animate-particle-slow"></div>
          <div className="absolute w-3 h-3 bg-blue-500/50 dark:bg-blue-400/40 rounded-full top-[30%] left-[85%] animate-particle"></div>
        </div>
        <svg className="absolute bottom-0 left-0 w-full h-48 text-cyan-300/30 dark:text-cyan-700/30" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,186.7C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      <LoadingSpinner isLoading={isLoading} />
      <div className="w-full max-w-2xl relative z-10">

        <div className="text-center mb-10 animate-slide-up">
          <DocumentTextIcon className="w-16 h-16 mx-auto text-cyan-600 dark:text-cyan-400 mb-3 animate-pulse" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-cyan-600 dark:text-cyan-400 tracking-tight drop-shadow-lg">
            Tạo Tài Liệu Mới
          </h2>
          <p className="mt-2 text-lg sm:text-xl text-gray-600 dark:text-gray-300">
            Tải lên và quản lý tài liệu của bạn một cách dễ dàng
          </p>
        </div>

        {message && (
          <div
            className={`flex items-center gap-3 w-full text-center text-base sm:text-lg mb-10 px-6 py-4 rounded-xl shadow-xl transition-all duration-300 animate-pulse ${
              message.includes("thành công")
                ? "bg-gradient-to-r from-teal-500 to-teal-600 dark:from-teal-400 dark:to-teal-500 text-white"
                : "bg-gradient-to-r from-red-500 to-red-600 dark:from-red-400 dark:to-red-500 text-white"
            }`}
          >
            {message.includes("thành công") ? (
              <CheckCircleIcon className="w-6 h-6 text-white" />
            ) : (
              <ExclamationCircleIcon className="w-6 h-6 text-white" />
            )}
            <p>{message}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.2)]"
        >
          <div className="mb-6 animate-slide-up">
            <label className="block text-gray-900 dark:text-gray-100 text-sm sm:text-base font-semibold mb-2" htmlFor="title">
              Tiêu đề
            </label>
            <div className="relative">
              <BookOpenIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                disabled={isLoading}
                className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 hover:bg-gradient-to-r hover:from-gray-100/80 hover:to-gray-50/80 dark:hover:from-gray-800/80 dark:hover:to-gray-700/80 ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
                placeholder="Nhập tiêu đề tài liệu"
              />
            </div>
          </div>

          <div className="mb-6 animate-slide-up">
            <label className="block text-gray-900 dark:text-gray-100 text-sm sm:text-base font-semibold mb-2" htmlFor="description">
              Mô tả
            </label>
            <div className="relative">
              <DocumentTextIcon className="absolute left-3 top-4 w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 resize-y placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 hover:bg-gradient-to-r hover:from-gray-100/80 hover:to-gray-50/80 dark:hover:from-gray-800/80 dark:hover:to-gray-700/80 ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
                placeholder="Nhập mô tả tài liệu (không bắt buộc)"
                rows="4"
              />
            </div>
          </div>

          <div className="mb-8 animate-slide-up">
            <label className="block text-gray-900 dark:text-gray-100 text-sm sm:text-base font-semibold mb-2">Tài liệu</label>
            <div className="relative">
              <label
                htmlFor="file"
                className={`group flex items-center justify-center w-full h-40 sm:h-48 bg-gray-100/80 dark:bg-gray-800/80 border-2 border-gray-300/50 dark:border-gray-600/50 rounded-xl cursor-pointer hover:bg-gradient-to-r hover:from-gray-200/80 hover:to-gray-100/80 dark:hover:from-gray-700/80 dark:hover:to-gray-600/80 hover:border-cyan-500 dark:hover:border-cyan-400 transition-all duration-300 shadow-md ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {previewFileName ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <PaperClipIcon className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-cyan-600 dark:text-cyan-400 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors duration-200" />
                      <p className="mt-2 text-base sm:text-lg text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors duration-200 truncate px-4">
                        {previewFileName}
                      </p>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-cyan-600 dark:text-cyan-400 font-semibold bg-gray-900/70 dark:bg-gray-900/80 px-4 py-2 rounded-full">Thay file</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <PaperClipIcon className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-cyan-600 dark:text-cyan-400 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors duration-200" />
                    <p className="mt-2 text-base sm:text-lg text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-200">
                      Nhấp để chọn hoặc kéo file vào đây
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  id="file"
                  name="file"
                  onChange={handleChange}
                  disabled={isLoading}
                  className="hidden"
                  required
                />
              </label>
            </div>
            {formData.file && (
              <p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400 truncate transition-all duration-300">
                Đã chọn: {formData.file.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-500 text-white font-semibold py-3 sm:py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 ${
              isLoading ? "opacity-75 cursor-not-allowed" : "hover:from-cyan-700 hover:to-blue-700 dark:hover(click)=>(handleDecreaseQuantity)from-cyan-600 dark:hover:to-blue-600"
            }`}
          >
            <PaperClipIcon className="w-6 h-6 text-white transform hover:scale-110 transition-transform duration-200" />
            Tạo tài liệu
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateDocument;