import { paymentGetFail, paymentGetStart, paymentGetSuccess } from "./paymentSlice";

export const getRevenueByType = (accessToken, dispatch, axiosJWT) => {
  return async () => {
    dispatch(paymentGetStart());
    try {
      const res = await axiosJWT.get("/v1/payment/revenue-by-type", {
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