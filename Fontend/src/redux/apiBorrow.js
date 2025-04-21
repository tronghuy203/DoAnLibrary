import {
  getBorrowsStart,
  getBorrowsSuccess,
  getBorrowsFailed,
  addBorrowRequestStart,
  addBorrowRequestSuccess,
  addBorrowRequestFailed,
  payRentalSuccess,
  payRentalFailed,
  confirmPickupSuccess,
  confirmPickupFailed,
  confirmReturnSuccess,
  confirmReturnFailed,
  payPenaltySuccess,
  payPenaltyFailed,
  getBorrowRequestDetailsStart,
  getBorrowRequestDetailsSuccess,
  getBorrowRequestDetailsFailed,
  getTotalRevenueStart,
  getTotalRevenueSuccess,
  getTotalRevenueFailed,
  getDailyRevenueFailed,
  getDailyRevenueSuccess,
  getDailyRevenueStart,
} from "./borrowSlice";

export const requestBorrow = async (bookId, accessToken, dispatch, axiosJWT) => {
  dispatch(addBorrowRequestStart());
  try {
    const myRequests = await axiosJWT.get(
      "http://localhost:8000/v1/borrow/my-requests",
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );

    const pendingRequest = myRequests.data.find(
      (req) => req.bookId === bookId && req.status === "pending"
    );

    if (pendingRequest) {
      dispatch(addBorrowRequestSuccess(pendingRequest));
      return pendingRequest;
    }

    const res = await axiosJWT.post(
      "http://localhost:8000/v1/borrow/request",
      { bookId },
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(addBorrowRequestSuccess(res.data));
    return res.data;
  } catch (err) {
    dispatch(addBorrowRequestFailed());
    const errorMessage = err.response?.data?.message || "Lỗi không xác định từ server";
    console.error("Lỗi từ server:", errorMessage);
    throw err;
  }
};

export const getBorrowRequestDetails = async (requestId, accessToken, dispatch, axiosJWT) => {
  dispatch(getBorrowRequestDetailsStart());
  try {
    const res = await axiosJWT.get(
      `http://localhost:8000/v1/borrow/request/${requestId}`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(getBorrowRequestDetailsSuccess(res.data));
    return res.data;
  } catch (err) {
    dispatch(getBorrowRequestDetailsFailed());
    console.error("Lỗi khi lấy thông tin yêu cầu:", err);
    throw err;
  }
};

export const payRentalFeeAndCreateBorrow = async (
  requestId,
  method,
  accessToken,
  dispatch,
  axiosJWT,
  navigate
) => {
  try {
    const res = await axiosJWT.post(
      `http://localhost:8000/v1/borrow/pay-rental/${requestId}`,
      { method },
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(payRentalSuccess(res.data));

    if (method === "vnpay" && res.data.paymentUrl) {
      console.log("Chuyển hướng đến VNPay với paymentUrl:", res.data.paymentUrl);
      window.location.href = res.data.paymentUrl; // Chuyển hướng đến VNPay
    } else if (method === "cash") {
      navigate("/payment-success", {
        state: {
          payment: res.data.payment,
          borrowRecord: res.data.borrowRecord,
        },
      });
    }
    return res.data;
  } catch (err) {
    dispatch(payRentalFailed());
    console.error("Lỗi thanh toán phí mượn:", err);
    throw err;
  }
};

// redux/apiBorrow.js
export const checkPaymentStatus = async (txnRef, accessToken, dispatch, axiosJWT) => {
  try {
    const res = await axiosJWT.get(
      `http://localhost:8000/v1/borrow/check-payment-status?txnRef=${txnRef}`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    console.log("Phản hồi từ API checkPaymentStatus:", res.data);
    return res.data;
  } catch (err) {
    console.error("Lỗi từ API checkPaymentStatus:", err.response?.data || err);
    throw err;
  }
};
export const confirmPickup = async (
  borrowId,
  accessToken,
  dispatch,
  axiosJWT
) => {
  try {
    const res = await axiosJWT.put(
      `http://localhost:8000/v1/borrow/confirm-pickup/${borrowId}`,
      {},
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(confirmPickupSuccess(res.data));
    return res.data;
  } catch (err) {
    dispatch(confirmPickupFailed());
    console.error("Lỗi xác nhận lấy sách:", err);
    throw err;
  }
};

export const confirmReturn = async (
  borrowId,
  accessToken,
  dispatch,
  axiosJWT
) => {
  try {
    const res = await axiosJWT.put(
      `http://localhost:8000/v1/borrow/confirm-return/${borrowId}`,
      {},
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(confirmReturnSuccess(res.data));
    return res.data;
  } catch (err) {
    dispatch(confirmReturnFailed());
    console.error("Lỗi xác nhận trả sách:", err);
    throw err;
  }
};

export const payPenalty = async (
  penaltyId,
  method,
  accessToken,
  dispatch,
  axiosJWT
) => {
  try {
    const res = await axiosJWT.post(
      `http://localhost:8000/v1/borrow/pay-penalty/${penaltyId}`,
      { method },
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(payPenaltySuccess(res.data));
    return res.data;
  } catch (err) {
    dispatch(payPenaltyFailed());
    console.error("Lỗi thanh toán tiền phạt:", err);
    throw err;
  }
};

export const getAllBorrowRecords = async (accessToken, dispatch, axiosJWT) => {
  dispatch(getBorrowsStart());
  try {
    const res = await axiosJWT.get("http://localhost:8000/v1/borrow/all", {
      headers: { token: `Bearer ${accessToken}` },
    }); 
    dispatch(getBorrowsSuccess(res.data));
  } catch (err) {
    dispatch(getBorrowsFailed());
    console.error("Lỗi khi lấy danh sách đơn mượn:", err);
  }
};

export const getTotalRevenue = async (accessToken, dispatch, axiosJWT) => {
  dispatch(getTotalRevenueStart());
  try {
    const res = await axiosJWT.get("http://localhost:8000/v1/borrow/revenue/total", {
      headers: { token: `Bearer ${accessToken}` },
    });
    dispatch(getTotalRevenueSuccess(res.data.totalRevenue));
    return res.data.totalRevenue;
  } catch (err) {
    dispatch(getTotalRevenueFailed());
    console.error("Lỗi khi lấy tổng doanh thu:", err);
    throw err;
  }
};

export const getPaymentHistory = async (userId, accessToken, axiosJWT) => {
  try {
    const res = await axiosJWT.get(`http://localhost:8000/v1/borrow/history/${userId}`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    return res.data;
  } catch (err) {
    console.error("Lỗi khi lấy lịch sử thanh toán:", err);
    throw err;
  }
};

export const getDailyRevenue = async (accessToken, dispatch, axiosJWT) => {
  dispatch(getDailyRevenueStart());
  try {
    const res = await axiosJWT.get("http://localhost:8000/v1/borrow/revenue/daily", {
      headers: { token: `Bearer ${accessToken}` },
    });
    dispatch(getDailyRevenueSuccess(res.data));
    return res.data;
  } catch (err) {
    dispatch(getDailyRevenueFailed());
    console.error("Lỗi khi lấy doanh thu theo ngày:", err);
    throw err;
  }
};

