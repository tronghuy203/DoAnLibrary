import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name:"user",
    initialState:{
        users:{
            allUsers: null,
            isFetching: false,
            error: false
        },
        msg:"",
    },
    reducers: {
        getUsersStart: (state) =>{
            state.users.isFetching = true;
        },
        getUsersSuccess: (state,action) =>{
            state.users.isFetching= false;
            state.users.allUsers = action.payload;
        },
        getUsersFailed: (state) =>{
            state.users.isFetching = false;
            state.users.error = true;
        },
        updateUserStart: (state) => {
            state.users.isFetching = true;
        },
        updateUserSuccess: (state, action) => {
            state.users.allUsers = state.users.allUsers.map(user =>
                user._id === action.payload._id ? action.payload : user
            );
            state.isFetching = false;
            if (state.auth?.login?.currentUser?._id === action.payload._id) {
                state.auth.login.currentUser = action.payload;
            }
        },
        
        updateUserFailed: (state) => {
            state.users.isFetching = false;
            state.users.error = true;
        },        
        deleteUserStart: (state) =>{
            state.users.isFetching = true;
        },
        deleteUserSuccess: (state,action) =>{
            state.users.allUsers = state.users.allUsers.filter(user => user._id !== action.payload);
        },
        deleteUserFailed: (state,action) =>{
            state.users.isFetching = false;
            state.users.error = true;
            state.msg = action.payload;
        }
    }
})


export const{
    getUsersStart, getUsersSuccess, getUsersFailed,
    deleteUserStart, deleteUserSuccess, deleteUserFailed,
    updateUserStart, updateUserSuccess, updateUserFailed
} = userSlice.actions;

export default userSlice.reducer;