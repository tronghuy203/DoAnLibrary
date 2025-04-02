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
    setError(""); // Reset lỗi cũ

    const message = await forgotPassword(email, dispatch);
    if (message === "Email không tồn tại.") {
      setError("Email không tồn tại trong hệ thống.");
    } else if (message === "Mã xác thực đặt lại mật khẩu đã được gửi.") {
      navigate("/verify-reset-code", { state: { email } }); // Chuyển hướng kèm email
    } else {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 sm:p-10 transition-all duration-500 hover:shadow-[0_0_25px_rgba(0,255,255,0.2)] animate-slide-up">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-8 tracking-tight">
          Quên mật khẩu
        </h2>

        {error && (
          <div className="mb-6 text-center text-sm text-red-500 bg-red-100/50 p-3 rounded-lg animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full px-4 py-3 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-400 transition-all duration-300 hover:border-cyan-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            Gửi mã OTP
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Quay lại{" "}
          <Link
            to="/login"
            className="text-cyan-600 hover:text-cyan-700 hover:underline transition-colors duration-200"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;