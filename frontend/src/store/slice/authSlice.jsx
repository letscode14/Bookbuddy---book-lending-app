import { createSlice } from "@reduxjs/toolkit";

let initialState = {
  isAuthForOtp: false,
  user: null,
  otpCounter: 59,
};

const otpAuthSlice = createSlice({
  name: "otpAuth",
  initialState,
  reducers: {
    otpAuthIn: (state, action) => {
      state.isAuthForOtp = true;
      state.user = action.payload;
    },
    otpAuthOut: (state, action) => {
      state.isAuthForOtp = false;
      state.user = action.payload;
    },
    decrementOtpCounter: (state) => {
      if (state.otpCounter > 0) {
        state.otpCounter -= 1;
      }
    },
    resetOtpCounter: (state) => {
      state.otpCounter = 59;
    },
    resetAuthState: (state) => {
      state.isAuthForOtp = initialState.isAuthForOtp;
      state.otpCounter = initialState.otpCounter;
      state.user = initialState.user;
    },
  },
   
  

});

export const {
  resetAuthState,
  resetOtpCounter,
  otpAuthOut,
  otpAuthIn,
  decrementOtpCounter,
} = otpAuthSlice.actions;

export const selectState = (state) => state.otpAuth;
export const SelectOtpCounter = (state) => state.otpAuth;

export default otpAuthSlice.reducer;
