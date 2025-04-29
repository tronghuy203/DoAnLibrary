import React, { useState, useEffect, useMemo } from "react";
import { getAllUsers, deleteUser, updateUser } from "../../redux/apiRequest";
import { useDispatch, useSelector } from "react-redux";
import { createAxios } from "../../createInstance";
import { loginSuccess } from "../../redux/authSlice";
import {
  UserIcon,
  EnvelopeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

const AdminUserManagement = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const userList = useSelector((state) => state.users.users?.allUsers);
  const dispatch = useDispatch();
  const axiosJWT = useMemo(() => createAxios(user, dispatch, loginSuccess), [user, dispatch]);

  const [formData, setFormData] = useState({ username: "", email: "", admin: false });
  const [editUserId, setEditUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 7;

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

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8 transition-all duration-500 ease-in-out relative overflow-hidden">
      {/* Background Effects */}
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
        <svg
          className="absolute bottom-0 left-0 w-full h-48 text-cyan-300/30 dark:text-cyan-700/30"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,186.7C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-10 animate-slide-up">
          <UserIcon className="w-16 h-16 mx-auto text-cyan-600 dark:text-cyan-400 mb-3 animate-pulse" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-cyan-600 dark:text-cyan-400 tracking-tight drop-shadow-lg">
            Quản Lý Người Dùng
          </h2>
          <p className="mt-2 text-lg sm:text-xl text-gray-600 dark:text-gray-300">
            Quản lý tài khoản người dùng một cách dễ dàng
          </p>
        </div>

        {editUserId && (
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg mx-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 mb-12 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] animate-slide-up"
          >
            <div className="mb-5">
              <label
                className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2"
                htmlFor="username"
              >
                Tên người dùng
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                <input
                  type="text"
                  id="username"
                  placeholder="Nhập tên người dùng"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 hover:bg-gray-100/80 dark:hover:bg-gray-600/80"
                />
              </div>
            </div>

            <div className="mb-5">
              <label
                className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                <input
                  type="email"
                  id="email"
                  placeholder="Nhập email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 hover:bg-gray-100/80 dark:hover:bg-gray-600/80"
                />
              </div>
            </div>

            <div className="mb-5 flex items-center gap-3">
              <label className="flex items-center text-gray-700 dark:text-gray-300 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.admin}
                  onChange={(e) => setFormData({ ...formData, admin: e.target.checked })}
                  className="mr-2 h-4 w-4 text-cyan-500 dark:text-cyan-400 focus:ring-cyan-500 dark:focus:ring-cyan-400 border-gray-300/50 dark:border-gray-600/50 rounded cursor-pointer transition-all duration-200"
                />
                Vai trò Admin
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 dark:from-cyan-400 to-teal-500 dark:to-teal-400 hover:from-cyan-600 dark:hover:from-cyan-500 hover:to-teal-600 dark:hover:to-teal-500 text-white font-semibold py-2.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
            >
              Cập nhật
            </button>
          </form>
        )}

        {userList?.length > 0 ? (
          <>
            <div className="w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] animate-slide-up">
              <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_1.5fr_1fr_1fr] bg-gray-100/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-200 font-semibold p-4">
                <div className="text-base">ID</div>
                <div className="text-base">Tên</div>
                <div className="text-base">Email</div>
                <div className="text-base">Vai trò</div>
                <div className="text-base">Hành động</div>
              </div>

              <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {currentUsers.map((u) => (
                  <div
                    key={u._id}
                    className="flex flex-col sm:grid sm:grid-cols-[1fr_1fr_1.5fr_1fr_1fr] p-4 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 hover:scale-[1.02] transition-all duration-300 animate-slide-in"
                  >
                    <div className="py-2 text-gray-900 dark:text-gray-200 flex items-center">
                      <span className="sm:hidden font-semibold text-cyan-500 dark:text-cyan-400 mr-2">ID:</span>
                      <span className="text-sm sm:text-base break-all">{u._id.slice(-6)}</span>
                    </div>
                    <div className="py-2 text-gray-900 dark:text-gray-200 flex items-center">
                      <span className="sm:hidden font-semibold text-cyan-500 dark:text-cyan-400 mr-2">Tên:</span>
                      <span className="text-sm sm:text-base">{u.username}</span>
                    </div>
                    <div className="py-2 text-gray-900 dark:text-gray-200 flex items-center">
                      <span className="sm:hidden font-semibold text-cyan-500 dark:text-cyan-400 mr-2">Email:</span>
                      <span className="text-sm sm:text-base break-words">{u.email}</span>
                    </div>
                    <div className="py-2 text-gray-900 dark:text-gray-200 flex items-center">
                      <span className="sm:hidden font-semibold text-cyan-500 dark:text-cyan-400 mr-2">Vai trò:</span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-105 ${
                          u.admin
                            ? "bg-cyan-500 dark:bg-cyan-400 text-white"
                            : "bg-gray-500 dark:bg-gray-600 text-gray-200 dark:text-gray-300"
                        }`}
                      >
                        {u.admin ? "Admin" : "User"}
                      </span>
                    </div>
                    <div className="py-2 flex items-center gap-2">
                      {!u.admin && (
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="bg-red-500 dark:bg-red-400 hover:bg-red-600 dark:hover:bg-red-500 text-white font-medium py-1 px-3 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-105 flex items-center gap-1 text-xs sm:text-sm"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Xóa
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(u)}
                        className="bg-amber-500 dark:bg-amber-400 hover:bg-amber-600 dark:hover:bg-amber-500 text-white font-medium py-1 px-3 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-105 flex items-center gap-1 text-xs sm:text-sm"
                      >
                        <PencilIcon className="w-4 h-4" />
                        Sửa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-2 sm:gap-4">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105 ${
                    currentPage === 1
                      ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-cyan-500 dark:from-cyan-400 to-teal-500 dark:to-teal-400 hover:from-cyan-600 dark:hover:from-cyan-500 hover:to-teal-600 dark:hover:to-teal-500 text-white hover:shadow-md"
                  }`}
                >
                  Trang trước
                </button>
                <div className="flex gap-1 sm:gap-2">
                  {pageNumbers.map((number) => (
                    <button
                      key={number}
                      onClick={() => goToPage(number)}
                      className={`px-2 py-1 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105 ${
                        currentPage === number
                          ? "bg-gradient-to-r from-cyan-500 dark:from-cyan-400 to-teal-500 dark:to-teal-400 text-white"
                          : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 hover:text-white"
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105 ${
                    currentPage === totalPages
                      ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-cyan-500 dark:from-cyan-400 to-teal-500 dark:to-teal-400 hover:from-cyan-600 dark:hover:from-cyan-500 hover:to-teal-600 dark:hover:to-teal-500 text-white hover:shadow-md"
                  }`}
                >
                  Trang sau
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="relative z-10 flex items-center gap-2 bg-teal-500/90 dark:bg-teal-400/90 text-white px-6 py-3 rounded-xl shadow-xl transition-all duration-300 animate-pulse mx-auto max-w-md">
            <ExclamationCircleIcon className="w-6 h-6" />
            <p>Không có người dùng nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement;