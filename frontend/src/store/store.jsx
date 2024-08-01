import { combineReducers, configureStore } from '@reduxjs/toolkit'

import { persistReducer, persistStore } from 'redux-persist'

import otpAuthReducer from './slice/authSlice'
import loadinSlice from './slice/loadinSlice'
import { encryptTransform } from 'redux-persist-transform-encrypt'
import storage from 'redux-persist/lib/storage'
import errorSlice from './slice/errorSlice'
import userAuth from './slice/userAuth'
import adminAuth from './slice/adminAuth'
import otpLoginAuth from './slice/otpLoginAuth'
import VerifyEmailAuth from './slice/VerifyEmailAuth'
import messageQue from './slice/messageQue'

const persistConfig = {
  key: 'root',
  version: 1,
  storage: storage,
  transform: [
    encryptTransform({
      secretKey: 'jaskbjkbadjbvjsbdvjdbs',
      onError: (error) => {
        console.log(error)
      },
    }),
  ],
}

const rootReducer = combineReducers({
  msg: messageQue,
  otpAuth: otpAuthReducer,
  loading: loadinSlice,
  customError: errorSlice,
  user: userAuth,
  admin: adminAuth,
  loginOtpAuth: otpLoginAuth,
  editAuth: VerifyEmailAuth,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export const persistor = persistStore(store)
