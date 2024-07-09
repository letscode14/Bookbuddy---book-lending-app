import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {
  UserAccessRoutes,
  UserNotAccessRoutes,
} from '../PrivateRoute/PrivateRoute'

import ResetAuthState from '../components/resetAuthState/ResetAuthState'
import Homepage from '../components/UserComponents/Homepage/Homepage'
import Login from '../components/UserComponents/Login/Login'
import { SubmitOtpPrivateRoute } from '../PrivateRoute/PrivateRoute'
import ErrorPrivate from '../PrivateRoute/ErrorPrivate'
import Page500 from '../components/errorPages/Page500'
import Page404 from '../components/errorPages/Page404'
import {
  AdminAccessRoute,
  AdminNotAccessRoute,
} from '../PrivateRoute/PrivateRoute'
import AdminLogin from '../components/AdminComponents/AdminLogin/AdminLogin'
import AdminPages from '../components/AdminComponents/AdminPages/AdminPages'
export default function Pages() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* User routes */}
          <Route element={<UserAccessRoutes />}>
            <Route path="/user/*" element={<Homepage />} />
          </Route>
          <Route element={<UserNotAccessRoutes />}>
            <Route path="/" element={<ResetAuthState />} />
            <Route path="/login" element={<ResetAuthState />} />
            <Route path="/signup" element={<ResetAuthState />} />
            <Route path="/verify-email" element={<ResetAuthState />} />
            <Route path="/register-email" element={<ResetAuthState />} />
          </Route>
          <Route path="/change-password/:id" element={<Login />} />
          <Route element={<SubmitOtpPrivateRoute />}>
            <Route path="/submit-otp" element={<Login />} />
          </Route>

          {/* Error routes */}
          <Route element={<ErrorPrivate />}>
            <Route path="/error" element={<Page500 />} />
          </Route>
          <Route path="*" element={<Page404 />} />

          {/* Admin routes */}

          <Route element={<AdminNotAccessRoute />}>
            <Route path="/admin/login" element={<AdminLogin />} />
          </Route>
          <Route element={<AdminAccessRoute />}>
            <Route path="/admin/*" element={<AdminPages />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}
