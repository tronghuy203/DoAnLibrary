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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="text-gray-600 dark:text-gray-300 animate-pulse">
          Đang tải thông tin thanh toán...
        </div>
      </div>
    );
  }

  const { payment: paymentInfo, borrowRecord: borrow } = paymentData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="relative bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-2xl max-w-md w-full animate-slide-up transition-all duration-700">
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-green-400 dark:from-blue-500 dark:to-green-500 rounded-t-3xl"></div>

        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-green-200 dark:bg-green-900 opacity-30 blur-md rounded-full animate-pulse-slow"></div>
            <div className="bg-green-100 dark:bg-green-950 p-4 rounded-full animate-scale-in">
              <svg
                className="w-10 h-10 text-green-500 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold mb-8 text-center text-gray-900 dark:text-gray-100 tracking-tight">
          Thanh Toán Thành Công
        </h1>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-slide-up delay-100">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Thông Tin Thanh Toán
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              <p className="flex justify-between">
                <span className="font-medium">Mã giao dịch:</span>
                <span>{paymentInfo.vnpayTxnRef || "N/A"}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">Số tiền:</span>
                <span>{paymentInfo.amount.toLocaleString("vi-VN")} ₫</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">Phương thức:</span>
                <span>{paymentInfo.method}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">Trạng thái:</span>
                <span className="text-green-500 dark:text-green-400 font-semibold">
                  {paymentInfo.status}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-slide-up delay-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 006 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3-.512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
              Thông Tin Mượn Sách
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              <p className="flex justify-between">
                <span className="font-medium">Tên sách:</span>
                <span>{borrow?.bookId?.title || "N/A"}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">Ngày mượn:</span>
                <span>
                  {borrow ? new Date(borrow.borrowDate).toLocaleString() : "N/A"}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">Hạn trả:</span>
                <span>
                  {borrow ? new Date(borrow.dueDate).toLocaleString() : "N/A"}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">Trạng thái:</span>
                <span>{borrow?.status || "N/A"}</span>
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate("/all-books")}
          className="w-full mt-8 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          Quay Lại Danh Sách Sách
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;