import axios from "axios";
import {loginFailed, loginStart,loginSuccess, logoutFailed, logoutStart, logoutSuccess, registerFailed, registerStart, registerSuccess,verifyEmailStart,verifyEmailSuccess,verifyEmailFailed} from "./authSlice";
import { getUsersStart,getUsersFailed, getUsersSuccess, deleteUserStart, deleteUserFailed, deleteUserSuccess, updateUserSuccess } from "./userSlice";


export const loginUser = async(user,dispatch,navigate) =>{
    dispatch(loginStart());
    try{
        const res = await axios.post("/v1/auth/login", user);
        dispatch(loginSuccess(res.data));
        localStorage.setItem("accessToken", res.data.accessToken);
        if (res.data.admin) {
            navigate("/admin");
          } else {
            navigate("/");
          }
    }catch(err){
        dispatch(loginFailed())
        throw err;
    }
}


export const registerUser = async(user, dispatch, navigate)=>{
    dispatch(registerStart());
    try{
        await axios.post("/v1/auth/register",user);
        dispatch(registerSuccess());
    }catch(err){
        dispatch(registerFailed());

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

export const getAllUsers = async(accessToken, dispatch, axiosJWT) =>{
    dispatch(getUsersStart());
    try{
        const res= await axiosJWT.get("/v1/user",{
            headers: {token: `Bearer ${accessToken}`},
        });
        dispatch(getUsersSuccess(res.data));
    }catch(err){
        dispatch(getUsersFailed());
    }
}

export const updateUser = async (userId, userData, accessToken, dispatch, axiosJWT) => {
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

export const logOut = async(dispatch,id,navigate,accessToken,axiosJWT) =>{
    dispatch(logoutStart());
    try {
        await axiosJWT.post("/v1/auth/logout",id,{
            headers: {token: `Bearer ${accessToken}`}
        });
        dispatch(logoutSuccess());
        navigate("/login");
    } catch (err) {
        dispatch(logoutFailed())
    }

}