import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createAxios } from "../../createInstance";
import { checkPaymentStatus } from "../../redux/apiBorrow";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login?.currentUser);

  const axiosJWT = useMemo(() => {
    if (user) {
      return createAxios(user, dispatch);
    }
    return null;
  }, [user, dispatch]);

  const { txnRef, payment, borrowRecord } = location.state || {};
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    if (!user || !user.accessToken) {
      console.error("Người dùng chưa đăng nhập");
      navigate("/login");
      return;
    }

    const fetchPaymentData = async () => {
      if (txnRef && axiosJWT) {
        try {
          const res = await checkPaymentStatus(txnRef, user.accessToken, dispatch, axiosJWT);
          setPaymentData(res);
        } catch (err) {
          console.error("Lỗi khi lấy dữ liệu thanh toán:", err);
          navigate("/payment-failed");
        }
      } else if (payment && borrowRecord) {
        setPaymentData({ payment, borrowRecord });
      } else {
        console.error("Không có dữ liệu thanh toán hợp lệ");
        navigate("/payment-failed");
      }
    };

    fetchPaymentData();
  }, [txnRef, payment, borrowRecord, user?.accessToken, axiosJWT, dispatch, navigate]);

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Đang tải thông tin thanh toán...</p>
      </div>
    );
  }

  const { payment: paymentInfo, borrowRecord: borrow } = paymentData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center py-12 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">
          Thanh toán thành công
        </h1>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-700">Thông tin thanh toán</h2>
            <p><strong>Mã giao dịch:</strong> {paymentInfo.vnpayTxnRef || "N/A"}</p>
            <p><strong>Số tiền:</strong> {paymentInfo.amount.toLocaleString("vi-VN")} ₫</p>
            <p><strong>Phương thức:</strong> {paymentInfo.method}</p>
            <p><strong>Trạng thái:</strong> {paymentInfo.status}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-700">Thông tin mượn sách</h2>
            <p><strong>Tên sách:</strong> {borrow?.bookId?.title || "N/A"}</p>
            <p><strong>Ngày mượn:</strong> {borrow ? new Date(borrow.borrowDate).toLocaleString() : "N/A"}</p>
            <p><strong>Hạn trả:</strong> {borrow ? new Date(borrow.dueDate).toLocaleString() : "N/A"}</p>
            <p><strong>Trạng thái:</strong> {borrow?.status || "N/A"}</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/all-books")}
          className="w-full mt-6 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600"
        >
          Quay lại danh sách sách
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
