import {
  getMembershipsStart,
  getMembershipsSuccess,
  getMembershipsFailed,
  getMembershipStatusStart,
  getMembershipStatusSuccess,
  getMembershipStatusFailed,
  purchaseMembershipStart,
  purchaseMembershipSuccess,
  purchaseMembershipFailed,
} from "./membershipSlice";

export const getAllMemberships = async (accessToken, dispatch, axiosJWT) => {
  dispatch(getMembershipsStart());
  try {
    const res = await axiosJWT.get(`${process.env.REACT_APP_SERVER_URL}/v1/membership`, {
      headers: { token: `Bearer ${accessToken}` },
    });
    dispatch(getMembershipsSuccess(res.data));
    return res.data;
  } catch (err) {
    dispatch(
      getMembershipsFailed(
        err.response?.data?.message || "Lỗi khi lấy danh sách gói"
      )
    );
    console.error("Lỗi khi lấy danh sách gói:", err);
    return [];
  }
};

export const getMembershipStatus = async (accessToken, dispatch, axiosJWT) => {
  dispatch(getMembershipStatusStart());
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_SERVER_URL}/v1/membership/status`,
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(getMembershipStatusSuccess(res.data));
    return res.data;
  } catch (err) {
    dispatch(
      getMembershipStatusFailed(
        err.response?.data?.message || "Lỗi khi kiểm tra trạng thái gói"
      )
    );
    console.error("Lỗi khi kiểm tra trạng thái gói:", err);
    return null;
  }
};

export const purchaseMembership = async (
  membershipId,
  method,
  accessToken,
  dispatch,
  axiosJWT
) => {
  dispatch(purchaseMembershipStart());
  try {
    const res = await axiosJWT.post(
      `${process.env.REACT_APP_SERVER_URL}/v1/membership/purchase`,
      { membershipId, method },
      {
        headers: { token: `Bearer ${accessToken}` },
      }
    );
    dispatch(purchaseMembershipSuccess(res.data));
    return res.data;
  } catch (err) {
    dispatch(
      purchaseMembershipFailed(err.response?.data?.message || "Lỗi khi mua gói")
    );
    console.error("Lỗi khi mua gói:", err);
    throw err;
  }
};
