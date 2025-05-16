import { createSlice } from "@reduxjs/toolkit";

const borrowSlice = createSlice({
  name: "borrow",
  initialState: {
    isFetching: false,
    error: false,
    borrowRequests: [],
    borrowRecords: [],
    penalties: [],
    message: "",
    requestDetails: null,
    totalRevenue: 0,
    dailyRevenue: [],
  },
  reducers: {
    getBorrowsStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    getBorrowsSuccess: (state, action) => {
      state.isFetching = false;
      state.borrowRecords = action.payload;
    },
    getBorrowsFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    addBorrowRequestStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    addBorrowRequestSuccess: (state, action) => {
      state.isFetching = false;
      state.borrowRequests.push(action.payload);
    },
    addBorrowRequestFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    getBorrowRequestDetailsStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    getBorrowRequestDetailsSuccess: (state, action) => {
      state.isFetching = false;
      state.requestDetails = action.payload;
    },
    getBorrowRequestDetailsFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    payRentalSuccess: (state, action) => {
      state.message = "Thanh toán phí mượn thành công!";
    },
    payRentalFailed: (state) => {
      state.error = true;
    },

    adminCancelBorrowRecordStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    adminCancelBorrowRecordSuccess: (state, action) => {
      state.isFetching = false;
      state.error = false;
    },
    adminCancelBorrowRecordFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    confirmPickupSuccess: (state, action) => {
      state.message = "Xác nhận lấy sách thành công!";
    },
    confirmPickupFailed: (state) => {
      state.error = true;
    },

    confirmReturnSuccess: (state, action) => {
      state.message = "Xác nhận trả sách thành công!";
    },
    confirmReturnFailed: (state) => {
      state.error = true;
    },

    payPenaltySuccess: (state, action) => {
      state.penalties.push(action.payload);
      state.message = "Thanh toán tiền phạt thành công!";
    },
    payPenaltyFailed: (state) => {
      state.error = true;
    },

    getTotalRevenueStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    getTotalRevenueSuccess: (state, action) => {
      state.isFetching = false;
      state.totalRevenue = action.payload;
    },
    getTotalRevenueFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    getDailyRevenueStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    getDailyRevenueSuccess: (state, action) => {
      state.isFetching = false;
      state.dailyRevenue = action.payload;
    },
    getDailyRevenueFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },
  },
});

export const {
  getBorrowsStart,
  getBorrowsSuccess,
  getBorrowsFailed,
  addBorrowRequestStart,
  addBorrowRequestSuccess,
  addBorrowRequestFailed,
  getBorrowRequestDetailsStart,
  getBorrowRequestDetailsSuccess,
  getBorrowRequestDetailsFailed,
  payRentalSuccess,
  payRentalFailed,
  adminCancelBorrowRecordStart,
  adminCancelBorrowRecordSuccess,
  adminCancelBorrowRecordFailed,
  confirmPickupSuccess,
  confirmPickupFailed,
  confirmReturnSuccess,
  confirmReturnFailed,
  payPenaltySuccess,
  payPenaltyFailed,
  getTotalRevenueStart,
  getTotalRevenueSuccess,
  getTotalRevenueFailed,
  getDailyRevenueStart,
  getDailyRevenueSuccess,
  getDailyRevenueFailed,
} = borrowSlice.actions;

export default borrowSlice.reducer;
