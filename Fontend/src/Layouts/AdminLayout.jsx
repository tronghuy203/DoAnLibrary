import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "../redux/apiRequest";
import { createAxios } from "../createInstance";
import { logoutSuccess } from "../redux/authSlice";
import {
  BookOpenIcon,
  PlusIcon,
  ListBulletIcon,
  ArrowLeftOnRectangleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentPlusIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";

const AdminLayout = () => {
  const [isBookMenuOpen, setIsBookMenuOpen] = useState(false);
  const [isDocumentMenuOpen, setIsDocumentMenuOpen] = useState(false);
  const [isReviewMenuOpen, setIsReviewMenuOpen] = useState(false);
  const [isRevenueOpen, setIsRevenueOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login.currentUser);
  const accessToken = user?.accessToken;
  const id = user?._id;
  let axiosJWT = createAxios(user, dispatch, logoutSuccess);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));

    const event = new Event("darkModeChange");
    window.dispatchEvent(event);
  }, [isDarkMode]);

  const handleLogout = () => {
    logOut(dispatch, id, navigate, accessToken, axiosJWT);
  };

  const handleMenuClick = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-all duration-300 ease-in-out">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-60 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-in-out lg:static lg:transform-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 border-r border-gray-200 dark:border-gray-700 shadow-lg`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="mb-8 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="https://static.vecteezy.com/system/resources/previews/024/043/963/original/book-icon-clipart-transparent-background-free-png.png"
                alt="Logo"
                className="w-10 h-10 rounded-full"
              />
              <h3 className="text-xl font-bold text-blue-500 dark:text-blue-400">Admin Menu</h3>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 ease-in-out"
            >
              {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex-1 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar scrollbar-w-2 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-blue-500 dark:scrollbar-thumb-blue-400 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 [scrollbar-color:#3b82f6_#f3f4f6] dark:[scrollbar-color:#60a5fa_#1f2937] lg:scrollbar-w-3 lg:scrollbar-thumb-blue-600 dark:lg:scrollbar-thumb-blue-500 lg:scrollbar-track-gray-100 dark:lg:scrollbar-track-gray-800 lg:scrollbar-thumb-hover:blue-700 dark:lg:scrollbar-thumb-hover:blue-600">
            <ul className="space-y-3">
              <li>
                <Link
                  to="/admin"
                  className={`flex items-center gap-3 py-3 px-4 rounded-lg transition duration-200 ${
                    location.pathname === "/admin"
                      ? "bg-blue-500 dark:bg-blue-600 text-white shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  onClick={handleMenuClick}
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
                  <span>Bảng điều khiển</span>
                </Link>
              </li>

              <li>
                <div
                  className={`flex items-center justify-between py-3 px-4 rounded-lg cursor-pointer transition duration-200 ${
                    location.pathname.startsWith("/admin/books")
                      ? "bg-blue-500 dark:bg-blue-600 text-white shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  onClick={() => setIsBookMenuOpen(!isBookMenuOpen)}
                >
                  <div className="flex items-center gap-3">
                    <BookOpenIcon className="w-5 h-5" />
                    <span>Quản lý sách</span>
                  </div>
                  {isBookMenuOpen ? (
                    <ChevronDownIcon className="w-4 h-4 transition-transform duration-200" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4 transition-transform duration-200" />
                  )}
                </div>
                {isBookMenuOpen && (
                  <ul className="pl-8 mt-2 space-y-2">
                    <li>
                      <Link
                        to="/admin/books/categorys/list"
                        className={`flex items-center gap-3 py-2 px-4 rounded-lg transition duration-200 ${
                          location.pathname === "/admin/books/categorys/list"
                            ? "bg-blue-500 dark:bg-blue-600 text-white shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                        }`}
                        onClick={handleMenuClick}
                      >
                        <PlusIcon className="w-5 h-5" />
                        <span>Thêm danh mục</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/books/create"
                        className={`flex items-center gap-3 py-2 px-4 rounded-lg transition duration-200 ${
                          location.pathname === "/admin/books/create"
                            ? "bg-blue-500 dark:bg-blue-600 text-white shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                        }`}
                        onClick={handleMenuClick}
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
                            ? "bg-blue-500 dark:bg-blue-600 text-white shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                        }`}
                        onClick={handleMenuClick}
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
                  to="/admin/manage/borrow"
                  className={`flex items-center gap-3 py-3 px-4 rounded-lg transition duration-200 ${
                    location.pathname === "/admin/manage/borrow"
                      ? "bg-blue-500 dark:bg-blue-600 text-white shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  onClick={handleMenuClick}
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
                  <span>Quản lý mượn, trả</span>
                </Link>
              </li>

              <li>
                <div
                  className={`flex items-center justify-between py-3 px-4 rounded-lg cursor-pointer transition duration-200 ${
                    location.pathname.startsWith("/admin/documents")
                      ? "bg-blue-500 dark:bg-blue-600 text-white shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  onClick={() => setIsDocumentMenuOpen(!isDocumentMenuOpen)}
                >
                  <div className="flex items-center gap-3">
                    <DocumentTextIcon className="w-5 h-5" />
                    <span>Quản lý tài liệu</span>
                  </div>
                  {isDocumentMenuOpen ? (
                    <ChevronDownIcon className="w-4 h-4 transition-transform duration-200" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4 transition-transform duration-200" />
                  )}
                </div>
                {isDocumentMenuOpen && (
                  <ul className="pl-8 mt-2 space-y-2">
                    <li>
                      <Link
                        to="/admin/documents/create"
                        className={`flex items-center gap-3 py-2 px-4 rounded-lg transition duration-200 ${
                          location.pathname === "/admin/documents/create"
                            ? "bg-blue-500 dark:bg-blue-600 text-white shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                        }`}
                        onClick={handleMenuClick}
                      >
                        <DocumentPlusIcon className="w-5 h-5" />
                        <span>Thêm tài liệu</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/documents/approve"
                        className={`flex items-center gap-3 py-2 px-4 rounded-lg transition duration-200 ${
                          location.pathname === "/admin/documents/approve"
                            ? "bg-blue-500 dark:bg-blue-600 text-white shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                        }`}
                        onClick={handleMenuClick}
                      >
                        <ListBulletIcon className="w-5 h-5" />
                        <span>Duyệt tài liệu</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/documents/list"
                        className={`flex items-center gap-3 py-2 px-4 rounded-lg transition duration-200 ${
                          location.pathname === "/admin/documents/list"
                            ? "bg-blue-500 dark:bg-blue-600 text-white shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                        }`}
                        onClick={handleMenuClick}
                      >
                        <ListBulletIcon className="w-5 h-5" />
                        <span>Danh sách tài liệu</span>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              <li>
                <div
                  className={`flex items-center justify-between py-3 px-4 rounded-lg cursor-pointer transition duration-200 ${
                    location.pathname.startsWith("/admin/reviews")
                      ? "bg-blue-500 dark:bg-blue-600 text-white shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  onClick={() => setIsReviewMenuOpen(!isReviewMenuOpen)}
                >
                  <div className="flex items-center gap-3">
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    <span>Quản lý đánh giá</span>
                  </div>
                  {isReviewMenuOpen ? (
                    <ChevronDownIcon className="w-4 h-4 transition-transform duration-200" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4 transition-transform duration-200" />
                  )}
                </div>
                {isReviewMenuOpen && (
                  <ul className="pl-8 mt-2 space-y-2">
                    <li>
                      <Link
                        to="/admin/reviews/books"
                        className={`flex items-center gap-3 py-2 px-4 rounded-lg transition duration-200 ${
                          location.pathname === "/admin/reviews/books"
                            ? "bg-blue-500 dark:bg-blue-600 text-white shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                        }`}
                        onClick={handleMenuClick}
                      >
                        <BookOpenIcon className="w-5 h-5" />
                        <span>Sách</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/reviews/documents"
                        className={`flex items-center gap-3 py-2 px-4 rounded-lg transition duration-200 ${
                          location.pathname === "/admin/reviews/documents"
                            ? "bg-blue-500 dark:bg-blue-600 text-white shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                        }`}
                        onClick={handleMenuClick}
                      >
                        <DocumentTextIcon className="w-5 h-5" />
                        <span>Tài liệu</span>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              <li>
                <div
                  className={`flex items-center justify-between py-3 px-4 rounded-lg cursor-pointer transition duration-200 ${
                    location.pathname.startsWith("/admin/manage-revenue")
                      ? "bg-blue-500 dark:bg-blue-600 text-white shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  onClick={() => setIsRevenueOpen(!isRevenueOpen)}
                >
                  <div className="flex items-center gap-3">
                    <ChartBarIcon className="w-5 h-5" />
                    <span>Quản lý doanh thu</span>
                  </div>
                  {isRevenueOpen ? (
                    <ChevronDownIcon className="w-4 h-4 transition-transform duration-200" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4 transition-transform duration-200" />
                  )}
                </div>
                {isRevenueOpen && (
                  <ul className="pl-8 mt-2 space-y-2">
                    <li>
                      <Link
                        to="/admin/manage-revenue/revenue"
                        className={`flex items-center gap-3 py-2 px-4 rounded-lg transition duration-200 ${
                          location.pathname === "/admin/manage-revenue/revenue"
                            ? "bg-blue-500 dark:bg-blue-600 text-white shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                        }`}
                        onClick={handleMenuClick}
                      >
                        <CurrencyDollarIcon className="w-5 h-5" />
                        <span>Doanh thu sách</span>
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
                      ? "bg-blue-500 dark:bg-blue-600 text-white shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  onClick={handleMenuClick}
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

              <li>
                <Link
                  to="/admin/chat"
                  className={`flex items-center gap-3 py-3 px-4 rounded-lg transition duration-200 ${
                    location.pathname === "/admin/chat"
                      ? "bg-blue-500 dark:bg-blue-600 text-white shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  onClick={handleMenuClick}
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
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span>Hỗ trợ khách hàng</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="mt-6 sticky bottom-0 bg-white dark:bg-gray-800 z-10">
            <button
              className="w-full flex items-center gap-3 py-3 px-4 text-gray-700 dark:text-gray-300 hover:bg-red-500 dark:hover:bg-red-600 hover:text-white rounded-lg transition duration-200"
              onClick={handleLogout}
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-200 dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <svg
          className="w-6 h-6 text-gray-800 dark:text-gray-200"
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

      <main className="flex-1 lg:ml-0 transition-all duration-300 ease-in-out">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;