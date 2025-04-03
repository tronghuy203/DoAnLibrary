import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyResetCode } from "../../redux/apiRequest";

const VerifyOTP = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const inputRefs = useRef([]);

  const handleInputChange = (index, value) => {
    if (/^[0-9]$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const otpCode = otp.join("");

    const response = await verifyResetCode(email, otpCode, dispatch);

    if (response.success) {
      navigate("/reset-password", { state: { email } });
    } else {
      setError(response.message || "Mã OTP không hợp lệ. Vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-400 via-gray-300 to-gray-200 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-600 flex justify-center items-center p-4 transition-all duration-300">
      <div className="relative bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl w-full max-w-lg transform transition-all duration-500 hover:shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-blue-50/50 dark:from-blue-900/20 dark:to-blue-900/20 rounded-2xl pointer-events-none"></div>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-4 tracking-tight">
            Xác Minh OTP
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8 text-sm">
            Nhập mã 6 chữ số được gửi đến{" "}
            <span className="font-medium text-blue-600 dark:text-blue-400">{email}</span>
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm rounded-lg text-center animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-3 mb-8">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  ref={(el) => (inputRefs.current[index] = el)}
                  className="w-14 h-14 text-center text-xl font-semibold text-gray-800 dark:text-white bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                  required
                />
              ))}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-700 dark:from-blue-600 dark:to-blue-800 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-800 dark:hover:from-blue-700 dark:hover:to-blue-900 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              Xác Minh
            </button>
          </form>

          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
            Không nhận được mã?{" "}
            <a
              href="#"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium transition-all duration-200"
            >
              Gửi lại OTP
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;