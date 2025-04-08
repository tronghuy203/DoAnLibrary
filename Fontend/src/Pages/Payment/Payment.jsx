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
  const { requestDetails, isFetching, error } = useSelector((state) => state.borrow); // Lấy từ Redux
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
        const fetchRequestDetails = async () => {
          try {
            await getBorrowRequestDetails(requestId, user.accessToken, dispatch, axiosJWT);
          } catch (err) {
            const bookId = err.response?.data?.bookId || "";
            console.error("Lỗi khi lấy thông tin yêu cầu:", err);
            alert("Không thể tải thông tin yêu cầu mượn. Vui lòng thử lại!");
            navigate(`/books/${bookId}`);
          }
        };
    
        fetchRequestDetails();
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
        axiosJWT
      );
      alert("Thanh toán thành công! Đơn mượn đã được tạo.");
      navigate("/all-books");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Lỗi thanh toán. Vui lòng thử lại!";
      console.error("Lỗi khi thanh toán:", err);
      alert(errorMessage);
    }
  };

  if (isFetching || !requestDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-lg">Đang tải thông tin thanh toán...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-600 text-lg">Có lỗi xảy ra khi tải thông tin!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Thanh toán phí mượn sách</h1>

        <div className="mb-6">
          <p className="text-gray-700">
            <span className="font-semibold">Tên người nhận:</span>{" "}
            {user?.username || user?.name || "Không xác định"}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Sách:</span>{" "}
            {requestDetails.bookId?.title || requestDetails.bookId || "Chưa xác định"}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Phí mượn:</span>{" "}
            {(requestDetails.bookId?.price || "Chưa xác định").toLocaleString("vi-VN")} ₫
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Chọn phương thức thanh toán:
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">-- Chọn phương thức --</option>
            <option value="vnpay">Thẻ tín dụng</option>
            <option value="cash">Tiền mặt</option>
            <option value="momo">MoMo</option>
          </select>
        </div>

        <button
          onClick={handlePayment}
          disabled={isFetching}
          className={`w-full bg-orange-500 text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition-all duration-300 ${
            isFetching ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isFetching ? "Đang xử lý..." : "Thanh toán ngay"}
        </button>

        <button
          onClick={() => navigate(`/book/${requestDetails.bookId?._id || ""}`)}
          className="w-full mt-4 text-gray-600 hover:text-gray-800 underline"
        >
          Quay lại trang sách
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;