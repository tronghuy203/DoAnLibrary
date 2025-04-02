import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { resetPassword } from "../../redux/apiRequest";
import { useLocation, useNavigate } from "react-router-dom";

const ResetPassword = ({ otp }) => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || ""; // Lấy email từ ForgotPassword

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp!");
            return;
        }

        try {
            await resetPassword({ email, newPassword, confirmNewPassword: confirmPassword }, dispatch);
            alert("Mật khẩu đã được đặt lại thành công!");
            navigate("/login");
        } catch (err) {
            setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">Đặt lại mật khẩu</h2>
                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Mật khẩu mới</label>
                        <input
                            type="password"
                            placeholder="Nhập mật khẩu mới"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Xác nhận mật khẩu</label>
                        <input
                            type="password"
                            placeholder="Xác nhận mật khẩu mới"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                    >
                        Đặt lại mật khẩu
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
