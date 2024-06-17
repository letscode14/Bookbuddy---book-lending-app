import axios from "axios";
import { removeError, set500Error, setError } from "../store/slice/errorSlice";

let store;
export const injectStore = (_store) => {
  store = _store;
};

const getStore = () => store;

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const { response } = error;
    const store = getStore();
    if (response) {
      console.log(response);
      if (
        response.status === 401 &&
        response.data?.message === "User Blocked contect admin"
      ) {
        store.dispatch(setError(response.data?.message));
        setTimeout(() => {
          store.dispatch(removeError());
        }, 2000);
      } else if (response.status === 404) {
        alert(404);
      } else if (response.status === 500) {
        store.dispatch(set500Error(response.data.message));
        window.location.href = "/error";
      } else {
        alert("An error occurred. Please try again later.");
      }
    } else {
      alert("Network error. Please check your internet connection.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
