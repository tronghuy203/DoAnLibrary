import { createSlice } from "@reduxjs/toolkit";

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    revenueByType: {
      rental_fee: 0,
      penalty: 0,
      membership: 0,
    },
    monthlyRevenue: [],
    isFetching: false,
    error: null,
  },
  reducers: {
    paymentGetStart: (state) => {
      state.isFetching = true;
      state.error = null;
    },
    paymentGetSuccess: (state, action) => {
      state.revenueByType = action.payload;
      state.isFetching = false;
    },
    paymentGetFail: (state, action) => {
      state.isFetching = false;
      state.error = action.payload;
    },
    paymentGetMonthlyStart: (state) => {
      state.isFetching = true;
      state.error = null;
    },
    paymentGetMonthlySuccess: (state, action) => {
      state.monthlyRevenue = action.payload;
      state.isFetching = false;
    },
    paymentGetMonthlyFail: (state, action) => {
      state.isFetching = false;
      state.error = action.payload;
    },
  },
});

export const {
  paymentGetStart,
  paymentGetSuccess,
  paymentGetFail,
  paymentGetMonthlyStart,
  paymentGetMonthlySuccess,
  paymentGetMonthlyFail,
} = paymentSlice.actions;
export default paymentSlice.reducer;
