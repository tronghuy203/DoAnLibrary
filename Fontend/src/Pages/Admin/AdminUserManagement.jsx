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
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 7;

  // Tính toán dữ liệu hiển thị
  const totalRecords = userList?.length || 0;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentUsers = userList?.slice(indexOfFirstRecord, indexOfLastRecord);

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
      getAllUsers(user?.accessToken, dispatch, axiosJWT);
      setFormData({ username: "", email: "", admin: false });
      setEditUserId(null);
    }
  };

  const handleEdit = (user) => {
    setFormData({ username: user.username, email: user.email, admin: user.admin });
    setEditUserId(user._id);
  };

  // Hàm chuyển trang
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Tạo danh sách số trang
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-cyan-400 mb-10 tracking-wide drop-shadow-md animate-fade-in-up">
          Quản Lý Người Dùng
        </h2>

        {editUserId && (
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md mx-auto bg-gray-800 p-6 rounded-xl shadow-md mb-12 border border-gray-700/50 animate-slide-in"
          >
            <div className="mb-5">
              <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="username">
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
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200 hover:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="email">
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
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200 hover:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="mb-5 flex items-center gap-3">
              <label className="flex items-center text-gray-300 text-sm font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.admin}
                  onChange={(e) => setFormData({ ...formData, admin: e.target.checked })}
                  className="mr-2 h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-gray-600 rounded cursor-pointer"
                />
                Vai trò Admin
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 rounded-lg transition-all duration-200 hover:shadow-md"
            >
              Cập nhật
            </button>
          </form>
        )}

        {userList?.length > 0 ? (
          <>
            <div className="w-full bg-gray-800 rounded-xl shadow-md border border-gray-700/50 overflow-hidden">
              <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_1.5fr_1fr_1fr] bg-gray-700 text-gray-200 font-semibold p-4">
                <div className="text-base">ID</div>
                <div className="text-base">Tên</div>
                <div className="text-base">Email</div>
                <div className="text-base">Vai trò</div>
                <div className="text-base">Hành động</div>
              </div>

              <div className="divide-y divide-gray-700">
                {currentUsers.map((u) => (
                  <div
                    key={u._id}
                    className="flex flex-col sm:grid sm:grid-cols-[1fr_1fr_1.5fr_1fr_1fr] p-4 hover:bg-gray-750 hover:-translate-y-1 transition-all duration-300 animate-slide-in"
                  >
                    <div className="py-2 text-gray-200 flex items-center">
                      <span className="sm:hidden font-semibold text-cyan-400 mr-2">ID:</span>
                      <span className="text-base break-all">{u._id.slice(-6)}</span>
                    </div>
                    <div className="py-2 text-gray-200 flex items-center">
                      <span className="sm:hidden font-semibold text-cyan-400 mr-2">Tên:</span>
                      <span className="text-base">{u.username}</span>
                    </div>
                    <div className="py-2 text-gray-200 flex items-center">
                      <span className="sm:hidden font-semibold text-cyan-400 mr-2">Email:</span>
                      <span className="text-base break-words">{u.email}</span>
                    </div>
                    <div className="py-2 text-gray-200 flex items-center">
                      <span className="sm:hidden font-semibold text-cyan-400 mr-2">Vai trò:</span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 ${
                          u.admin ? "bg-cyan-500 text-white" : "bg-gray-500 text-gray-200"
                        }`}
                      >
                        {u.admin ? "Admin" : "User"}
                      </span>
                    </div>
                    <div className="py-2 flex items-center gap-2">
                      {!u.admin && (
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-md transition-all duration-200 hover:shadow-md flex items-center gap-1 text-sm"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Xóa
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(u)}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-1 px-3 rounded-md transition-all duration-200 hover:shadow-md flex items-center gap-1 text-sm"
                      >
                        <PencilIcon className="w-4 h-4" />
                        Sửa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-2 sm:gap-4">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base font-semibold transition-all duration-200 ${
                    currentPage === 1
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-cyan-500 hover:bg-cyan-600 text-white hover:shadow-md"
                  }`}
                >
                  Trang trước
                </button>
                <div className="flex gap-1 sm:gap-2">
                  {pageNumbers.map((number) => (
                    <button
                      key={number}
                      onClick={() => goToPage(number)}
                      className={`px-2 py-1 sm:px-3 sm:py-2 rounded-md text-sm sm:text-base font-semibold transition-all duration-200 ${
                        currentPage === number
                          ? "bg-cyan-400 text-white"
                          : "bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white"
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base font-semibold transition-all duration-200 ${
                    currentPage === totalPages
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-cyan-500 hover:bg-cyan-600 text-white hover:shadow-md"
                  }`}
                >
                  Trang sau
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-400 py-10 animate-slide-in text-lg sm:text-xl">
            Không có người dùng nào
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement;