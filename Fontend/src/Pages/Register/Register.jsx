import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, verifyEmail, resendVerificationCode } from "../../redux/apiRequest";
import anhnen from "../../Assets/anhnen.jpg";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState(1);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  const validateFields = (fields) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors = {};

    if (!fields.email) newErrors.email = "Email không được để trống.";
    else if (!emailRegex.test(fields.email)) newErrors.email = "Email không đúng định dạng.";

    if (!fields.username) newErrors.username = "Tên tài khoản không được để trống.";
    else if (fields.username.length < 6) newErrors.username = "Tên tài khoản phải có ít nhất 6 ký tự.";

    if (!fields.password) newErrors.password = "Mật khẩu không được để trống.";
    else if (fields.password.length < 6) newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";

    if (!fields.confirmPassword) newErrors.confirmPassword = "Xác nhận mật khẩu không được để trống.";
    else if (fields.password !== fields.confirmPassword) newErrors.confirmPassword = "Mật khẩu không khớp.";

    return newErrors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const fields = { email, username, password, confirmPassword };
    const validationErrors = validateFields(fields);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const newUser = { email, username, password, confirmPassword };
    try {
      await registerUser(newUser, dispatch, navigate);
      setStep(2);
      setVerificationCode(["", "", "", "", "", ""]);
      setCountdown(60);
      setErrors({});
    } catch (err) {
      const serverError = err.response?.data || "Đăng ký thất bại. Vui lòng thử lại.";
      setErrors(
        serverError === "Email đã được sử dụng. Vui lòng chọn email khác."
          ? { email: serverError }
          : serverError === "Sai mật khẩu"
          ? { confirmPassword: "Mật khẩu không khớp." }
          : serverError.includes("username must be at least 6 characters")
          ? { username: "Tên tài khoản phải có ít nhất 6 ký tự." }
          : { general: serverError }
      );
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    const code = verificationCode.join("");
    if (!code) {
      setErrors({ verificationCode: "Mã xác thực không được để trống." });
      return;
    }

    const verifyData = { email, code };
    try {
      await verifyEmail(verifyData, dispatch, navigate);
      setErrors({});
    } catch (err) {
      const serverError = err.response?.data || "Xác thực thất bại. Vui lòng thử lại.";
      setErrors(
        serverError === "Mã xác thực không đúng"
          ? { verificationCode: "Mã xác thực không đúng." }
          : serverError === "Không tìm thấy thông tin đăng ký"
          ? { general: "Không tìm thấy thông tin đăng ký. Vui lòng đăng ký lại." }
          : { general: serverError }
      );
    }
  };

  const handleResendCode = async () => {
    try {
      await resendVerificationCode(email);
      setCountdown(60);
      setErrors({});
      setVerificationCode(["", "", "", "", "", ""]);
      alert("Mã xác thực đã được gửi lại.");
    } catch (err) {
      setErrors({ general: err.response?.data || "Gửi lại mã thất bại. Vui lòng thử lại." });
    }
  };

  const handleCodeChange = (index, value) => {
    if (/^[0-9]$/.test(value) || value === "") {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const togglePasswordVisibility = (e) => {
    e.preventDefault();
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = (e) => {
    e.preventDefault();
    setShowConfirmPassword((prev) => !prev);
  };

  return (
    <section
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{ backgroundImage: `url(${anhnen})` }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-black/80 dark:from-zinc-900/80 dark:via-zinc-800/70 dark:to-black/80 backdrop-blur-md transition-all duration-300"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,255,255,0.15),_transparent_70%)] opacity-40 animate-pulse-slow"></div>

      {/* Form Container */}
      <div className="relative z-10 w-full max-w-md bg-white/95 dark:bg-zinc-800/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,255,255,0.25)] animate-slide-up">
        <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10 tracking-wide bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent leading-tight pb-1">
          {step === 1 ? "Đăng Ký" : "Xác Thực Email"}
        </h2>

        {step === 1 ? (
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 shadow-sm hover:shadow-md"
              />
              {errors.email && (
                <span className="mt-2 text-sm text-red-500 flex items-center animate-fade-in">
                  <span className="mr-1">⚠</span> {errors.email}
                </span>
              )}
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tên tài khoản
              </label>
              <input
                id="username"
                type="text"
                placeholder="Nhập tên tài khoản"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 shadow-sm hover:shadow-md"
              />
              {errors.username && (
                <span className="mt-2 text-sm text-red-500 flex items-center animate-fade-in">
                  <span className="mr-1">⚠</span> {errors.username}
                </span>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 shadow-sm hover:shadow-md pr-12"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200 focus:outline-none"
                >
                  {showPassword ? <AiOutlineEyeInvisible className="w-5 h-5" /> : <AiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <span className="mt-2 text-sm text-red-500 flex items-center animate-fade-in">
                  <span className="mr-1">⚠</span> {errors.password}
                </span>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nhập lại mật khẩu
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Xác nhận mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 shadow-sm hover:shadow-md pr-12"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200 focus:outline-none"
                >
                  {showConfirmPassword ? <AiOutlineEyeInvisible className="w-5 h-5" /> : <AiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="mt-2 text-sm text-red-500 flex items-center animate-fade-in">
                  <span className="mr-1">⚠</span> {errors.confirmPassword}
                </span>
              )}
            </div>

            {errors.general && (
              <div className="text-center text-sm text-red-500 bg-red-50 dark:bg-red-900/30 p-2 rounded-lg animate-fade-in">
                {errors.general}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-700 dark:hover:from-cyan-700 dark:hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Đăng ký
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyEmail} className="space-y-6">
            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mã xác thực
              </label>
              <div className="flex justify-center space-x-3">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    ref={(el) => (inputRefs.current[index] = el)}
                    className="w-14 h-14 text-center text-xl font-medium bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                ))}
              </div>
              {errors.verificationCode && (
                <span className="mt-2 text-sm text-red-500 flex items-center animate-fade-in justify-center">
                  <span className="mr-1">⚠</span> {errors.verificationCode}
                </span>
              )}
            </div>

            {errors.general && (
              <div className="text-center text-sm text-red-500 bg-red-50 dark:bg-red-900/30 p-2 rounded-lg animate-fade-in">
                {errors.general}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-700 dark:hover:from-cyan-700 dark:hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Xác thực
            </button>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={countdown > 0}
              className={`w-full py-3 text-white font-semibold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1 ${
                countdown > 0
                  ? "bg-gray-400 dark:bg-zinc-600 cursor-not-allowed"
                  : "bg-gray-600 dark:bg-zinc-700 hover:bg-gray-700 dark:hover:bg-zinc-600"
              }`}
            >
              Gửi lại mã {countdown > 0 ? `(${countdown}s)` : ""}
            </button>
          </form>
        )}

        {step === 1 && (
          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 hover:underline font-medium transition-all duration-200"
            >
              Đăng nhập ngay
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default Register;