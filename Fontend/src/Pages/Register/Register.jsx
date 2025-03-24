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
            className="relative w-full h-auto bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: `url(${anhnen})` }}
        >
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="relative z-10 px-10 pb-5 m-5 text-white bg-black/50 w-80 lg:w-150 rounded-lg">
                <div className="text-4xl m-5 text-center font-bold">
                    {step === 1 ? "ĐĂNG KÝ" : "XÁC THỰC EMAIL"}
                </div>

                {step === 1 ? (
                    <form onSubmit={handleRegister}>
                        <label className="flex">Email</label>
                        <input
                            className="w-full h-10 my-3 rounded-lg pl-3 text-black"
                            type="email"
                            placeholder="Nhập email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        {errors.email && <span className="text-red-500 text-sm mb-3">{errors.email}</span>}

                        <label className="flex">Tên tài khoản</label>
                        <input
                            className="w-full h-10 my-3 rounded-lg pl-3 text-black"
                            type="text"
                            placeholder="Nhập tài khoản"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        {errors.username && (
                            <span className="text-red-500 text-sm mb-3">{errors.username}</span>
                        )}

                        <label className="flex">Mật khẩu</label>
                        <input
                            className="w-full h-10 my-3 rounded-lg pl-3 text-black"
                            type="password"
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {errors.password && (
                            <span className="text-red-500 text-sm mb-3">{errors.password}</span>
                        )}

                        <label className="flex">Nhập lại mật khẩu</label>
                        <input
                            className="w-full h-10 my-3 rounded-lg pl-3 text-black"
                            type="password"
                            placeholder="Nhập lại mật khẩu"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        {errors.confirmPassword && (
                            <span className="text-red-500 text-sm mb-3">{errors.confirmPassword}</span>
                        )}

                        {errors.general && (
                            <span className="text-red-500 text-sm mb-3 text-center">{errors.general}</span>
                        )}

                        <button
                            className="bg-gray-800 hover:bg-gray-700 px-7 p-3 mt-1 rounded-lg flex mx-auto"
                            type="submit"
                        >
                            Đăng ký
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyEmail}>
                        <label className="flex">Mã xác thực</label>
                        <input
                            className="w-full h-10 my-3 rounded-lg pl-3 text-black"
                            type="text"
                            placeholder="Nhập mã xác thực"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            autoComplete="off"
                            required
                        />
                        {errors.verificationCode && (
                            <span className="text-red-500 text-sm mb-3">{errors.verificationCode}</span>
                        )}

                        {errors.general && (
                            <span className="text-red-500 text-sm mb-3 text-center">{errors.general}</span>
                        )}

                        <button
                            className="bg-gray-800 hover:bg-gray-700 px-7 p-3 mt-1 rounded-lg flex mx-auto"
                            type="submit"
                        >
                            Xác thực
                        </button>
                        <button
                            className={`bg-gray-600 hover:bg-gray-500 px-4 p-2 mt-3 rounded-lg text-sm flex mx-auto ${
                                countdown > 0 ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            type="button"
                            onClick={handleResendCode}
                            disabled={countdown > 0}
                        >
                            Gửi lại mã {countdown > 0 ? `(${countdown}s)` : ""}
                        </button>
                    </form>
                )}

                {step === 1 && (
                    <div className="flex justify-center mt-2">
                        Bạn đã có tài khoản?
                        <Link className="ml-1 text-teal-400 justify-center" to="/login">
                            <span className="underline">Đăng nhập.</span>
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Register;