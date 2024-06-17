import axios from "axios";
import {
  remove500Error,
  removeError,
  set500Error,
  setError,
} from "../store/slice/errorSlice";

let store;
let accessToken = localStorage.getItem("adminAccessToken");
let refreshPromise = null;
let refreshToken = localStorage.getItem("adminRefreshToken");
export const injectStore = (_store) => {
  store = _store;
};

const getStore = () => store;

const adminAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const updateAuthorizationHeader = () => {
  accessToken = localStorage.getItem("adminAccessToken");
  refreshToken = localStorage.getItem("adminRefreshToken");
  adminAxiosInstance.defaults.headers.common["Authorization"] = accessToken
    ? `Bearer ${accessToken}`
    : undefined;
};
updateAuthorizationHeader();

function retryRequests(error) {
  const { config } = error;
  console.log(refreshToken);

  if (!refreshPromise) {
    refreshPromise = new Promise((resolve, reject) => {
      adminAxiosInstance
        .post("/admin/refresh-token", { refreshToken })
        .then((response) => {
          const { accessToken } = response.data;
          localStorage.setItem("adminAccessToken", accessToken);
          adminAxiosInstance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${accessToken}`;
          config.headers.Authorization = `Bearer ${accessToken}`;
          resolve(adminAxiosInstance(config));
        })
        .catch((err) => {
          reject(err);
        })
        .finally(() => {
          refreshPromise = null;
        });
    });
  }
  return refreshPromise;
}

adminAxiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const { response } = error;
    const store = getStore();
    if (response) {
      if (
        response.status === 401 &&
        response.data?.message === "Admin Blocked, contact super admin"
      ) {
        store.dispatch(setError(response.data?.message));
        setTimeout(() => {
          store.dispatch(removeError());
        }, 2000);
      } else if (
        (response.status == 401 && response.data.message == "Token Expired") ||
        response.data.message == "Token Invalid" ||
        response.data.message == "Token missing"
      ) {
        alert("Admin Token Missing, please try to login");
      } else if (
        response.status == 401 &&
        response.data.message == "AccessToken Expired"
      ) {
        return retryRequests(error);
      } else if (response.status === 404) {
        alert("Admin resource not found");
      } else if (response.status === 500) {
        store.dispatch(set500Error(response.data.message));
        setTimeout(() => {
          store.dispatch(remove500Error());
        }, 5000);
        window.location.href = "/error";
      } else if (response.status === 401) {
        store.dispatch(setError(response.data.message));
        setTimeout(() => {
          store.dispatch(removeError());
        }, 2000);
      }
    } else {
      alert("Network error. Please check your internet connection.");
    }
    return Promise.reject(error);
  }
);

export default adminAxiosInstance;
