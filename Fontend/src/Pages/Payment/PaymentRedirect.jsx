import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PaymentRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const txnRef = params.get("txnRef");
    const paymentType = params.get("paymentType");

    if (txnRef) {
      if (paymentType === "membership") {
        navigate("/membership-payment-success", {
          state: { txnRef },
        });
      } else if (paymentType === "penalty") {
        navigate("/penalty-payment-success", {
          state: { txnRef },
        });
      } else if (paymentType === "rental_fee") {
        navigate("/rental-payment-success", {
          state: { txnRef },
        });
      } else {
        navigate("/rental-payment-success", {
          state: { txnRef },
        });
      }
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