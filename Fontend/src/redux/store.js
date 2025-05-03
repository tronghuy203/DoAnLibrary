import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import userReducer from "./userSlice";
import bookReducer from "./bookSlice";
import documentReducer from "./documentSlice";
import reviewReducer from "./reviewSlice";
import categoryReducer from "./categorySlice";
import borrowReducer from "./borrowSlice";
import membershipReducer from "./membershipSlice";
import chatReducer from "./chatSlice";
import paymentReducer from "./paymentSlice";
import chatbotReducer from "./chatbotSlice";

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
};
const rootReducer = combineReducers({
  auth: authReducer,
  users: userReducer,
  books: bookReducer,
  document: documentReducer,
  reviews: reviewReducer,
  categories: categoryReducer,
  borrow: borrowReducer,
  membership: membershipReducer,
  chat: chatReducer,
  payment: paymentReducer,
  chatbot: chatbotReducer
});
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export let persistor = persistStore(store);
