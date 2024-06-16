import Login from "./components/UserComponents/Login/Login.jsx";
import Homepage from "./components/UserComponents/Homepage/Homepage.jsx";
import Page404 from "./components/page404/Page404.jsx";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { SubmitOtpPrivateRoute } from "./PrivateRoute/PrivateRoute.jsx";
import ResetAuthState from "./components/resetAuthState/ResetAuthState.jsx";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/user/*" element={<Homepage />}></Route>

        <Route path="/" element={<ResetAuthState />} />
        <Route path="/login" element={<ResetAuthState />}></Route>
        <Route path="/signup" element={<ResetAuthState />}></Route>
        <Route path="/verify-email" element={<ResetAuthState />}></Route>
        <Route path="/register-email" element={<ResetAuthState />}></Route>
        <Route path="/change-password/:id" element={<Login />}></Route>
        <Route element={<SubmitOtpPrivateRoute />}>
          <Route path="/submit-otp" element={<Login />}></Route>
        </Route>
        <Route path="*" element={<Page404 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
