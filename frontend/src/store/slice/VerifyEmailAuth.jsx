import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  emailToken: null,
  isVerified: false,
};

const verifyEmailAuth = createSlice({
  name: "editAuth",
  initialState,
  reducers: {
    saveEmailToken: (state, action) => {
      state.emailToken = action.payload.emailToken;
    },
    setVerify: (state) => {
      state.isVerified = true;
    },
    setVerifyFalse: (state) => {
      state.isVerified = false;
    },
  },
});

export const { setVerifyFalse, saveEmailToken, setVerify } =
  verifyEmailAuth.actions;
export const selectEditState = (state) => state.editAuth;

export default verifyEmailAuth.reducer;
