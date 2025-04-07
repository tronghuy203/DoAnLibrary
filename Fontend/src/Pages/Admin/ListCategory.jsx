import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCategory, createCategory, updateCategory, deleteCategory } from "../../redux/apiCategory";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { CheckCircleIcon, ExclamationCircleIcon, TagIcon } from "@heroicons/react/24/outline";

const ListCategory = () => {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState(""); // State for new category
    const [editingCategory, setEditingCategory] = useState(null); // State to track which category is being edited
    const [message, setMessage] = useState(""); // State for status messages

    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.login.currentUser);
    const accessToken = user?.accessToken;
    const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

    // Fetch categories on component mount
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

    // Create a new category
    const handleCreateCategory = async () => {
        if (!newCategoryName) {
            setError("Tên danh mục không được để trống.");
            return;
        }

        try {
            const newCategory = { name: newCategoryName };
            const res = await createCategory(dispatch, newCategory, accessToken, axiosJWT);
            setCategories((prev) => [...prev, res]);
            setNewCategoryName(""); // Clear input after creating
            setMessage("Danh mục đã được tạo thành công!");
        } catch (err) {
            setMessage("Không thể tạo danh mục.");
            console.error(err);
        }
    };

    // Update an existing category
    const handleUpdateCategory = async () => {
        if (!editingCategory || !editingCategory.name) return;

        try {
            const res = await updateCategory(editingCategory._id, { name: editingCategory.name }, accessToken, dispatch, axiosJWT);
            setCategories((prev) =>
                prev.map((category) =>
                    category._id === res._id ? res : category
                )
            );
            setEditingCategory(null); // Clear editing state after update
            setMessage("Danh mục đã được cập nhật thành công!");
        } catch (err) {
            setMessage("Không thể cập nhật danh mục.");
            console.error(err);
        }
    };

    // Delete a category
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
        <div className="max-w-3xl mx-auto mt-12 px-4 text-gray-100">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6 text-center">Danh sách danh mục</h2>

            {message && (
                <div
                    className={`flex items-center gap-2 mb-6 px-4 py-3 rounded-md ${
                        message.includes("thành công") ? "bg-teal-500" : "bg-red-500"
                    }`}
                >
                    {message.includes("thành công") ? (
                        <CheckCircleIcon className="w-5 h-5" />
                    ) : (
                        <ExclamationCircleIcon className="w-5 h-5" />
                    )}
                    <p>{message}</p>
                </div>
            )}

            {error && (
                <div className="bg-red-500 text-white p-4 rounded-md mb-6">
                    {error}
                </div>
            )}

            {/* Create Category */}
            <div className="mb-6">
                <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nhập tên danh mục mới"
                    className="p-2 rounded-md text-black"
                />
                <button
                    onClick={handleCreateCategory}
                    className="ml-2 bg-cyan-400 text-white py-2 px-4 rounded-md"
                >
                    Thêm danh mục
                </button>
            </div>

            {/* Category List */}
            <ul className="bg-gray-900 rounded-lg shadow-lg p-6 space-y-3">
                {Array.isArray(categories) && categories.length > 0 ? (
                    categories.map((category) => (
                        <li
                            key={category._id}
                            className="flex items-center gap-3 text-lg text-gray-100 border-b border-gray-700 pb-2"
                        >
                            <TagIcon className="w-5 h-5 text-cyan-400" />
                            {editingCategory?._id === category._id ? (
                                <>
                                    <input
                                        type="text"
                                        value={editingCategory.name}
                                        onChange={(e) =>
                                            setEditingCategory({
                                                ...editingCategory,
                                                name: e.target.value,
                                            })
                                        }
                                        className="p-2 rounded-md text-black"
                                    />
                                    <button
                                        onClick={handleUpdateCategory}
                                        className="ml-2 bg-green-400 text-white py-2 px-4 rounded-md"
                                    >
                                        Cập nhật
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span>{category.name}</span>
                                    <button
                                        onClick={() => setEditingCategory(category)}
                                        className="ml-2 bg-yellow-400 text-white py-1 px-3 rounded-md"
                                    >
                                        Chỉnh sửa
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCategory(category._id)}
                                        className="ml-2 bg-red-400 text-white py-1 px-3 rounded-md"
                                    >
                                        Xóa
                                    </button>
                                </>
                            )}
                        </li>
                    ))
                ) : (
                    <li className="text-gray-400">Không có danh mục nào.</li>
                )}
            </ul>
        </div>
    );
};

export default ListCategory;
