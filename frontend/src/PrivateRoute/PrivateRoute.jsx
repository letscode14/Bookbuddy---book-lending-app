import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export function SubmitOtpPrivateRoute() {
  const { isAuthForOtp } = useSelector((state) => state.otpAuth);

  return isAuthForOtp ? <Outlet /> : <Navigate to="/login" />;
}
