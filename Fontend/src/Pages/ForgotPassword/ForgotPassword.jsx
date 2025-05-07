import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../redux/apiRequest";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const message = await forgotPassword(email, dispatch);
      if (message === "Email không tồn tại.") {
        setError("Email không tồn tại trong hệ thống.");
      } else if (message === "Mã xác thực đặt lại mật khẩu đã được gửi.") {
        navigate("/verify-reset-code", { state: { email } });
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } catch (err) {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-700 flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl shadow-lg w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-400/30 to-blue-500/30 blur-xl opacity-50 dark:from-cyan-600/20 dark:to-blue-600/20 -z-10"></div>

        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 dark:bg-zinc-900/70 z-50">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-t-transparent border-cyan-500 dark:border-cyan-400 rounded-full animate-spin-continuous"></div>
              <div className="absolute inset-2 border-4 border-r-transparent border-blue-600 dark:border-blue-500 rounded-full animate-spin-continuous-reverse"></div>
              <div className="absolute inset-4 bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 rounded-full opacity-50 animate-pulse"></div>
            </div>
          </div>
        )}

        <div className="relative">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-2xl sm:text-3xl font-bold text-center text-gray-800 dark:text-white mb-4 sm:mb-6 tracking-tight"
          >
            Quên Mật Khẩu
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base"
          >
            Nhập email để nhận mã OTP đặt lại mật khẩu
          </motion.p>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mbCatalan 4 sm:mb-6 p-3 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 text-xs sm:text-sm rounded-lg text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-400 transition-all duration-300 hover:shadow-md"
              />
            </motion.div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)" }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              disabled={isLoading}
              className={`w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-md ${
                isLoading ? "opacity-75 cursor-not-allowed" : "hover:from-cyan-600 hover:to-blue-700 dark:hover:from-cyan-700 dark:hover:to-blue-800"
              }`}
            >
              Gửi Mã OTP
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-4 sm:mt-6 text-center text-sm text-gray-600 dark:text-gray-400"
          >
            Quay lại{" "}
            <Link
              to="/login"
              className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium transition-all duration-200 relative group"
            >
              Đăng nhập
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-cyan-600 dark:bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <style>
        {`
          @keyframes spin-continuous {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes spin-continuous-reverse {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(-360deg); }
          }
          .animate-spin-continuous {
            animation: spin-continuous 1s linear infinite;
          }
          .animate-spin-continuous-reverse {
            animation: spin-continuous-reverse 1s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default ForgotPassword;