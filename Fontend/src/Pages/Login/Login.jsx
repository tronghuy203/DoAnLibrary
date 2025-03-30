import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginUser } from "../../redux/apiRequest";
import { useDispatch } from "react-redux";
import anhnen from "../../Assets/anhnen.jpg";

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
            console.log("Server error:", err.response); // Debug để xem response từ server
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

    return (
        <section
            className="relative w-full h-screen bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: `url(${anhnen})` }}
        >
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="relative z-10 text-white w-80 lg:w-150 bg-black/50 p-10 rounded-lg">
                <div className="text-4xl font-bold mb-9 flex justify-center">ĐĂNG NHẬP</div>
                <form onSubmit={handleLogin} className="lg:w-full flex flex-col">
                    <label className="">Email</label>
                    <input
                        className="my-3 w-full h-10 rounded-lg text-black pl-3"
                        type="email"
                        placeholder="Nhập email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && <span className="text-red-500 text-sm mb-3">{errors.email}</span>}

                    <label>Mật khẩu</label>
                    <input
                        className="my-3 w-full h-10 rounded-lg text-black pl-3"
                        type="password"
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {errors.password && (
                        <span className="text-red-500 text-sm mb-3">{errors.password}</span>
                    )}

                    {errors.general && (
                        <span className="text-red-500 text-sm mb-3 text-center">{errors.general}</span>
                    )}

                    <div className="text-right text-sm mb-3">
                        <Link to="/forgot-password" className="text-teal-400 hover:underline">
                            Quên mật khẩu?
                        </Link>
                    </div>
                    <button
                        className="w-36 h-12 my-3 rounded-xl mx-auto bg-gray-800 hover:bg-gray-700 transition duration-300 ease-in-out"
                        type="submit"
                    >
                        Đăng nhập
                    </button>
                </form>
                <div className="flex justify-center">
                    Bạn chưa có tài khoản?
                    <Link className="ml-1 text-teal-400 justify-center" to="/register">
                        <span className="underline">Đăng ký.</span>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Login;