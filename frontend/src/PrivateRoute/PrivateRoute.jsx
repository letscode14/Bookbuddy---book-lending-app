import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectToken } from "../store/slice/userAuth";

export function SubmitOtpPrivateRoute() {
  const { isAuthForOtp } = useSelector((state) => state.otpAuth);

  return isAuthForOtp ? <Outlet /> : <Navigate to="/login" />;
}

export function UserAccessRoutes() {
  const { accessToken } = useSelector(selectToken);

  return accessToken ? <Outlet /> : <Navigate to="/login" />;
}

export function UserNotAccessRoutes() {
  const { accessToken } = useSelector(selectToken);
  return accessToken ? <Navigate to="/user/home" /> : <Outlet />;
}
