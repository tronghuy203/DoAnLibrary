import { Link } from "react-router-dom";
import {
  UserIcon,
  XCircleIcon,
  XMarkIcon,
  DocumentTextIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

const Sidebar = ({ user, handleDelete, isSidebarOpen, setIsSidebarOpen }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const confirmDelete = () => {
    if (user && typeof handleDelete === "function") {
      handleDelete(user._id);
      setShowDeleteConfirm(false);
      setIsSidebarOpen(false);
    } else {
      console.error("handleDelete is not a function or user is missing");
    }
  };
  
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <aside
        className={`lg:w-1/5 transition-all duration-500 ease-in-out bg-white dark:bg-gray-800 rounded-xl shadow-md ${
          isSidebarOpen
            ? "fixed inset-y-0 left-0 z-50 w-3/4 sm:w-1/2 max-w-xs bg-white dark:bg-gray-800 p-5 overflow-y-auto transform translate-x-0"
            : "fixed -translate-x-full lg:sticky lg:top-16 lg:self-start lg:min-h-[calc(100vh-18rem)] lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full mt-5">
          {isSidebarOpen && (
            <button
              className="self-end p-1.5 mb-3 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <XMarkIcon className="h-5 w-5 text-gray-900 dark:text-white" />
            </button>
          )}
          <nav className="space-y-2 flex-1">
            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 ease-out text-xl"
            >
              <UserIcon className="h-5 w-5" />
              Hồ sơ của tôi
            </Link>
            <Link
              to="/history"
              className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 ease-out text-xl"
            >
              <DocumentTextIcon className="h-5 w-5" />
              Lịch sử hoạt động
            </Link>
            <Link
              to="/documents"
              className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 ease-out text-xl"
            >
              <FolderIcon className="h-5 w-5" />
              Tài liệu đã tải
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 w-full px-3 py-2 text-red-600 dark:text-red-400 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/50 transition-all duration-300 ease-out text-xl"
            >
              <XCircleIcon className="h-5 w-5" />
              Xóa tài khoản
            </button>
          </nav>
        </div>
      </aside>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl max-w-sm w-full transform scale-95 animate-pop-in">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Xác nhận xóa tài khoản
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-500 transition-all duration-300 transform hover:scale-105"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;