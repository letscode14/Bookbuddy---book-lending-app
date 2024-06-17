import { combineReducers, configureStore } from "@reduxjs/toolkit";

import { persistReducer, persistStore } from "redux-persist";

import otpAuthReducer from "./slice/authSlice";
import loadinSlice from "./slice/loadinSlice";
import { encryptTransform } from "redux-persist-transform-encrypt";
import storage from "redux-persist/lib/storage";
import pageLoadingSlice from "./slice/pageLoadingSlice";
import errorSlice from "./slice/errorSlice";
import userAuth from "./slice/userAuth";
import adminAuth from "./slice/adminAuth";

const persistConfig = {
  key: "root",
  version: 1,
  storage: storage,
  transform: [
    encryptTransform({
      secretKey: "jaskbjkbadjbvjsbdvjdbs",
      onError: (error) => {
        console.log(error);
      },
    }),
  ],
};

const rootReducer = combineReducers({
  otpAuth: otpAuthReducer,
  loading: loadinSlice,
  pageLoading: pageLoadingSlice,
  customError: errorSlice,
  user: userAuth,
  admin: adminAuth,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
