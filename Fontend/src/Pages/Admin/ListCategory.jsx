import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCategory, createCategory, updateCategory, deleteCategory } from "../../redux/apiCategory";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

const ListCategory = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [message, setMessage] = useState("");

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login.currentUser);
  const accessToken = user?.accessToken;
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
      const newCategory = { name: newCategoryName };
      const res = await createCategory(dispatch, newCategory, accessToken, axiosJWT);
      setCategories((prev) => [...prev, res]);
      setNewCategoryName("");
      setMessage("Danh mục đã được tạo thành công!");
    } catch (err) {
      setMessage("Không thể tạo danh mục.");
      console.error(err);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name) return;

    try {
      const res = await updateCategory(editingCategory._id, { name: editingCategory.name }, accessToken, dispatch, axiosJWT);
      setCategories((prev) =>
        prev.map((category) => (category._id === res._id ? res : category))
      );
      setEditingCategory(null);
      setMessage("Danh mục đã được cập nhật thành công!");
    } catch (err) {
      setMessage("Không thể cập nhật danh mục.");
      console.error(err);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteCategory(categoryId, accessToken, dispatch, axiosJWT);
      setCategories((prev) => prev.filter((category) => category._id !== categoryId));
      setMessage("Danh mục đã được xóa thành công!");
    } catch (err) {
      setMessage("Không thể xóa danh mục.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-3xl bg-gray-900 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-800 transform transition-all hover:shadow-[0_0_25px_rgba(0,255,255,0.15)]">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-cyan-400 mb-8 sm:mb-12 tracking-tight drop-shadow-lg">
          Danh sách danh mục
        </h2>

        {message && (
          <div
            className={`flex items-center gap-2 w-full text-center text-sm sm:text-base mb-6 sm:mb-8 px-4 sm:px-6 py-3 rounded-lg shadow-xl ${
              message.includes("thành công") ? "bg-teal-500 text-white" : "bg-red-500 text-white"
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
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6 sm:mb-8 shadow-xl text-center text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Create Category */}
        <div className="mb-8 sm:mb-10">
          <div className="relative mb-4">
            <TagIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nhập tên danh mục mới"
              className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500 transition-all duration-200 hover:bg-gray-700/80 text-sm sm:text-base"
            />
          </div>
          <button
            onClick={handleCreateCategory}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-2 sm:py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base"
          >
            <TagIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            Thêm danh mục
          </button>
        </div>

        {/* Category List */}
        <ul className="space-y-3 sm:space-y-4">
          {Array.isArray(categories) && categories.length > 0 ? (
            categories.map((category) => (
              <li
                key={category._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-gray-800/90 p-4 rounded-lg border border-gray-700/50 transition-all duration-200 hover:bg-gray-750/90 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <TagIcon className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  {editingCategory?._id === category._id ? (
                    <input
                      type="text"
                      value={editingCategory.name}
                      onChange={(e) =>
                        setEditingCategory({ ...editingCategory, name: e.target.value })
                      }
                      className="w-full sm:w-auto pl-4 pr-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200 text-sm sm:text-base"
                    />
                  ) : (
                    <span className="text-gray-100 text-sm sm:text-base">{category.name}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {editingCategory?._id === category._id ? (
                    <button
                      onClick={handleUpdateCategory}
                      className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 text-sm sm:text-base"
                    >
                      Cập nhật
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingCategory(category)}
                        className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 text-sm sm:text-base"
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 text-sm sm:text-base"
                      >
                        Xóa
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))
          ) : (
            <li className="text-center text-gray-400 p-4 bg-gray-800/90 rounded-lg border border-gray-700/50 text-sm sm:text-base">
              Không có danh mục nào.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ListCategory;