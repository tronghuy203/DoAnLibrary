import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom"; // ✅ Nhận email từ state
import { verifyResetCode } from "../../redux/apiRequest"; // ✅ Import API xử lý OTP

const VerifyOTP = () => {
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || ""; // Lấy email từ ForgotPassword

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
    
        const response = await verifyResetCode(email, otp, dispatch); 
    
        if (response.success) { 
            navigate("/reset-password", { state: { email } }); 
        } else {
            setError(response.message || "Mã OTP không hợp lệ. Vui lòng thử lại.");
        }
    };
    
    return (
        <div>
            <h2>Xác minh OTP</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    placeholder="Nhập mã OTP" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    required 
                />
                <button type="submit">Xác minh</button>
            </form>
        </div>
    );
};

export default VerifyOTP;
