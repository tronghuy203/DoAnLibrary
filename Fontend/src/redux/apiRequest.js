import axios from "axios";
import {
  loginFailed,
  loginStart,
  loginSuccess,
  logoutFailed,
  logoutStart,
  logoutSuccess,
  registerFailed,
  registerStart,
  registerSuccess,
  verifyEmailStart,
  verifyEmailSuccess,
  verifyEmailFailed,
  forgotPasswordStart,
  forgotPasswordSuccess,
  forgotPasswordFailed,
  verifyResetCodeStart,
  verifyResetCodeSuccess,
  verifyResetCodeFailed,
  resetPasswordStart,
  resetPasswordSuccess,
  resetPasswordFailed,
  resendResetCodeStart,
  resendResetCodeSuccess,
  resendResetCodeFailed,
} from "./authSlice";
import {
  getUsersStart,
  getUsersFailed,
  getUsersSuccess,
  deleteUserStart,
  deleteUserFailed,
  deleteUserSuccess,
  updateUserSuccess,
  updateUserFailed,
  updateUserStart,
} from "./userSlice";

export const loginUser = async (user, dispatch, navigate) => {
  dispatch(loginStart());
  try {
    const res = await axios.post("/v1/auth/login", user);
    dispatch(loginSuccess(res.data));
    localStorage.setItem("accessToken", res.data.accessToken);
    if (res.data.admin) {
      navigate("/admin");
    } else {
      navigate("/");
    }
  } catch (err) {
    dispatch(loginFailed());
    throw err;
  }
};

export const googleLogin = async (token, dispatch, navigate) => {
  dispatch(loginStart());
  try {
    const res = await axios.post("/v1/auth/google", { token });
    dispatch(loginSuccess(res.data));
    localStorage.setItem("accessToken", res.data.accessToken);
    if (res.data.admin) {
      navigate("/admin");
    } else {
      navigate("/");
    }
  } catch (err) {
    dispatch(loginFailed());
    throw err;
  }
};
export const facebookLogin = async (data, dispatch, navigate) => {
  dispatch(loginStart());
  try {
    const res = await axios.post("/v1/auth/facebook", data);
    dispatch(loginSuccess(res.data));
    localStorage.setItem("accessToken", res.data.accessToken);
    if (res.data.admin) {
      navigate("/admin");
    } else {
      navigate("/");
    }
  } catch (err) {
    dispatch(loginFailed());
    throw err;
  }
};

export const registerUser = async (user, dispatch, navigate) => {
  dispatch(registerStart());
  try {
    const res = await axios.post("/v1/auth/register", user);
    dispatch(registerSuccess());
    return res.data;
  } catch (err) {
    dispatch(registerFailed());
    throw err;
  }
};

export const forgotPassword = async (email, dispatch) => {
  dispatch(forgotPasswordStart());
  try {
    const res = await axios.post("/v1/auth/forgot-password", { email });
    dispatch(forgotPasswordSuccess());
    return res.data;
  } catch (error) {
    dispatch(forgotPasswordFailed());
    return error.response?.data || { message: "Có lỗi xảy ra." };
  }
};

export const resendResetCode = async (email, dispatch) => {
  dispatch(resendResetCodeStart());
  try {
    const res = await axios.post("/v1/auth/resend-reset-code", { email });
    dispatch(resendResetCodeSuccess());
    return res.data;
  } catch (error) {
    dispatch(resendResetCodeFailed());
    return error.response?.data || { message: "Có lỗi xảy ra." };
  }
};

export const verifyResetCode = async (email, code, dispatch) => {
  dispatch(verifyResetCodeStart());
  try {
    const res = await axios.post("/v1/auth/verify-reset-code", { email, code });
    dispatch(verifyResetCodeSuccess());
    return res.data;
  } catch (error) {
    dispatch(verifyResetCodeFailed());
    return error.response?.data || { message: "Mã OTP không hợp lệ." };
  }
};

export const resetPassword = async (data, dispatch) => {
  dispatch(resetPasswordStart());
  try {
    const res = await axios.post("/v1/auth/reset-password", data);
    dispatch(resetPasswordSuccess());
    return res.data;
  } catch (error) {
    dispatch(resetPasswordFailed());
    throw error.response?.data || { message: "Có lỗi xảy ra." };
  }
};

export const verifyEmail = async (data, dispatch, navigate) => {
  dispatch(verifyEmailStart());
  try {
    await axios.post("/v1/auth/verify-email", data);
    dispatch(verifyEmailSuccess());
    navigate("/login");
  } catch (err) {
    dispatch(verifyEmailFailed());
    throw err;
  }
};

export const resendVerificationCode = async (email) => {
  try {
    const res = await axios.post("/v1/auth/resend-verification", { email });
    return res;
  } catch (err) {
    throw err;
  }
};

export const getAllUsers = async (accessToken, dispatch, axiosJWT) => {
  dispatch(getUsersStart());
  try {
    const res = await axiosJWT.get("/v1/user", {
      headers: { token: `Bearer ${accessToken}` },
    });
    dispatch(getUsersSuccess(res.data));
  } catch (err) {
    dispatch(getUsersFailed());
  }
};

export const updateUser = async (
  userId,
  userData,
  accessToken,
  dispatch,
  axiosJWT
) => {
  try {
    const res = await axiosJWT.put(`/v1/user/${userId}`, userData, {
      headers: { token: `Bearer ${accessToken}` },
    });

    dispatch(updateUserSuccess(res.data));
  } catch (err) {
    console.error("Error updating user", err);
  }
};

export const deleteUser = (userId, accessToken, navigate, axiosJWT) => {
  return async (dispatch) => {
    dispatch(deleteUserStart());
    try {
      const res = await axiosJWT.delete("/v1/user/" + userId, {
        headers: { token: `Bearer ${accessToken}` },
      });

      if (res.data.selfDeleted) {
        dispatch(logoutSuccess());
        navigate("/login");
      } else {
        dispatch(deleteUserSuccess(userId));
      }
    } catch (err) {
      dispatch(deleteUserFailed(err.response?.data));
    }
  };
};

export const updateUserProfile = async (
  userId,
  data,
  accessToken,
  axiosJWT,
  dispatch
) => {
  dispatch(updateUserStart());
  try {
    const res = await axiosJWT.put(`/v1/user/update-profile/${userId}`, data, {
      headers: { token: `Bearer ${accessToken}` },
    });
    dispatch(updateUserSuccess(res.data));
    dispatch(loginSuccess({ ...res.data, accessToken }));
    alert("Cập nhật thành công!");
  } catch (err) {
    dispatch(updateUserFailed());
    alert("Cập nhật thất bại!");
    console.log(err);
  }
};

export const getBorrowHistory = async (userId, accessToken, axiosJWT) => {
  try {
    const res = await axiosJWT.get(`/v1/user/history/${userId}`, {
      headers: { token: `Bearer ${accessToken}` },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching borrow history:", error);
    throw new Error("Không thể lấy lịch sử mượn sách");
  }
};

export const logOut = async (dispatch, id, navigate, accessToken, axiosJWT) => {
  dispatch(logoutStart());
  try {
    await axiosJWT.post("/v1/auth/logout", id, {
      headers: { token: `Bearer ${accessToken}` },
    });
    dispatch(logoutSuccess());
    navigate("/login");
  } catch (err) {
    dispatch(logoutFailed());
  }
};
export const uploadAvatar = async (formData, accessToken, axiosJWT) => {
  try {
    const res = await axiosJWT.post("/v1/user/upload-avatar", formData, {
      headers: {
        token: `Bearer ${accessToken}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};