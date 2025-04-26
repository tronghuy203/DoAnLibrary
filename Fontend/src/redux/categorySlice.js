import { createSlice } from "@reduxjs/toolkit";

const categorySlice = createSlice({
  name: "categories",
  initialState: {
    allCategories: [],
    isFetching: false,
    error: false,
  },
  reducers: {
    getCategoryStart: (state) => {
      state.isFetching = true;
    },
    getCategorySuccess: (state, action) => {
      state.isFetching = false;
      state.allCategories = action.payload;
      state.error = false;
    },
    getCategoryFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    createCategoryStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    createCategorySuccess: (state, action) => {
      state.isFetching = false;
      state.allCategories.push(action.payload);
    },
    createCategoryFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    updateCategoryStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    updateCategorySuccess: (state, action) => {
      state.isFetching = false;
      state.allCategories = state.allCategories.map((cat) =>
        cat._id === action.payload._id ? action.payload : cat
      );
    },
    updateCategoryFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    deleteCategoryStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    deleteCategorySuccess: (state, action) => {
      state.isFetching = false;
      state.allCategories = state.allCategories.filter(
        (cat) => cat._id !== action.payload
      );
    },
    deleteCategoryFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },
  },
});

export const {
  getCategoryStart,
  getCategorySuccess,
  getCategoryFailed,
  createCategoryStart,
  createCategorySuccess,
  createCategoryFailed,
  updateCategoryStart,
  updateCategorySuccess,
  updateCategoryFailed,
  deleteCategoryStart,
  deleteCategorySuccess,
  deleteCategoryFailed,
} = categorySlice.actions;

export default categorySlice.reducer;
