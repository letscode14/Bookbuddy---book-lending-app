import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  adminAccessToken: null,
  admin: null,
  adminDetails: [],
};
const adminAuthSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    saveAdmin: (state, action) => {
      state.adminAccessToken = action.payload.adminAccessToken;
      state.admin = action.payload.admin;
    },
    removeAdmin: (state) => {
      state.adminAccessToken = null;
      state.admin = null;
    },

    saveUserDetailsAdmin: (state, action) => {
      state.userDetails = action.payload;
    },
  },
});

export const { saveAdmin, removeAdmin, saveUserDetailsAdmin } =
  adminAuthSlice.actions;

export const selectAdminToken = (state) => state.admin;
export const selectUserDetails = (state) => state.admin;

export default adminAuthSlice.reducer;
