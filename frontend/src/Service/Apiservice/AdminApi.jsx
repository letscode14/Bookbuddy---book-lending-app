import axiosInstance from "../api";
import { updateAuthorizationHeader } from "../api";

export const adminLogin = async (adminDetails) => {
  try {
    const response = await axiosInstance.post("/admin/login", {
      adminDetails,
    });
    console.log(response);
    if (response.status == 200) {
      localStorage.setItem("adminAccessToken", response.data.accessToken);
      localStorage.setItem("adminRefreshToken", response.data.refreshToken);
      updateAuthorizationHeader("admin");
      return response;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const getAllusers = async (query = { fetch: "all" }) => {
  try {
    updateAuthorizationHeader("admin");
    const response = await axiosInstance.get("/admin/user/list/", {
      params: query,
    });
    if (response.status == 200) {
      return response.data;
    }
    return false;
  } catch (error) {
    console.log(error);
    false;
  }
};

export const blockUser = async (query = { fetch: "all" }) => {
  try {
    updateAuthorizationHeader("admin");
    const response = await axiosInstance.patch("/admin/user/block", query);

    if (response.status == 200) {
      return response.data.message;
    }
  } catch (error) {
    console.log(error);
  }
};
