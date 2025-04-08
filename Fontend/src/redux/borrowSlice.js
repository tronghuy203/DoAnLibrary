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
  },
  reducers: {
    // GET ALL BORROW RECORDS
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

    // ADD BORROW REQUEST
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

    // ACTION: Thanh toán phí mượn
    payRentalSuccess: (state, action) => {
      state.message = "Thanh toán phí mượn thành công!";
    },
    payRentalFailed: (state) => {
      state.error = true;
    },

    // ACTION: Xác nhận lấy sách
    confirmPickupSuccess: (state, action) => {
      state.message = "Xác nhận lấy sách thành công!";
    },
    confirmPickupFailed: (state) => {
      state.error = true;
    },

    // ACTION: Xác nhận trả sách
    confirmReturnSuccess: (state, action) => {
      state.message = "Xác nhận trả sách thành công!";
    },
    confirmReturnFailed: (state) => {
      state.error = true;
    },

    // ACTION: Thanh toán tiền phạt
    payPenaltySuccess: (state, action) => {
      state.penalties.push(action.payload); // nếu muốn lưu lại
      state.message = "Thanh toán tiền phạt thành công!";
    },
    payPenaltyFailed: (state) => {
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
  payRentalSuccess,
  payRentalFailed,
  confirmPickupSuccess,
  confirmPickupFailed,
  confirmReturnSuccess,
  confirmReturnFailed,
  payPenaltySuccess,
  payPenaltyFailed,
} = borrowSlice.actions;

export default borrowSlice.reducer;
