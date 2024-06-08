/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useNavigate, Route, Routes, useLocation } from "react-router-dom";

import LoginForm from "./LoginForm/LoginForm";

import "./Login.css";
import Logo from "/images/Logo.png";
import bookImage from "/images/transparent-hygge-life-reading-armchair-fireplace-book-man-reading-by-fireplace-in-cozy-room659efcbbbe9d95.2777358317049182037808.png";
import SignupForm from "../Signup/SignupForm/SignupForm";
import ForgotPassform from "./ForgotPassform/ForgotPassform";
import LoginOtpForm from "./LoginOtpForm/LoginOtpForm";
import ChangePassword from "./ChangePasswordForm/ChangePassword";
import Submitotp from "../submitOtp/Submitotp";

export default function Login() {
  const [isActive, setActive] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    switch (pathname) {
      case "/verify-email":
        setActive(true);
        break;
      case "/login":
        setActive(false);
        break;
      case "/register-email":
        setActive(true);
        break;
      case "/change-password":
        setActive(false);
        break;
      case "/submit-otp":
        setActive(false);
        break;
      case "/signup":
        setActive(true);
        break;
    }
  }, [pathname]);

  const navigate = useNavigate();

  return (
    <div className="login-signup-container">
      <img src={Logo} alt="" className="absolute top-0 left-0 h-16 ms-4 mt-4" />
      <div
        className={`container-full ${isActive ? "active" : ""}`}
        id="container"
      >
        <div className="form-container   flex items-center sign-up">
          <Routes>
            <Route path="/signup" element={<SignupForm />}></Route>
            <Route path="/verify-email" element={<ForgotPassform />}></Route>
            <Route path="/register-email" element={<LoginOtpForm />}></Route>
          </Routes>
        </div>

        <div
          className={`form-container ${
            isActive ? "hidden" : ""
          }  flex items-center sign-in`}
        >
          <Routes>
            <Route path="/login" element={<LoginForm />}></Route>
            <Route path="/submit-otp" element={<Submitotp />}></Route>
            <Route path="/change-password" element={<ChangePassword />}></Route>
          </Routes>
        </div>

        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-right">
              <h1 className="font-medium  text-2xl">Welcome Back!</h1>
              <h1 className="font-normal text-sm">
                Make a difference even from a distance
              </h1>
              <div>
                <img className="h-44 my-3" src={bookImage} alt="" />
              </div>
              <button
                onClick={() => {
                  setActive(true);
                  navigate("/signup");
                }}
                className="hidden-signup-button border hover:text-black  h-10 w-28 rounded-lg text-xs font-semibold hover:bg-[#ffffff] duration-500"
                id="register"
              >
                SIGN UP
              </button>
            </div>
            <div className="toggle-panel toggle-left">
              <h1 className="font-medium  text-2xl">Hello, Friend!</h1>
              <label className="text-sm">
                Register with your personal details to use all of site features
              </label>
              <div>
                <img className="h-44 my-3" src={bookImage} alt="" />
              </div>
              <button
                onClick={() => {
                  setActive(false);
                  navigate("/login");
                }}
                className=" hidden-signin-button  border hover:text-black  h-10 w-28 rounded-lg text-xs font-semibold hover:bg-[#ffffff] duration-500"
                id="login"
              >
                SIGN IN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
