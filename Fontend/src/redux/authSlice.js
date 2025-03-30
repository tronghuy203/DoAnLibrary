
import {createSlice} from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        login: {
            currentUser: null,
            isFetching: false,
            error: false
        },
        register: {
            isFetching: false,
            error: false,
            success: false
        },
        verifyEmail: {
            isFetching: false,
            error: false,
            success: false
        },
        forgotPassword: {
            isFetching: false,
            success: false,
            error: false,
        },
        verifyResetCode: { 
            isFetching: false,
            error: false,
            success: false
        },
        resetPassword: {
            isFetching: false,
            success: false,
            error: false,
        }
    },
    reducers: {
        loginStart: (state) => {
            state.login.isFetching = true;
        },
        loginSuccess: (state, action) => {
            state.login.isFetching = false;
            state.login.currentUser = action.payload;
            state.login.error = false;
        },
        loginFailed: (state) => {
            state.login.isFetching = false;
            state.login.error = true;
        },
        registerStart: (state) => {
            state.register.isFetching = true;
        },
        registerSuccess: (state) => {
            state.register.isFetching = false;
            state.register.error = false;
            state.register.success = true;
        },
        registerFailed: (state) => {
            state.register.isFetching = false;
            state.register.error = true;
            state.register.success = false;
        },
        forgotPasswordStart: (state) => {
            state.forgotPassword.isFetching = true;
        },
        forgotPasswordSuccess: (state) => {
            state.forgotPassword.isFetching = false;
            state.forgotPassword.success = true;
            state.forgotPassword.error = false;
        },
        forgotPasswordFailed: (state) => {
            state.forgotPassword.isFetching = false;
            state.forgotPassword.error = true;
        },
        verifyResetCodeStart: (state) => {
            state.verifyResetCode.isFetching = true;
        },
        verifyResetCodeSuccess: (state) => {
            state.verifyResetCode.isFetching = false;
            state.verifyResetCode.success = true;
            state.verifyResetCode.error = false;
        },
        verifyResetCodeFailed: (state) => {
            state.verifyResetCode.isFetching = false;
            state.verifyResetCode.success = false;
            state.verifyResetCode.error = true;
        },
        resetPasswordStart: (state) => {
            state.resetPassword.isFetching = true;
        },
        resetPasswordSuccess: (state) => {
            state.resetPassword.isFetching = false;
            state.resetPassword.success = true;
            state.resetPassword.error = false;
        },
        resetPasswordFailed: (state) => {
            state.resetPassword.isFetching = false;
            state.resetPassword.error = true;
        },
        verifyEmailStart: (state) => {
            state.verifyEmail.isFetching = true;
        },
        verifyEmailSuccess: (state) => {
            state.verifyEmail.isFetching = false;
            state.verifyEmail.error = false;
            state.verifyEmail.success = true;
        },
        verifyEmailFailed: (state) => {
            state.verifyEmail.isFetching = false;
            state.verifyEmail.error = true;
            state.verifyEmail.success = false;
        },
        logoutStart: (state) => {
            state.login.isFetching = true;
        },
        logoutSuccess: (state) => {
            state.login.isFetching = false;
            state.login.currentUser = null;
            state.login.error = false;
        },
        logoutFailed: (state) => {
            state.login.isFetching = false;
            state.login.error = true;
        },
    }
});

export const {
    loginStart,
    loginFailed,
    loginSuccess,
    registerStart,
    registerSuccess,
    registerFailed,
    forgotPasswordStart,
    forgotPasswordSuccess,
    forgotPasswordFailed,
    verifyResetCodeStart,
    verifyResetCodeSuccess,
    verifyResetCodeFailed,
    resetPasswordStart,
    resetPasswordSuccess,
    resetPasswordFailed,
    verifyEmailStart,
    verifyEmailSuccess,
    verifyEmailFailed,
    logoutStart,
    logoutSuccess,
    logoutFailed
} = authSlice.actions;

export default authSlice.reducer;
