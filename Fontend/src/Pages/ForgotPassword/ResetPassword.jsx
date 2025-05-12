import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../../redux/apiRequest";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (newPassword !== confirmPassword) {
        setError("Mật khẩu xác nhận không khớp!");
        return;
      }

      await resetPassword(
        { email, newPassword, confirmNewPassword: confirmPassword },
        dispatch
      );
      alert("Mật khẩu đã được đặt lại thành công!");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNewPasswordVisibility = (e) => {
    e.preventDefault();
    setShowNewPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = (e) => {
    e.preventDefault();
    setShowConfirmPassword((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-700 flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl shadow-lg w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400/30 to-cyan-500/30 blur-xl opacity-50 dark:from-blue-600/20 dark:to-cyan-600/20 -z-10"></div>

        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 dark:bg-zinc-900/70 z-50 rounded-3xl">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-t-transparent border-cyan-500 dark:border-cyan-400 rounded-full animate-spin-continuous"></div>
              <div className="absolute inset-2 border-4 border-r-transparent border-blue-600 dark:border-blue-500 rounded-full animate-spin-continuous-reverse"></div>
              <div className="absolute inset-4 bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 rounded-full opacity-50 animate-pulse"></div>
            </div>
          </div>
        )}

        <div className="relative z-10">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-2xl sm:text-3xl font-bold text-center text-gray-800 dark:text-white mb-4 sm:mb-6 tracking-tight"
          >
            Đặt Lại Mật Khẩu
          </motion.h2>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 sm:mb-6 p-3 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 text-xs sm:text-sm rounded-lg text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-md pr-12"
                />
                <motion.button
                  type="button"
                  onClick={toggleNewPasswordVisibility}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200 focus:outline-none"
                >
                  {showNewPassword ? (
                    <AiOutlineEyeInvisible className="w-5 h-5" />
                  ) : (
                    <AiOutlineEye className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Xác nhận mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-md pr-12"
                />
                <motion.button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <AiOutlineEyeInvisible className="w-5 h-5" />
                  ) : (
                    <AiOutlineEye className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </motion.div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)" }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              disabled={isLoading}
              className={`w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-600 dark:from-blue-600 dark:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-md ${
                isLoading ? "opacity-75 cursor-not-allowed" : "hover:from-blue-600 hover:to-cyan-700 dark:hover:from-blue-700 dark:hover:to-cyan-800"
              }`}
            >
              Đặt Lại Mật Khẩu
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-4 sm:mt-6 text-center text-sm text-gray-600 dark:text-gray-400"
          >
            Quay lại{" "}
            <a
              href="/login"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-all duration-200 relative group"
            >
              Đăng nhập
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 group-hover:w-full transition-all duration-300"></span>
            </a>
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

export default ResetPassword;