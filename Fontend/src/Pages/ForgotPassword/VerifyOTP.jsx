import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyResetCode } from "../../redux/apiRequest";
import { motion, AnimatePresence } from "framer-motion";

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

  const handlePaste = (e, index) => {
    if (index === 0) {
      const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
      if (pastedData.length === 6) {
        const newOtp = pastedData.split("").slice(0, 6);
        setOtp(newOtp);
        inputRefs.current[5].focus();
        e.preventDefault();
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-700 flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg"
      >
        <div classWave="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400/30 to-cyan-500/30 blur-xl opacity-50 dark:from-blue-600/20 dark:to-cyan-600/20 -z-10"></div>

        <div className="relative z-10">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-2xl sm:text-3xl font-bold text-center text-gray-800 dark:text-white mb-4 sm:mb-6 tracking-tight"
          >
            Xác Minh OTP
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base"
          >
            Nhập mã 6 chữ số được gửi đến{" "}
            <span className="font-medium text-blue-600 dark:text-blue-400">{email}</span>
          </motion.p>

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

          <form onSubmit={handleSubmit}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex justify-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8"
            >
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onPaste={(e) => handlePaste(e, index)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  ref={(el) => (inputRefs.current[index] = el)}
                  whileHover={{ scale: 1.05, boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" }}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-center text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 dark:text-white bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              ))}
            </motion.div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)" }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-600 dark:from-blue-600 dark:to-cyan-700 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-700 dark:hover:from-blue-700 dark:hover:to-cyan-800 transition-all duration-300 shadow-md"
            >
              Xác Minh
            </motion.button>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4 sm:mt-6"
          >
            Không nhận được mã?{" "}
            <a
              href="#"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-all duration-200 relative group"
            >
              Gửi lại OTP
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 group-hover:w-full transition-all duration-300"></span>
            </a>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;