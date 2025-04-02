import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginUser } from "../../redux/apiRequest";
import { useDispatch } from "react-redux";
import anhnen from "../../Assets/anhnen.jpg";
import { FcGoogle } from "react-icons/fc"; // Icon Google
import { FaFacebook } from "react-icons/fa"; // Icon Facebook

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validateFields = (fields) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors = {};

    if (!fields.email) newErrors.email = "Email không được để trống.";
    else if (!emailRegex.test(fields.email)) newErrors.email = "Email không đúng định dạng.";

    if (!fields.password) newErrors.password = "Mật khẩu không được để trống.";

    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const fields = { email, password };
    const validationErrors = validateFields(fields);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const newUser = { email, password };
    try {
      await loginUser(newUser, dispatch, navigate);
      setErrors({});
    } catch (err) {
      console.log("Server error:", err.response);
      const serverError = err.response?.data;
      if (serverError === "Wrong email") {
        setErrors({ email: "Email không tồn tại." });
      } else if (serverError === "Wrong password") {
        setErrors({ password: "Mật khẩu sai." });
      } else {
        setErrors({ general: "Đăng nhập thất bại. Vui lòng thử lại." });
      }
    }
  };

  // Hàm xử lý đăng nhập Google (chưa triển khai logic backend)
  const handleGoogleLogin = () => {
    console.log("Đăng nhập bằng Google");
    // Thêm logic gọi API Google OAuth ở đây
  };

// Hàm xử lý đăng nhập Facebook (chưa triển khai logic backend)
  const handleFacebookLogin = () => {
    console.log("Đăng nhập bằng Facebook");
    // Thêm logic gọi API Facebook OAuth ở đây
  };

  return (
    <section
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{ backgroundImage: `url(${anhnen})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 via-gray-800/60 to-black/70 backdrop-blur-sm animate-fade-in"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,255,255,0.1),_transparent_70%)] opacity-50 animate-pulse-slow"></div>

      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 sm:p-10 transition-all duration-500 hover:shadow-[0_0_25px_rgba(0,255,255,0.2)] animate-slide-up">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-8 tracking-tight">
          Đăng nhập
        </h2>

        <form onSubmit={handleLogin} className="space-y-6">
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
              className="mt-2 w-full px-4 py-3 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-400 transition-all duration-300 hover:border-cyan-400"
            />
            {errors.email && (
              <span className="mt-1 text-sm text-red-500 animate-fade-in">{errors.email}</span>
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
              className="mt-2 w-full px-4 py-3 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-400 transition-all duration-300 hover:border-cyan-400"
            />
            {errors.password && (
              <span className="mt-1 text-sm text-red-500 animate-fade-in">{errors.password}</span>
            )}
          </div>

          {errors.general && (
            <div className="text-center text-sm text-red-500 animate-fade-in">{errors.general}</div>
          )}

          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-cyan-600 hover:text-cyan-700 hover:underline transition-colors duration-200"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            Đăng nhập
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="px-3 text-sm text-gray-500">Hoặc đăng nhập bằng</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 bg-white text-gray-700 font-semibold border border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            <FcGoogle className="w-6 h-6" />
            Đăng nhập với Google
          </button>
          <button
            onClick={handleFacebookLogin}
            className="w-full flex items-center justify-center gap-3 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            <FaFacebook className="w-6 h-6" />
            Đăng nhập với Facebook
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          Bạn chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="text-cyan-600 hover:text-cyan-700 hover:underline transition-colors duration-200"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Login;