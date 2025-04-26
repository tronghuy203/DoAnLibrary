import React from "react";
import { useNavigate } from "react-router-dom";
import { XCircleIcon } from "@heroicons/react/24/outline";

const PaymentFailed = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="relative bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg max-w-md w-full border border-gray-200 dark:border-gray-700/50 transform transition-all animate-fade-in-up hover:shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-red-100/20 to-transparent rounded-2xl pointer-events-none dark:from-red-500/10" />

        <div className="flex justify-center mb-4">
          <XCircleIcon className="w-12 h-12 sm:w-16 sm:h-16 text-red-600 dark:text-red-400 animate-pulse" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6 text-center text-red-700 dark:text-red-500 tracking-tight">
          Thanh Toán Thất Bại
        </h1>

        <p className="text-center text-gray-600 dark:text-gray-100 text-sm sm:text-base leading-relaxed">
          Rất tiếc, giao dịch của bạn không thành công. Vui lòng thử lại sau hoặc liên hệ đội ngũ hỗ trợ để được trợ giúp.
        </p>

        <button
          onClick={() => navigate("/all-books")}
          className="w-full mt-6 bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base shadow-md transition-all duration-300 hover:from-red-600 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
        >
          Quay Lại Danh Sách Sách
        </button>
      </div>
    </div>
  );
};

export default PaymentFailed;