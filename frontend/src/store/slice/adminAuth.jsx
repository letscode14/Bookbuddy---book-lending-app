import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  adminAccessToken: null,
  admin: null,
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
  },
});

export const { saveAdmin, removeAdmin } = adminAuthSlice.actions;

export const selectAdminToken = (state) => state.admin;

export default adminAuthSlice.reducer;
