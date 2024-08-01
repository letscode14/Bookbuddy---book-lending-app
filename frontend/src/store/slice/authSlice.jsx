import { createSlice } from '@reduxjs/toolkit'

let initialState = {
  isAuthForOtp: false,
  user: null,
  otpCounter: 59,
  resetTrigger: false,
  isForPass: false,
  isOtpForPass: false,
  isChangePassOtpAfterLogin: null,
  isChangePassAfterLogin: null,
}

const otpAuthSlice = createSlice({
  name: 'otpAuth',
  initialState,
  reducers: {
    otpAuthIn: (state, action) => {
      state.isAuthForOtp = true
      state.user = action.payload
    },
    otpAuthOut: (state, action) => {
      state.isAuthForOtp = false
      state.user = action.payload
    },
    decrementOtpCounter: (state) => {
      if (state.otpCounter > 0) {
        state.otpCounter -= 1
      }
    },
    resetOtpCounter: (state) => {
      state.otpCounter = 59
      state.resetTrigger = true
    },
    resetAuthState: (state) => {
      state.isAuthForOtp = initialState.isAuthForOtp
      state.otpCounter = initialState.otpCounter
      state.user = initialState.user
      state.isOtpForPass = initialState.isOtpForPass
      state.isForPass = initialState.isForPass
      state.isChangePassAfterLogin = initialState.isChangePassAfterLogin
      state.isChangePassOtpAfterLogin = initialState.isChangePassOtpAfterLogin
    },
    saveChangePassToken: (state, action) => {
      state.isForPass = action.payload
    },

    saveChangePassOtp: (state, action) => {
      state.isOtpForPass = action.payload
    },
    changePassOtpOut: (state, action) => {
      state.isOtpForPass = initialState.isOtpForPass
    },
    saveChangePassOtpTokenAfterLogin: (state, action) => {
      state.isChangePassOtpAfterLogin = action.payload
    },

    saveChangePassOtpTokenAfterLoginOut: (state, action) => {
      state.isChangePassOtpAfterLogin = initialState.isChangePassOtpAfterLogin
    },

    saveChangePassTokenAfterLogin: (state, action) => {
      state.isChangePassAfterLogin = action.payload
    },
    resetChangepassAfterLogin: (state) => {
      state.isChangePassAfterLogin = initialState.isChangePassAfterLogin
      state.isChangePassOtpAfterLogin = initialState.isChangePassOtpAfterLogin
    },
  },
})

export const {
  resetChangepassAfterLogin,
  saveChangePassTokenAfterLogin,
  saveChangePassOtpTokenAfterLogin,
  saveChangePassOtpTokenAfterLoginOut,
  resetAuthState,
  resetOtpCounter,
  otpAuthOut,
  otpAuthIn,
  decrementOtpCounter,
  saveChangePassOtp,
  saveChangePassToken,
  changePassOtpOut,
} = otpAuthSlice.actions

export const selectState = (state) => state.otpAuth
export const SelectOtpCounter = (state) => state.otpAuth

export default otpAuthSlice.reducer
