// CreateCategory.jsx
import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createCategory } from "../../redux/apiCategory";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { CheckCircleIcon, ExclamationCircleIcon, TagIcon } from "@heroicons/react/24/outline";

const CreateCategory = () => {
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");

    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.login.currentUser);
    const accessToken = user?.accessToken;
    const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(""); // Reset message trước khi thực hiện
        try {
            if (!accessToken) {
                setMessage("Bạn cần đăng nhập để tạo danh mục.");
                return;
            }

            // Truyền dispatch vào createCategory
            await createCategory(dispatch, { name }, accessToken, axiosJWT);
            setMessage("Danh mục đã được tạo thành công!");
            setName("");
        } catch (err) {
            setMessage("Có lỗi xảy ra khi tạo danh mục: " + (err.response?.data?.message || err.message));
            console.error(err);
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-12 px-4 text-gray-100">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6 text-center">Tạo danh mục mới</h2>

            {message && (
                <div
                    className={`flex items-center gap-2 mb-6 px-4 py-3 rounded-md ${
                        message.includes("thành công") ? "bg-teal-500" : "bg-red-500"
                    }`}
                >
                    {message.includes("thành công") ? (
                        <CheckCircleIcon className="w-5 h-5" />
                    ): (
                        <ExclamationCircleIcon className="w-5 h-5" />
                    )}
                    <p>{message}</p>
                </div>
            )}

            <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
                <label htmlFor="name" className="block text-sm mb-2 font-medium">
                    Tên danh mục
                </label>
                <div className="relative mb-4">
                    <TagIcon className="absolute left-3 top-3 w-5 h-5 text-cyan-400" />
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Nhập tên danh mục"
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
                <button
                    onClick={handleSubmit}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 rounded-md transition duration-200"
                >
                    Tạo danh mục
                </button>
            </div>
        </div>
    );
};

export default CreateCategory;