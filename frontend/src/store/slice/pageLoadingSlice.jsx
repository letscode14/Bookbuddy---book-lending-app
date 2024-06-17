import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pageLoading: false,
};

const pageLoadingSlice = createSlice({
  name: "pageLoading",
  initialState,
  reducers: {
    startPageLoading: (state) => {
      state.pageLoading = true;
    },
    stopPageLoading: (state) => {
      state.pageLoading = false;
    },
  },
});

export const { startPageLoading, stopPageLoading } = pageLoadingSlice.actions;

export const selectPageLoading = (state) => state.pageLoading;

export default pageLoadingSlice.reducer;
