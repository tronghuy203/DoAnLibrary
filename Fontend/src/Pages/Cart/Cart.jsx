import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion"; // Optional: for animations

const Cart = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleContinueShopping = () => {
    navigate("/document-list");
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 dark:from-zinc-800 dark:via-zinc-900 dark:to-black flex items-center justify-center transition-colors duration-500">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-2xl p-8 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-zinc-700/50">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-8 tracking-tight">
          Giỏ Hàng Của Bạn
        </h2>

        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <svg
              className="mx-auto h-16 w-16 text-gray-400 dark:text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-700 dark:text-zinc-300">
              Giỏ hàng của bạn hiện đang trống
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
              Thêm tài liệu hoặc mục để bắt đầu!
            </p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.97 }}
            onClick={handleContinueShopping}
            className="mt-6 inline-block bg-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all duration-300 shadow-md"
          >
            Tiếp Tục Mua Sắm
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Cart;