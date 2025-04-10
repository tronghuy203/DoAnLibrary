// src/components/PaymentFailed.js
import React from "react";
import { useNavigate } from "react-router-dom";

const PaymentFailed = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center py-12 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold mb-8 text-center text-red-600">
          Thanh toán thất bại
        </h1>
        <p className="text-center text-gray-700">
          Rất tiếc, giao dịch của bạn không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ.
        </p>
        <button
          onClick={() => navigate("/all-books")}
          className="w-full mt-6 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600"
        >
          Quay lại danh sách sách
        </button>
      </div>
    </div>
  );
};

export default PaymentFailed;