import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { loginUser, googleLogin, facebookLogin } from "../../redux/apiRequest";
import { useDispatch } from "react-redux";
import anhnen from "../../Assets/anhnen.jpg";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

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

    setIsLoading(true);
    const newUser = { email, password };
    try {
      await loginUser(newUser, dispatch, navigate);
      setErrors({});
    } catch (err) {
      const serverError = err.response?.data;
      if (serverError === "Wrong email") {
        setErrors({ email: "Email không tồn tại." });
      } else if (serverError === "Wrong password") {
        setErrors({ password: "Mật khẩu sai." });
      } else {
        setErrors({ general: "Đăng nhập thất bại. Vui lòng thử lại." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    setIsLoading(true);
    try {
      await googleLogin(response.access_token, dispatch, navigate);
      setErrors({});
    } catch (err) {
      console.error("Google login error:", err);
      setErrors({ general: "Đăng nhập bằng Google thất bại. Vui lòng thử lại." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    setErrors({ general: "Đăng nhập bằng Google thất bại. Vui lòng thử lại." });
  };

  const handleFacebookLogin = () => {
    setIsLoading(true);
    window.FB.login(
      (response) => {
        if (response.status === "connected") {
          const accessToken = response.authResponse.accessToken;
          facebookLogin({ accessToken }, dispatch, navigate)
            .then(() => setErrors({}))
            .catch((err) => {
              console.error("Facebook login error:", err);
              setErrors({ general: "Đăng nhập bằng Facebook thất bại. Vui lòng thử lại." });
            })
            .finally(() => setIsLoading(false));
        } else {
          setErrors({ general: "Không thể kết nối với Facebook." });
          setIsLoading(false);
        }
      },
      { scope: "public_profile,email" }
    );
  };

  const googleLoginHook = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleFailure,
    flow: "implicit", 
  });

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <section
        className="relative min-h-screen bg-cover bg-center flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{ backgroundImage: `url(${anhnen})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-black/80 dark:from-zinc-900/80 dark:via-zinc-800/70 dark:to-black/80 backdrop-blur-md transition-all duration-300"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,255,255,0.15),_transparent_70%)] opacity-40 animate-pulse-slow"></div>
        
        {isLoading && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 dark:bg-zinc-900/70 z-50 rounded-3xl">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-t-transparent border-cyan-500 dark:border-cyan-400 rounded-full animate-spin-continuous"></div>
                <div className="absolute inset-2 border-4 border-r-transparent border-blue-600 dark:border-blue-500 rounded-full animate-spin-continuous-reverse"></div>
                <div className="absolute inset-4 bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 rounded-full opacity-50 animate-pulse"></div>
              </div>
            </div>
          )}
        <div className="relative mt-10 z-10 w-full max-w-md bg-white/95 dark:bg-zinc-800/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,255,255,0.25)] animate-slide-up">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10 tracking-wide bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent leading-tight pb-1">
            Đăng Nhập
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
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
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 shadow-sm hover:shadow-md"
                disabled={isLoading}
              />
              {errors.email && (
                <span className="mt-2 text-sm text-red-500 flex items-center animate-fade-in">
                  <span className="mr-1">⚠</span> {errors.email}
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
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 shadow-sm hover:shadow-md pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200 focus:outline-none"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible className="w-5 h-5" />
                  ) : (
                    <AiOutlineEye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="mt-2 text-sm text-red-500 flex items-center animate-fade-in">
                  <span className="mr-1">⚠</span> {errors.password}
                </span>
              )}
            </div>

            {errors.general && (
              <div className="text-center text-sm text-red-500 bg-red-50 dark:bg-red-900/30 p-2 rounded-lg animate-fade-in">
                {errors.general}
              </div>
            )}

            <div className="flex justify-between items-center text-sm">
              <Link
                to="/forgot-password"
                className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 hover:underline transition-all duration-200"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              className={`w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                isLoading ? "opacity-75 cursor-not-allowed" : "hover:from-cyan-600 hover:to-blue-700 dark:hover:from-cyan-700 dark:hover:to-blue-800"
              }`}
              disabled={isLoading}
            >
              Đăng nhập
            </button>
          </form>

          <div className="my-8 flex items-center">
            <div className="flex-grow h-px bg-gray-200 dark:bg-zinc-600"></div>
            <span className="px-4 text-sm text-gray-500 dark:text-gray-400 bg-white/95 dark:bg-zinc-800/95 rounded-full">
              Hoặc
            </span>
            <div className="flex-grow h-px bg-gray-200 dark:bg-zinc-600"></div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => googleLoginHook()}
              className={`w-full flex items-center justify-start py-2.5 px-3 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 font-medium border border-gray-300 dark:border-zinc-600 rounded-md transition-all duration-200 shadow-sm ${
                isLoading ? "opacity-75 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-zinc-700"
              }`}
              disabled={isLoading}
            >
              <FcGoogle className="w-5 h-5" />
              <p className="text-sm text-center mx-auto font-normal">Đăng nhập bằng Google</p>
            </button>
            <button
              onClick={handleFacebookLogin}
              className={`w-full flex items-center justify-start py-2.5 px-3 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 font-medium border border-gray-300 dark:border-zinc-600 rounded-md transition-all duration-200 shadow-sm ${
                isLoading ? "opacity-75 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-zinc-700"
              }`}
              disabled={isLoading}
            >
              <FaFacebook className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-center mx-auto font-normal">Đăng nhập bằng Facebook</p>
            </button>
          </div>

          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 hover:underline font-medium transition-all duration-200"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </section>

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
    </GoogleOAuthProvider>
  );
};

export default Login;