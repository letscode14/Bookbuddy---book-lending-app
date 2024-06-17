import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  accessToken: null,

  user: null,
};
const userAuthSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    saveUser: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
    },
    removeUser: (state) => {
      state.accessToken = null;
      state.user = null;
    },
  },
});

export const { saveUser, removeUser } = userAuthSlice.actions;

export const selectToken = (state) => state.user;
export const selecUser = (state) => state.user;

export default userAuthSlice.reducer;
