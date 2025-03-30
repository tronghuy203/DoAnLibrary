import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../redux/apiRequest";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Reset lỗi cũ

        const message = await forgotPassword(email, dispatch);
        if (message === "Email không tồn tại.") {
            setError("Email không tồn tại trong hệ thống.");
        } else if (message === "Mã xác thực đặt lại mật khẩu đã được gửi.") {
            navigate("/verify-reset-code", { state: { email } }); // Chuyển hướng kèm email
        } else {
            setError("Có lỗi xảy ra. Vui lòng thử lại.");
        }
    };

    return (
        <div>
            <h2>Quên Mật Khẩu</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    placeholder="Nhập email của bạn" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
                <button type="submit">Gửi mã OTP</button>
            </form>
        </div>
    );
};

export default ForgotPassword;
