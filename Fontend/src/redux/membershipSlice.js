import { createSlice } from "@reduxjs/toolkit";

const membershipSlice = createSlice({
  name: "membership",
  initialState: {
    memberships: [],
    currentMembership: null,
    isFetching: false,
    error: null,
    purchaseStatus: null,
  },
  reducers: {
    getMembershipsStart(state) {
      state.isFetching = true;
      state.error = null;
    },
    getMembershipsSuccess(state, action) {
      state.isFetching = false;
      state.memberships = action.payload;
    },
    getMembershipsFailed(state, action) {
      state.isFetching = false;
      state.error = action.payload;
    },
    getMembershipStatusStart(state) {
      state.isFetching = true;
      state.error = null;
    },
    getMembershipStatusSuccess(state, action) {
      state.isFetching = false;
      state.currentMembership = action.payload;
    },
    getMembershipStatusFailed(state, action) {
      state.isFetching = false;
      state.error = action.payload;
    },
    purchaseMembershipStart(state) {
      state.isFetching = true;
      state.error = null;
      state.purchaseStatus = null;
    },
    purchaseMembershipSuccess(state, action) {
      state.isFetching = false;
      state.purchaseStatus = action.payload;
    },
    purchaseMembershipFailed(state, action) {
      state.isFetching = false;
      state.error = action.payload;
      state.purchaseStatus = null;
    },
  },
});

export const {
  getMembershipsStart,
  getMembershipsSuccess,
  getMembershipsFailed,
  getMembershipStatusStart,
  getMembershipStatusSuccess,
  getMembershipStatusFailed,
  purchaseMembershipStart,
  purchaseMembershipSuccess,
  purchaseMembershipFailed,
} = membershipSlice.actions;

export default membershipSlice.reducer;