import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCategory, createCategory, updateCategory, deleteCategory } from "../../redux/apiCategory";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  TagIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import LoadingSpinner from "./LoadingSpinner";

const ListCategory = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login.currentUser);
  const accessToken = user?.accessToken;
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (!accessToken) {
          setError("Bạn cần đăng nhập để xem danh sách danh mục.");
          return;
        }
        const res = await getCategory(accessToken, dispatch, axiosJWT);
        if (Array.isArray(res)) {
          setCategories(res);
        } else {
          console.error("Dữ liệu không hợp lệ:", res);
          setError("Dữ liệu danh mục không hợp lệ.");
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh sách danh mục:", err);
        setError("Không thể tải danh sách danh mục.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [accessToken, axiosJWT, dispatch]);

  const handleCreateCategory = async () => {
    if (!newCategoryName) {
      setError("Tên danh mục không được để trống.");
      return;
    }

    try {
      setIsLoading(true);
      const newCategory = { name: newCategoryName };
      const res = await createCategory(dispatch, newCategory, accessToken, axiosJWT);
      setCategories((prev) => [...prev, res]);
      setNewCategoryName("");
      setMessage("Danh mục đã được tạo thành công!");
    } catch (err) {
      setMessage("Không thể tạo danh mục.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name) return;

    try {
      setIsLoading(true);
      const res = await updateCategory(editingCategory._id, { name: editingCategory.name }, accessToken, dispatch, axiosJWT);
      setCategories((prev) =>
        prev.map((category) => (category._id === res._id ? res : category))
      );
      setEditingCategory(null);
      setMessage("Danh mục đã được cập nhật thành công!");
    } catch (err) {
      setMessage("Không thể cập nhật danh mục.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      setIsLoading(true);
      await deleteCategory(categoryId, accessToken, dispatch, axiosJWT);
      setCategories((prev) => prev.filter((category) => category._id !== categoryId));
      setMessage("Danh mục đã được xóa thành công!");
    } catch (err) {
      setMessage("Không thể xóa danh mục.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex items-center justify-center py-8 px-4 transition-all duration-500 ease-in-out relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/30 via-blue-100/20 to-purple-100/30 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-purple-900/20 animate-gradient-slow"></div>
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-cyan-300/20 dark:bg-cyan-600/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-[-15%] right-[-5%] w-96 h-96 bg-blue-300/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-[60%] left-[70%] w-48 h-48 bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute inset-0">
          <div className="absolute w-2 h-2 bg-cyan-400/50 dark:bg-cyan-500/30 rounded-full top-[20%] left-[15%] animate-particle"></div>
          <div className="absolute w-2 h-2 bg-blue-400/50 dark:bg-blue-500/30 rounded-full top-[50%] left-[80%] animate-particle-slow"></div>
          <div className="absolute w-2 h-2 bg-purple-400/50 dark:bg-purple-500/30 rounded-full top-[70%] left-[30%] animate-particle"></div>
          <div className="absolute w-2 h-2 bg-cyan-400/50 dark:bg-cyan-500/30 rounded-full top-[10%] left-[60%] animate-particle-slow"></div>
        </div>
        <svg className="absolute bottom-0 left-0 w-full h-32 text-cyan-200/20 dark:text-cyan-800/20" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,186.7C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      <LoadingSpinner isLoading={isLoading} />
      <div className="w-full max-w-4xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] relative z-10">

        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-cyan-600 dark:text-cyan-400 mb-8 sm:mb-12 tracking-tight drop-shadow-lg animate-slide-up">
          Quản lý danh mục
        </h2>

        {message && (
          <div
            className={`flex items-center gap-2 w-full text-center text-sm sm:text-base mb-6 sm:mb-8 px-4 sm:px-6 py-3 rounded-xl shadow-xl transition-all duration-300 ease-in-out animate-fade-in ${
              message.includes("thành công")
                ? "bg-teal-500/90 dark:bg-teal-400/90 text-white"
                : "bg-red-500/90 dark:bg-red-400/90 text-white"
            }`}
          >
            {message.includes("thành công") ? (
              <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <ExclamationCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
            <p>{message}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/90 dark:bg-red-400/90 text-white p-4 rounded-xl mb-6 sm:mb-8 shadow-xl text-center text-sm sm:text-base transition-all duration-300 ease-in-out animate-fade-in">
            {error}
          </div>
        )}

        <div className="mb-6 sm:mb-10 animate-slide-up">
          <div className="relative mb-2 sm:mb-4">
            <TagIcon className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 dark:text-cyan-400" />
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nhập tên danh mục mới"
              className="w-full pl-8 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 bg-gray-50/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 border border-gray-300/50 dark:border-gray-600/50 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 hover:bg-gray-100/80 dark:hover:bg-gray-600/80 text-xs sm:text-base backdrop-blur-sm"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleCreateCategory}
            className={`w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-cyan-500 dark:from-cyan-400 to-blue-600 dark:to-blue-500 text-white font-semibold py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 shadow-md sm:shadow-lg transform ${
              isLoading ? "opacity-75 cursor-not-allowed" : "hover:from-cyan-600 dark:hover:from-cyan-500 hover:to-blue-700 dark:hover:to-blue-600 hover:shadow-lg sm:hover:shadow-xl hover:-translate-y-0.5 sm:hover:-translate-y-1"
            }`}
            disabled={isLoading}
          >
            <TagIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            Thêm danh mục
          </button>
        </div>

        <ul className="space-y-4 animate-slide-up">
          {Array.isArray(categories) && categories.length > 0 ? (
            categories.map((category) => (
              <li
                key={category._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/80 dark:bg-gray-800/80 p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 hover:shadow-lg transform hover:scale-[1.01] backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <TagIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                  {editingCategory?._id === category._id ? (
                    <input
                      type="text"
                      value={editingCategory.name}
                      onChange={(e) =>
                        setEditingCategory({ ...editingCategory, name: e.target.value })
                      }
                      className="w-full sm:w-64 pl-4 pr-4 py-2 bg-gray-100/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 transition-all duration-300 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 text-sm sm:text-base backdrop-blur-sm"
                      disabled={isLoading}
                    />
                  ) : (
                    <span className="text-gray-900 dark:text-gray-100 font-medium text-sm sm:text-base">{category.name}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {editingCategory?._id === category._id ? (
                    <button
                      onClick={handleUpdateCategory}
                      className={`w-full sm:w-auto flex items-center justify-center gap-1 bg-green-500 dark:bg-green-400 text-white font-medium py-1.5 px-3 rounded-full transition-all duration-200 shadow-sm transform ${
                        isLoading ? "opacity-75 cursor-not-allowed" : "hover:bg-green-600 dark:hover:bg-green-500 hover:shadow-md hover:-translate-y-0.5"
                      }`}
                      disabled={isLoading}
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      Cập nhật
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingCategory(category)}
                        className={`w-32 mx-auto sm:w-auto flex items-center justify-center gap-1 bg-yellow-500 dark:bg-yellow-400 text-white font-medium py-1.5 px-3 rounded-full transition-all duration-200 shadow-sm transform ${
                          isLoading ? "opacity-75 cursor-not-allowed" : "hover:bg-yellow-600 dark:hover:bg-yellow-500 hover:shadow-md hover:-translate-y-0.5"
                        }`}
                        disabled={isLoading}
                      >
                        <PencilIcon className="w-4 h-4" />
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className={`w-32 mx-auto sm:w-auto flex items-center justify-center gap-1 bg-red-500 dark:bg-red-400 text-white font-medium py-1.5 px-3 rounded-full transition-all duration-200 shadow-sm transform ${
                          isLoading ? "opacity-75 cursor-not-allowed" : "hover:bg-red-600 dark:hover:bg-red-500 hover:shadow-md hover:-translate-y-0.5"
                        }`}
                        disabled={isLoading}
                      >
                        <TrashIcon className="w-4 h-4" />
                        Xóa
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))
          ) : (
            <li className="text-center text-gray-500 dark:text-gray-400 p-4 bg-gray-50/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-700/50 text-sm sm:text-base transition-all duration-300 ease-in-out animate-fade-in backdrop-blur-sm">
              Không có danh mục nào.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ListCategory;