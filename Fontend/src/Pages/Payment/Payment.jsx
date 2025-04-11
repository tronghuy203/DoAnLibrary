// src/components/PaymentPage.js
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createAxios } from "../../createInstance";
import { payRentalFeeAndCreateBorrow, getBorrowRequestDetails } from "../../redux/apiBorrow";

const PaymentPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login?.currentUser);
  const { requestDetails, isFetching, error } = useSelector((state) => state.borrow);
  const axiosJWT = createAxios(user, dispatch);

  const [paymentMethod, setPaymentMethod] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!requestId) {
      alert("Không tìm thấy ID yêu cầu mượn!");
      navigate("/");
      return;
    }

    if (!requestDetails || requestDetails._id !== requestId) {
      getBorrowRequestDetails(requestId, user.accessToken, dispatch, axiosJWT);
    }
  }, [requestId, user, requestDetails, navigate, axiosJWT, dispatch]);

  const handlePayment = async () => {
    if (!paymentMethod) {
      alert("Vui lòng chọn phương thức thanh toán!");
      return;
    }

    try {
      const paymentData = await payRentalFeeAndCreateBorrow(
        requestId,
        paymentMethod,
        user.accessToken,
        dispatch,
        axiosJWT,
        navigate
      );
      if (paymentMethod === "cash") {
        alert("Thanh toán bằng tiền mặt thành công!");
      } else if (paymentMethod === "vnpay") {
        alert("Đang chuyển hướng đến VNPay...");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Lỗi thanh toán. Vui lòng thử lại!";
      console.error("Lỗi khi thanh toán:", err);
      alert(errorMessage);
    }
  };

  if (isFetching || !requestDetails) {
    return <div>Đang tải thông tin thanh toán...</div>;
  }

  if (error) {
    return <div>Có lỗi xảy ra khi tải thông tin!</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center py-12 px-4 transition-all duration-300">
      <div className="bg-white dark:bg-zinc-800 p-8 rounded-2xl shadow-xl max-w-md w-full transform transition-all duration-500 animate-fade-in-up">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
          Thanh Toán Phí Mượn Sách
        </h1>
        <div className="space-y-6 mb-8">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-700 rounded-lg shadow-inner transition-all duration-300 hover:shadow-md">
            <span className="text-gray-700 dark:text-gray-300 font-semibold">Tên người nhận:</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {user?.username || user?.name || "Không xác định"}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-700 rounded-lg shadow-inner transition-all duration-300 hover:shadow-md">
            <span className="text-gray-700 dark:text-gray-300 font-semibold">Sách:</span>
            <span className="text-gray-900 dark:text-white font-medium truncate max-w-[60%]">
              {requestDetails.bookId?.title || requestDetails.bookId || "Chưa xác định"}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-700 rounded-lg shadow-inner transition-all duration-300 hover:shadow-md">
            <span className="text-gray-700 dark:text-gray-300 font-semibold">Phí mượn:</span>
            <span className="text-orange-500 dark:text-orange-400 font-bold text-lg">
              {(requestDetails.bookId?.price || "0").toLocaleString("vi-VN")} ₫
            </span>
          </div>
        </div>
        <div className="mb-8">
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-3 text-lg">
            Chọn phương thức thanh toán
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 hover:border-orange-400 dark:hover:border-orange-500"
          >
            <option value="">-- Chọn phương thức --</option>
            <option value="vnpay">Thẻ tín dụng (VNPay)</option>
            <option value="cash">Tiền mặt</option>
            <option value="momo">MoMo</option>
          </select>
        </div>
        <button
          onClick={handlePayment}
          disabled={isFetching}
          className={`w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
            isFetching ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isFetching ? "Đang xử lý..." : "Thanh toán ngay"}
        </button>
        <button
          onClick={() => navigate(`/books/${requestDetails.bookId?._id || ""}`)}
          className="w-full mt-4 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 font-medium underline transition-all duration-300"
        >
          Quay lại trang sách
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;