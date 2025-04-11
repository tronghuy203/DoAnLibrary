// src/components/PaymentRedirect.js
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PaymentRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const txnRef = params.get("txnRef");

    console.log("PaymentRedirect gọi với txnRef từ URL:", txnRef);

    if (txnRef) {
      navigate("/payment-success", {
        state: { txnRef }, // Truyền txnRef để PaymentSuccess lấy dữ liệu
      });
    } else {
      console.error("Không tìm thấy txnRef trong URL");
      navigate("/payment-failed");
    }
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Đang xử lý thanh toán...</p>
    </div>
  );
};

export default PaymentRedirect;