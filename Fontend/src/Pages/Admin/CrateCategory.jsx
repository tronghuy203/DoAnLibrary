import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createCategory } from "../../redux/apiCategory";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

const CreateCategory = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login.currentUser);
  const accessToken = user?.accessToken;
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (!accessToken) {
        setMessage("Bạn cần đăng nhập để tạo danh mục.");
        return;
      }

      await createCategory(dispatch, { name }, accessToken, axiosJWT);
      setMessage("Danh mục đã được tạo thành công!");
      setName("");
    } catch (err) {
      setMessage("Có lỗi xảy ra khi tạo danh mục: " + (err.response?.data?.message || err.message));
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center py-12 px-4 sm:px-8 lg:px-12">
      <div className="w-full max-w-md bg-gradient-to-b from-gray-900 to-gray-850 p-8 rounded-2xl shadow-2xl border border-gray-700/50 transform transition-all hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] animate-fade-in">
        <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 mb-12 tracking-wide drop-shadow-lg">
          Tạo danh mục mới
        </h2>

        {message && (
          <div
            className={`flex items-center gap-3 w-full text-center text-base mb-10 px-6 py-4 rounded-lg shadow-lg animate-fade-in-fast ${
              message.includes("thành công") ? "bg-teal-600/95 text-white" : "bg-red-600/95 text-white"
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

        <div className="mb-10">
          <label className="block text-gray-100 text-sm font-medium mb-3 tracking-wide" htmlFor="name">
            Tên danh mục
          </label>
          <div className="relative">
            <TagIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 bg-gray-800/90 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent placeholder-gray-400 transition-all duration-300 hover:bg-gray-750/90 hover:border-cyan-500/50"
              placeholder="Nhập tên danh mục"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
        >
          <TagIcon className="w-5 h-5" />
          Tạo danh mục
        </button>
      </div>
    </div>
  );
};

const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInFast {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }
  .animate-fade-in-fast {
    animation: fadeInFast 0.3s ease-out forwards;
  }
`;
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default CreateCategory;