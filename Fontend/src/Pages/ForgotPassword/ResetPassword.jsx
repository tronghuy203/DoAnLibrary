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
        <div>
            <h2>Đặt lại mật khẩu</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input 
                    type="password" 
                    placeholder="Nhập mật khẩu mới" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Xác nhận mật khẩu mới" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                />
                <button type="submit">Đặt lại mật khẩu</button>
            </form>
        </div>
    );
};

export default ResetPassword;
