import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectToken } from '../store/slice/userAuth'
import { selectAdminToken } from '../store/slice/adminAuth'
import { selectOtpLoginAuth } from '../store/slice/otpLoginAuth'
import { selectState } from '../store/slice/authSlice'

export function SubmitOtpPrivateRoute() {
  const { isAuthForOtp, isOtpForPass } = useSelector((state) => state.otpAuth)
  const { loginOtpToken } = useSelector(selectOtpLoginAuth)

  return isAuthForOtp || loginOtpToken || isOtpForPass ? (
    <Outlet />
  ) : (
    <Navigate to="/login" />
  )
}

export function UserAccessRoutes() {
  const { accessToken } = useSelector(selectToken)
  return accessToken ? <Outlet /> : <Navigate to="/login" />
}

export function UserNotAccessRoutes() {
  const { accessToken } = useSelector(selectToken)
  return accessToken ? <Navigate to="/user/home" /> : <Outlet />
}

export function AdminAccessRoute() {
  const { adminAccessToken } = useSelector(selectAdminToken)
  return adminAccessToken ? <Outlet /> : <Navigate to="/admin/login" />
}

export function AdminNotAccessRoute() {
  const { adminAccessToken } = useSelector(selectAdminToken)
  return adminAccessToken ? <Navigate to="/admin/dashboard" /> : <Outlet />
}

export function ChangePasswordRoute() {
  const { isForPass } = useSelector(selectState)
  return isForPass ? <Outlet /> : <Navigate to="/login" />
}
