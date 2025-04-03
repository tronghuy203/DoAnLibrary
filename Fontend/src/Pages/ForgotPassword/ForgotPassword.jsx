import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../redux/apiRequest";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const message = await forgotPassword(email, dispatch);
    if (message === "Email không tồn tại.") {
      setError("Email không tồn tại trong hệ thống.");
    } else if (message === "Mã xác thực đặt lại mật khẩu đã được gửi.") {
      navigate("/verify-reset-code", { state: { email } });
    } else {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-all duration-300">
      <div className="relative bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-500 hover:shadow-2xl">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 via-transparent to-cyan-50/50 dark:from-cyan-900/20 dark:to-cyan-900/20 rounded-2xl pointer-events-none"></div>

        {/* Content */}
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6 tracking-tight">
            Quên Mật Khẩu
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8 text-sm">
            Nhập email của bạn để nhận mã OTP đặt lại mật khẩu
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm rounded-lg text-center animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
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
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-400 transition-all duration-300 shadow-sm hover:shadow-md"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-700 dark:from-cyan-600 dark:to-cyan-800 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-cyan-800 dark:hover:from-cyan-700 dark:hover:to-cyan-900 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              Gửi Mã OTP
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Quay lại{" "}
            <Link
              to="/login"
              className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 hover:underline font-medium transition-all duration-200"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;