import { createSlice } from "@reduxjs/toolkit";

const reviewSlice = createSlice({
  name: "reviews",
  initialState: {
    reviews: [],
    loading: false,
    error: null,
  },
  reducers: {
    getReviewsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    getReviewsSuccess: (state, action) => {
      state.loading = false;
      state.reviews = action.payload;
    },
    getReviewsFailed: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    addReviewStart: (state) => {
      state.loading = true;
    },
    addReviewSuccess: (state, action) => {
      state.loading = false;
      state.reviews.push({ ...action.payload, replies: [] });
    },
    addReviewFailed: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateReviewSuccess: (state, action) => {
      const index = state.reviews.findIndex(r => r._id === action.payload._id);
      if (index !== -1) state.reviews[index] = { ...state.reviews[index], ...action.payload };
    },

    deleteReviewSuccess: (state, action) => {
      state.reviews = state.reviews.filter(r => r._id !== action.payload);
    },

    addReplySuccess: (state, action) => {
      const { reviewId } = action.payload;
      const review = state.reviews.find(r => r._id === reviewId);
      if (review) {
        review.replies.push(action.payload);
      }
    },

    updateReplySuccess: (state, action) => {
      const { reviewId, _id } = action.payload;
      const review = state.reviews.find(r => r._id === reviewId);
      if (review) {
        const replyIndex = review.replies.findIndex(rp => rp._id === _id);
        if (replyIndex !== -1) {
          review.replies[replyIndex] = action.payload;
        }
      }
    },

    deleteReplySuccess: (state, action) => {
      const { reviewId, replyId } = action.payload;
      const review = state.reviews.find(r => r._id === reviewId);
      if (review) {
        review.replies = review.replies.filter(rp => rp._id !== replyId);
      }
    },
  },
});

export const {
  getReviewsStart,
  getReviewsSuccess,
  getReviewsFailed,
  addReviewStart,
  addReviewSuccess,
  addReviewFailed,
  updateReviewSuccess,
  deleteReviewSuccess,
  addReplySuccess,
  updateReplySuccess,
  deleteReplySuccess,
} = reviewSlice.actions;

export default reviewSlice.reducer;
