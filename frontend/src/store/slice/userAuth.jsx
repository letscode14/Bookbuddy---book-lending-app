import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  accessToken: null,

  user: null,
  userDetails: {},
};
const userAuthSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    saveToken: (state, action) => {
      state.accessToken = action.payload.accessToken;
    },
    saveUser: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
    },
    removeUser: (state) => {
      state.accessToken = null;
      state.user = null;
      state.userDetails = {};
    },

    setUser: (state, action) => {
      state.user = action.payload;
    },

    saveUserDetails: (state, action) => {
      state.userDetails = action.payload;
    },
  },
});

export const { setUser, saveUserDetails, saveUser, removeUser, saveToken } =
  userAuthSlice.actions;

export const selectToken = (state) => state.user;
export const selecUser = (state) => state.user;
export const selectUserDetails = (state) => state.user;

export default userAuthSlice.reducer;
