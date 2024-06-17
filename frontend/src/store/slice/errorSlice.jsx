import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  customError: null,
  error500: null,
};

const errorSlice = createSlice({
  name: "customError",
  initialState,
  reducers: {
    setError: (state, action) => {
      state.customError = action.payload;
    },
    removeError: (state) => {
      state.customError = null;
    },
    set500Error: (state, action) => {
      state.error500 = action.payload;
    },
    remove500Error: (state) => {
      state.error500 = null;
    },
  },
});

export const { set500Error, remove500Error, setError, removeError } =
  errorSlice.actions;

export const selectError = (state) => state.customError;

export default errorSlice.reducer;
