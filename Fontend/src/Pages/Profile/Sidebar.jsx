import { Link } from "react-router-dom";
import {
  UserIcon,
  XCircleIcon,
  XMarkIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const Sidebar = ({ user, handleDelete, isSidebarOpen, setIsSidebarOpen }) => {
  return (
    <aside
      className={`lg:w-1/4 transition-all duration-300 lg:block bg-white dark:bg-gray-800 rounded-2xl shadow-lg ${
        isSidebarOpen
          ? "fixed inset-y-0 left-0 z-50 w-4/5 sm:w-2/3 max-w-sm bg-white dark:bg-gray-800 p-6 overflow-y-auto transform translate-x-0"
          : "fixed -translate-x-full lg:sticky lg:top-20 lg:self-start lg:min-h-[calc(100vh-12rem)] lg:translate-x-0"
      }`}
    >
      <div className="flex flex-col h-full">
        {isSidebarOpen && (
          <button
            className="self-end p-2 mb-4 rounded-md bg-gray-200 dark:bg-gray-700 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <XMarkIcon className="h-6 w-6 text-gray-900 dark:text-white" />
          </button>
        )}
        <nav className="space-y-3 flex-1">
          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-3 text-blue-600 dark:text-blue-400 font-semibold rounded-xl bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-800 transition-all duration-300 text-base"
          >
            <UserIcon className="h-6 w-6" />
            Hồ sơ của tôi
          </Link>
          <Link
            to="/history"
            className="flex items-center gap-3 px-4 py-3 text-blue-600 dark:text-blue-400 font-semibold rounded-xl bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-800 transition-all duration-300 text-base"
          >
            <DocumentTextIcon className="h-6 w-6" />
            Lịch sử hoạt động
          </Link>
          <button
            onClick={() => handleDelete(user?._id)}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-400 font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/50 transition-all duration-300 text-base"
          >
            <XCircleIcon className="h-6 w-6" />
            Xóa tài khoản
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;