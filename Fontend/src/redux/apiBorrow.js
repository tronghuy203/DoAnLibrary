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
  } from "./borrowSlice";
  
  // Gửi yêu cầu mượn sách
  export const requestBorrow = async (bookId, accessToken, dispatch, axiosJWT) => {
    dispatch(addBorrowRequestStart());
    try {
      const res = await axiosJWT.post("http://localhost:8000/v1/borrow/request", { bookId }, {
        headers: { token: `Bearer ${accessToken}` },
      });
      dispatch(addBorrowRequestSuccess(res.data));
      return res.data;
    } catch (err) {
      dispatch(addBorrowRequestFailed());
      console.error("Lỗi khi gửi yêu cầu mượn:", err);
      throw err;
    }
  };
  
  // Thanh toán phí mượn & tạo đơn mượn
  export const payRentalFeeAndCreateBorrow = async (requestId, method, accessToken, dispatch, axiosJWT) => {
    try {
      const res = await axiosJWT.post(`http://localhost:8000/v1/borrow/pay-rental/${requestId}`, { method }, {
        headers: { token: `Bearer ${accessToken}` },
      });
      dispatch(payRentalSuccess(res.data));
      return res.data;
    } catch (err) {
      dispatch(payRentalFailed());
      console.error("Lỗi thanh toán phí mượn:", err);
      throw err;
    }
  };
  
  // Xác nhận lấy sách (admin)
  export const confirmPickup = async (borrowId, accessToken, dispatch, axiosJWT) => {
    try {
      const res = await axiosJWT.put(`http://localhost:8000/v1/borrow/confirm-pickup/${borrowId}`, {}, {
        headers: { token: `Bearer ${accessToken}` },
      });
      dispatch(confirmPickupSuccess(res.data));
      return res.data;
    } catch (err) {
      dispatch(confirmPickupFailed());
      console.error("Lỗi xác nhận lấy sách:", err);
      throw err;
    }
  };
  
 // Trả sách (admin xác nhận)
 export const confirmReturn = async (borrowId, accessToken, dispatch, axiosJWT) => {
    try {
      const res = await axiosJWT.put(`http://localhost:8000/v1/borrow/confirm-return/${borrowId}`, {}, {
        headers: { token: `Bearer ${accessToken}` },
      });
      dispatch(confirmReturnSuccess(res.data));
      return res.data;
    } catch (err) {
      dispatch(confirmReturnFailed());
      console.error("Lỗi xác nhận trả sách:", err);
      throw err;
    }
  };
  
  // Thanh toán tiền phạt
  export const payPenalty = async (penaltyId, method, accessToken, dispatch, axiosJWT) => {
    try {
      const res = await axiosJWT.post(`http://localhost:8000/v1/borrow/pay-penalty/${penaltyId}`, { method }, {
        headers: { token: `Bearer ${accessToken}` },
      });
      dispatch(payPenaltySuccess(res.data));
      return res.data;
    } catch (err) {
      dispatch(payPenaltyFailed());
      console.error("Lỗi thanh toán tiền phạt:", err);
      throw err;
    }
  };

  // Admin lấy tất cả đơn mượn
  export const getAllBorrowRecords = async (accessToken, dispatch, axiosJWT) => {
    dispatch(getBorrowsStart());
    try {
      const res = await axiosJWT.get("http://localhost:8000/v1/borrow/all", {
        headers: { token: `Bearer ${accessToken}` },
      });
      console.log("📦 Dữ liệu đơn mượn trả về từ API:", res.data);
      dispatch(getBorrowsSuccess(res.data));
    } catch (err) {
      dispatch(getBorrowsFailed());
      console.error("Lỗi khi lấy danh sách đơn mượn:", err);
    }
  };
  