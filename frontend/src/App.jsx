import Login from "./components/UserComponents/Login/Login.jsx";
import Homepage from "./components/UserComponents/Homepage/Homepage.jsx";
import Page404 from "./components/errorPages/Page404.jsx";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import {
  SubmitOtpPrivateRoute,
  UserAccessRoutes,
  UserNotAccessRoutes,
} from "./PrivateRoute/PrivateRoute.jsx";
import ResetAuthState from "./components/resetAuthState/ResetAuthState.jsx";
import { useSelector } from "react-redux";
import { selectPageLoading } from "./store/slice/pageLoadingSlice.jsx";
import LoadingPage from "./components/loadingpage/LoadingPage.jsx";
import Page500 from "./components/errorPages/Page500.jsx";
import ErrorPrivate from "./PrivateRoute/ErrorPrivate.jsx";
import AdminLogin from "./components/AdminComponents/AdminLogin/AdminLogin.jsx";

function App() {
  const { pageLoading } = useSelector(selectPageLoading);
  return pageLoading ? (
    <LoadingPage />
  ) : (
    <BrowserRouter>
      <Routes>
        {/*user routes*/}
        <Route element={<UserAccessRoutes />}>
          <Route path="/user/*" element={<Homepage />}></Route>
        </Route>
        <Route element={<UserNotAccessRoutes />}>
          <Route path="/" element={<ResetAuthState />} />
          <Route path="/login" element={<ResetAuthState />}></Route>
          <Route path="/signup" element={<ResetAuthState />}></Route>
          <Route path="/verify-email" element={<ResetAuthState />}></Route>
          <Route path="/register-email" element={<ResetAuthState />}></Route>
        </Route>

        <Route path="/change-password/:id" element={<Login />}></Route>
        <Route element={<SubmitOtpPrivateRoute />}>
          <Route path="/submit-otp" element={<Login />}></Route>
        </Route>

        {/************************* */}
        {/*Error routes*/}
        <Route element={<ErrorPrivate />}>
          <Route path="/error" element={<Page500 />}></Route>
        </Route>

        <Route path="*" element={<Page404 />} />
        {/* ***************************/}

        {/*Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />}></Route>
        {/*************************** */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
