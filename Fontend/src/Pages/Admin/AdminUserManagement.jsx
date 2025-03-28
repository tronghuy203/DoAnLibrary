import React, { useState, useEffect, useMemo } from "react";
import { getAllUsers, deleteUser, updateUser } from "../../redux/apiRequest";
import { useDispatch, useSelector } from "react-redux";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import { UserIcon, EnvelopeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const AdminUserManagement = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const userList = useSelector((state) => state.users.users?.allUsers);
  const dispatch = useDispatch();
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  const [formData, setFormData] = useState({ username: "", email: "", admin: false });
  const [editUserId, setEditUserId] = useState(null);

  useEffect(() => {
    if (user?.accessToken) {
      getAllUsers(user?.accessToken, dispatch, axiosJWT);
    }
  }, [user, dispatch, axiosJWT]);

  const handleDelete = (id) => {
    if (user?.admin) {
      dispatch(deleteUser(id, user.accessToken, null, axiosJWT));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editUserId) {
        await updateUser(editUserId, formData, user.accessToken, dispatch, axiosJWT);
        
        // ✅ Gọi lại API lấy danh sách mới sau khi cập nhật
        getAllUsers(user?.accessToken, dispatch, axiosJWT); 
        
        setFormData({ username: "", email: "", admin: false });
        setEditUserId(null);
    }
};


  const handleEdit = (user) => {
    setFormData({ username: user.username, email: user.email, admin: user.admin });
    setEditUserId(user._id);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center py-8 px-4 lg:px-8">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-blue-400 mb-8 animate-fade-in">
        Quản lý người dùng
      </h2>

      {editUserId && (
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg mb-8 transform transition-all duration-300 animate-fade-in"
        >
          <div className="mb-4 relative">
            <label
              className="block text-gray-300 text-sm font-semibold mb-2"
              htmlFor="username"
            >
              Tên người dùng
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="username"
                placeholder="Tên người dùng"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="w-full pl-10 pr-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>
          </div>

          <div className="mb-4 relative">
            <label
              className="block text-gray-300 text-sm font-semibold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full pl-10 pr-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>
          </div>

          <div className="mb-6 flex items-center">
            <label className="flex items-center text-gray-300 text-sm font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={formData.admin}
                onChange={(e) => setFormData({ ...formData, admin: e.target.checked })}
                className="mr-2 h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-600 rounded cursor-pointer"
              />
              <span className="relative inline-block w-10 h-5 bg-gray-600 rounded-full transition duration-200">
                <span
                  className={`absolute left-0 top-0 w-5 h-5 bg-white rounded-full transform transition duration-200 ${
                    formData.admin ? "translate-x-5 bg-blue-500" : "translate-x-0"
                  }`}
                />
              </span>
              <span className="ml-2">Admin</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            Cập nhật
          </button>
        </form>
      )}

      <div className="w-full max-w-6xl overflow-x-auto animate-fade-in">
        <table className="w-full bg-gray-800 rounded-xl shadow-lg">
          <thead>
            <tr className="bg-gradient-to-r from-gray-700 to-gray-600 text-gray-300 text-left text-sm sm:text-base">
              <th className="py-4 px-6 font-semibold rounded-tl-xl">ID</th>
              <th className="py-4 px-6 font-semibold">Tên người dùng</th>
              <th className="py-4 px-6 font-semibold">Email</th>
              <th className="py-4 px-6 font-semibold">Vai trò</th>
              <th className="py-4 px-6 font-semibold rounded-tr-xl">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {userList?.length > 0 ? (
              userList.map((u) => (
                <tr
                  key={u._id}
                  className="border-t border-gray-700 hover:bg-gray-700 transition duration-200"
                >
                  <td className="py-4 px-6 text-gray-200 text-sm sm:text-base">{u._id}</td>
                  <td className="py-4 px-6 text-gray-200 text-sm sm:text-base">{u.username}</td>
                  <td className="py-4 px-6 text-gray-200 text-sm sm:text-base">{u.email}</td>
                  <td className="py-4 px-6 text-gray-200 text-sm sm:text-base">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        u.admin ? "bg-blue-600 text-white" : "bg-gray-600 text-gray-200"
                      }`}
                    >
                      {u.admin ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="py-4 px-6 flex gap-2">
                    {!u.admin && (
                      <button
                        onClick={() => handleDelete(u._id)}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-1 px-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Xóa
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(u)}
                      className="flex items-center gap-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold py-1 px-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Chỉnh sửa
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-4 px-6 text-center text-gray-400">
                  Không có người dùng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUserManagement;
