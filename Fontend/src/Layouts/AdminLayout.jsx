import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "../redux/apiRequest";
import { createAxios } from "../createInstance";
import { logoutSuccess } from "../redux/authSlice";
import { BookOpenIcon, PlusIcon, ListBulletIcon, ArrowLeftOnRectangleIcon, ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline"; 

const AdminLayout = () => {
  const [isBookMenuOpen, setIsBookMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login.currentUser);
  const accessToken = user?.accessToken;
  const id = user?._id;
  let axiosJWT = createAxios(user, dispatch, logoutSuccess);

  const handleLogout = () => {
    logOut(dispatch, id, navigate, accessToken, axiosJWT);
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out lg:static lg:transform-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 border-r border-gray-700 shadow-lg`}
      >
        <div className="p-6 flex flex-col h-full">

          <div className="mb-8 flex items-center gap-3">
            <img
              src="https://static.vecteezy.com/system/resources/previews/024/043/963/original/book-icon-clipart-transparent-background-free-png.png"
              alt="Logo"
              className="w-10 h-10 rounded-full"
            />
            <h3 className="text-2xl font-bold text-blue-400">Admin Menu</h3>
          </div>

          <ul className="space-y-3 flex-1">
            <li>
              <Link
                to="/admin"
                className={`flex items-center gap-3 py-3 px-4 rounded-lg transition duration-200 ${
                  location.pathname === "/admin"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span>Dashboard</span>
              </Link>
            </li>

            <li>
              <div
                className={`flex items-center justify-between py-3 px-4 rounded-lg cursor-pointer transition duration-200 ${
                  location.pathname.startsWith("/admin/books")
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
                onClick={() => setIsBookMenuOpen(!isBookMenuOpen)}
              >
                <div className="flex items-center gap-3">
                  <BookOpenIcon className="w-5 h-5" /> 
                  <span>Quản lý sách</span>
                </div>
                {isBookMenuOpen ? (
                  <ChevronDownIcon className="w-4 h-4 text-white transition-transform duration-200" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4 text-white transition-transform duration-200" />
                )}
              </div>
              {isBookMenuOpen && (
                <ul className="pl-8 mt-2 space-y-2">
                  <li>
                    <Link
                      to="/admin/books/create"
                      className={`flex items-center gap-3 py-2 px-4 rounded-lg transition duration-200 ${
                        location.pathname === "/admin/books/create"
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-400 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      <PlusIcon className="w-5 h-5" />
                      <span>Thêm sách</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/books/list"
                      className={`flex items-center gap-3 py-2 px-4 rounded-lg transition duration-200 ${
                        location.pathname === "/admin/books/list"
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-400 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      <ListBulletIcon className="w-5 h-5" />
                      <span>Danh sách sách</span>
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            <li>
              <Link
                to="/admin/users"
                className={`flex items-center gap-3 py-3 px-4 rounded-lg transition duration-200 ${
                  location.pathname === "/admin/users"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span>Quản lý người dùng</span>
              </Link>
            </li>
          </ul>

          <div className="mt-auto">
            <button
              className="w-full flex items-center gap-3 py-3 mb-10 px-4 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition duration-200"
              onClick={handleLogout}
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-700 rounded-full shadow-lg hover:bg-gray-600 transition duration-200"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <svg
          className="w-6 h-6 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      <main className="flex-1 p-6 lg:ml-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;