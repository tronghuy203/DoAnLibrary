import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, verifyEmail, resendVerificationCode } from "../../redux/apiRequest";
import anhnen from "../../Assets/anhnen.jpg";

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState(1);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Hàm kiểm tra validation
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
      setVerificationCode("");
      setCountdown(60);
      setErrors({});
    } catch (err) {
      const serverError = err.response?.data;
      if (serverError === "Email đã được sử dụng. Vui lòng chọn email khác.") {
        setErrors({ email: serverError });
      } else if (serverError === "Sai mật khẩu") {
        setErrors({ confirmPassword: "Mật khẩu không khớp." });
      } else if (serverError.includes("username must be at least 6 characters")) {
        setErrors({ username: "Tên tài khoản phải có ít nhất 6 ký tự." });
      } else {
        setErrors({ general: "Đăng ký thất bại. Vui lòng thử lại." });
      }
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();

    if (!verificationCode) {
      setErrors({ verificationCode: "Mã xác thực không được để trống." });
      return;
    }

    const verifyData = { email, code: verificationCode };
    try {
      await verifyEmail(verifyData, dispatch, navigate);
      setErrors({});
    } catch (err) {
      const serverError = err.response?.data;
      if (serverError === "Mã xác thực không đúng") {
        setErrors({ verificationCode: "Mã xác thực không đúng." });
      } else if (serverError === "Không tìm thấy thông tin đăng ký") {
        setErrors({ general: "Không tìm thấy thông tin đăng ký. Vui lòng đăng ký lại." });
      } else {
        setErrors({ general: "Xác thực thất bại. Vui lòng thử lại." });
      }
    }
  };

  const handleResendCode = async () => {
    try {
      await resendVerificationCode(email);
      setCountdown(60);
      setErrors({});
      alert("Mã xác thực đã được gửi lại.");
    } catch (err) {
      setErrors({ general: "Gửi lại mã thất bại. Vui lòng thử lại." });
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  return (
    <section
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{ backgroundImage: `url(${anhnen})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 via-gray-800/60 to-black/70 backdrop-blur-sm animate-fade-in"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,255,255,0.1),_transparent_70%)] opacity-50 animate-pulse-slow"></div>

      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 sm:p-10 transition-all duration-500 hover:shadow-[0_0_25px_rgba(0,255,255,0.2)] animate-slide-up">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-8 tracking-tight">
          {step === 1 ? "Đăng ký" : "Xác thực Email"}
        </h2>

        {step === 1 ? (
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Nhập email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 w-full px-4 py-3 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-400 transition-all duration-300 hover:border-cyan-400"
              />
              {errors.email && (
                <span className="mt-1 text-sm text-red-500 animate-fade-in">{errors.email}</span>
              )}
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Tên tài khoản
              </label>
              <input
                id="username"
                type="text"
                placeholder="Nhập tên tài khoản"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-2 w-full px-4 py-3 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-400 transition-all duration-300 hover:border-cyan-400"
              />
              {errors.username && (
                <span className="mt-1 text-sm text-red-500 animate-fade-in">{errors.username}</span>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 w-full px-4 py-3 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-400 transition-all duration-300 hover:border-cyan-400"
              />
              {errors.password && (
                <span className="mt-1 text-sm text-red-500 animate-fade-in">{errors.password}</span>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Nhập lại mật khẩu
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Xác nhận mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-2 w-full px-4 py-3 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-400 transition-all duration-300 hover:border-cyan-400"
              />
              {errors.confirmPassword && (
                <span className="mt-1 text-sm text-red-500 animate-fade-in">{errors.confirmPassword}</span>
              )}
            </div>

            {errors.general && (
              <div className="text-center text-sm text-red-500 bg-red-100/50 p-3 rounded-lg animate-fade-in">
                {errors.general}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              Đăng ký
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyEmail} className="space-y-6">
            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                Mã xác thực
              </label>
              <input
                id="verificationCode"
                type="text"
                placeholder="Nhập mã xác thực"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                autoComplete="off"
                required
                className="mt-2 w-full px-4 py-3 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-400 transition-all duration-300 hover:border-cyan-400"
              />
              {errors.verificationCode && (
                <span className="mt-1 text-sm text-red-500 animate-fade-in">{errors.verificationCode}</span>
              )}
            </div>

            {errors.general && (
              <div className="text-center text-sm text-red-500 bg-red-100/50 p-3 rounded-lg animate-fade-in">
                {errors.general}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              Xác thực
            </button>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={countdown > 0}
              className={`w-full py-2 bg-gray-600 text-white font-medium rounded-lg transition-all duration-300 ${
                countdown > 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-700 hover:shadow-lg transform hover:-translate-y-1"
              }`}
            >
              Gửi lại mã {countdown > 0 ? `(${countdown}s)` : ""}
            </button>
          </form>
        )}

        {step === 1 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Bạn đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-cyan-600 hover:text-cyan-700 hover:underline transition-colors duration-200"
            >
              Đăng nhập
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default Register;