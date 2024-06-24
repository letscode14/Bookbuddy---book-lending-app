import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loginOtpToken: false,
};

const loginOtpAuth = createSlice({
  name: "loginOtpAuth",
  initialState,
  reducers: {
    setOtpToken: (state, action) => {
      state.loginOtpToken = action.payload;
    },
    removeOtpToken: (state) => {
      state.loginOtpToken = false;
    },
  },
});

export const { setOtpToken, removeOtpToken } = loginOtpAuth.actions;

export const selectOtpLoginAuth = (state) => state.loginOtpAuth;

export default loginOtpAuth.reducer;
