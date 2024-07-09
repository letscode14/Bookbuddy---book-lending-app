import axios from 'axios'
import {
  remove500Error,
  removeError,
  set500Error,
  setCustomError,
} from '../store/slice/errorSlice'
import { removeUser } from '../store/slice/userAuth'
import { stopLoading } from '../store/slice/loadinSlice'
import { showErrorToast } from '../utils/toast'

let store

export const injectStore = (_store) => {
  store = _store
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

export const updateAuthorizationHeader = (tokenType) => {
  let accessToken
  if (tokenType === 'admin') {
    accessToken = localStorage.getItem('adminAccessToken')
  } else {
    accessToken = localStorage.getItem('accessToken')
  }
  axiosInstance.defaults.headers.common['Authorization'] = accessToken
    ? `Bearer ${accessToken}`
    : undefined
}

updateAuthorizationHeader('user')

const setResponseError = (message) => {
  store.dispatch(setCustomError(message))

  setTimeout(() => {
    store.dispatch(removeError())
  }, 1500)
  store.dispatch(stopLoading())
}

axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },

  (error) => {
    const { response, config } = error

    if (response) {
      if (
        response.status === 401 &&
        response.data.message == 'AccessToken Expired'
      ) {
        if (response.data?.token === 'admin') {
          console.log('admin hear')
          localStorage.setItem('adminAccessToken', response.data.accessToken)
        } else {
          console.log('userhaer')
          localStorage.setItem('accessToken', response.data.accessToken)
        }
        config.headers['Authorization'] = `Bearer ${response.data.accessToken}`
        return axiosInstance(config)
      } else if (
        response.status == 403 &&
        response.data.message == 'User is blocked'
      ) {
        showErrorToast('User is blocked please contact admin')
        store.dispatch(removeUser())
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        return Promise.reject(error)
      } else if (response.status == 415) {
        showErrorToast(response.data.message)
      } else if (response.status == 401) {
        setResponseError(response.data.message)
      } else if (response.status == 409) {
        setResponseError(response.data.message)
      } else if (response.status === 500) {
        store.dispatch(set500Error(response.data.message))
        setTimeout(() => {
          store.dispatch(remove500Error())
        }, 5000)
        store.dispatch(stopLoading())

        window.location.href = '/error'
      }

      // } else if (
      //   response.status == 409 &&
      //   response.data.message == "Account already exists"
      // ){
      //   setResponseError(response.data.message)
      // }
      // else if (
      //
      // ) {
      //   localStorage.setItem("accessToken", response.data.accessToken);
      //   console.log("response camed");
      //   config.headers["Authorization"] = `Bearer ${response.data.accessToken}`;
      //   return axiosInstance(config);
      // }
      //  else if (
      //   response.status == 401 &&
      //   response.data.message == "Otp Does not match"
      // ) {
      //   store.dispatch(setCustomError(response.data.message));

      //   setTimeout(() => {
      //     store.dispatch(removeError());
      //   }, 2000);
      //   store.dispatch(stopLoading());
      // } else if (
      //   (response.status == 401 && response.data.message == "Token Expired") ||
      //   response.data.message == "Token Invalid" ||
      //   response.data.message == "Token missing"
      // ) {
      //   alert("Token Missing please try to login");
      //   store.dispatch(stopLoading());
      // } else if (response.status === 500) {
      //   store.dispatch(set500Error(response.data.message));
      //   setTimeout(() => {
      //     store.dispatch(remove500Error());
      //   }, 5000);
      //   store.dispatch(stopLoading());

      //   window.location.href = "/error";
      // } else if (response.status === 401) {
      //   store.dispatch(setCustomError(response.data.message));
      //   setTimeout(() => {
      //     store.dispatch(removeError());
      //   }, 2000);
      //   store.dispatch(stopLoading());
      // } else if (response.status === 409) {
      //   store.dispatch(setCustomError(response.data.message));
      //   setTimeout(() => {
      //     store.dispatch(removeError());
      //   }, 2000);
      //   store.dispatch(stopLoading());
    } else {
      alert('Network error. Please check your internet connection.')
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
