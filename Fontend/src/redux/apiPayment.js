import { paymentGetFail, paymentGetMonthlyFail, paymentGetMonthlyStart, paymentGetMonthlySuccess, paymentGetStart, paymentGetSuccess } from "./paymentSlice";

export const getRevenueByType = (accessToken, dispatch, axiosJWT) => {
  return async () => {
    dispatch(paymentGetStart());
    try {
      const res = await axiosJWT.get(`${process.env.REACT_APP_SERVER_URL}/v1/payment/revenue-by-type`, {
        headers: { token: `Bearer ${accessToken}` },
      });
      dispatch(paymentGetSuccess(res.data));
      return res.data;
    } catch (err) {
      console.error("Error fetching revenue by type:", err.response?.data || err.message);
      dispatch(paymentGetFail(err.response?.data?.message || err.message));
    }
  };
};

export const getMonthlyRevenue = (accessToken, dispatch, axiosJWT) => {
  return async () => {
    dispatch(paymentGetMonthlyStart());
    try {
      const res = await axiosJWT.get(`${process.env.REACT_APP_SERVER_URL}/v1/payment/revenue-by-monthly`, {
        headers: { token: `Bearer ${accessToken}` },
      });
      dispatch(paymentGetMonthlySuccess(res.data));
      return res.data;
    } catch (err) {
      console.error("Error fetching monthly revenue:", err.response?.data || err.message);
      dispatch(paymentGetMonthlyFail(err.response?.data?.message || err.message));
    }
  };
};