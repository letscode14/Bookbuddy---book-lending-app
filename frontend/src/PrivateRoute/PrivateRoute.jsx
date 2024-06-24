import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectToken } from "../store/slice/userAuth";
import { selectAdminToken } from "../store/slice/adminAuth";
import { selectOtpLoginAuth } from "../store/slice/otpLoginAuth";

export function SubmitOtpPrivateRoute() {
  const { isAuthForOtp } = useSelector((state) => state.otpAuth);
  const { loginOtpToken } = useSelector(selectOtpLoginAuth);

  return isAuthForOtp || loginOtpToken ? <Outlet /> : <Navigate to="/login" />;
}

export function UserAccessRoutes() {
  const { accessToken } = useSelector(selectToken);

  return accessToken ? <Outlet /> : <Navigate to="/login" />;
}

export function UserNotAccessRoutes() {
  const { accessToken } = useSelector(selectToken);
  return accessToken ? <Navigate to="/user/home" /> : <Outlet />;
}

export function AdminAccessRoute() {
  const { adminAccessToken } = useSelector(selectAdminToken);
  return adminAccessToken ? <Outlet /> : <Navigate to="/admin/login" />;
}

export function AdminNotAccessRoute() {
  const { adminAccessToken } = useSelector(selectAdminToken);
  return adminAccessToken ? <Navigate to="/admin/dashboard" /> : <Outlet />;
}
