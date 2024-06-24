import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  decrementOtpCounter,
  otpAuthOut,
  resetOtpCounter,
} from "../../../store/slice/authSlice";
import { useNavigate } from "react-router-dom";
import {
  selectLoading,
  startLoading,
  stopLoading,
} from "../../../store/slice/loadinSlice";
import {
  removeOtpToken,
  selectOtpLoginAuth,
  setOtpToken,
} from "../../../store/slice/otpLoginAuth";
import { saveUser } from "../../../store/slice/userAuth";
import { resendOtp, submitOtp } from "../../../Service/Apiservice/UserApi";
import { selectError } from "../../../store/slice/errorSlice";
export default function Submitotp() {
  const [error, setError] = useState(false);
  const { loginOtpToken } = useSelector(selectOtpLoginAuth);
  const [errorMsg, setErrorMsg] = useState("");
  const [data, setOtp] = useState({});
  const { isLoading } = useSelector(selectLoading);
  const { customError } = useSelector(selectError);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const otpCounter = useSelector((state) => state.otpAuth.otpCounter);
  useEffect(() => {
    if (otpCounter === 0) {
      setError(2);
      setErrorMsg("Times up hit resend");
      return;
    }

    const interval = setInterval(() => {
      dispatch(decrementOtpCounter());
    }, 1000);

    return () => clearInterval(interval);
  }, [dispatch, otpCounter]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.entries(data).length != 1 || data.otp == "") {
      setError(2);
      setTimeout(() => {
        setError(0);
      }, 1500);
      return;
    }
    dispatch(startLoading());
    const obj = {
      token: loginOtpToken,
      otp: data.otp,
    };

    const response = await submitOtp(
      loginOtpToken ? "/user/otp/login" : "/user/create-user",
      loginOtpToken ? obj : data
    );
    if (response?.status == true) {
      dispatch(stopLoading());
      dispatch(otpAuthOut());
      loginOtpToken ? dispatch(removeOtpToken()) : dispatch(otpAuthOut());
      dispatch(
        saveUser({
          user: response.user,
          accessToken: response.token,
        })
      );

      navigate("/user/home");
    }
  };

  function setErrorMessages(message, code) {
    setErrorMsg(message);
    setError(code);
    setTimeout(() => {
      setError(0);
    }, 1500);
    setTimeout(() => {
      setErrorMsg("");
    }, 1800);
  }
  useEffect(() => {
    document.title = "Submit otp";
  }, []);
  const handleResendOtp = async (e) => {
    try {
      e.preventDefault();
      dispatch(startLoading());
      const response = await resendOtp();
      if (response?.status == true) {
        console.log("h");

        dispatch(resetOtpCounter());
        dispatch(stopLoading());
        setError(2);
        setErrorMessages(response.message, 2);
        loginOtpToken ? dispatch(setOtpToken(response.activationToken)) : "";
      }
    } catch (error) {
      dispatch(stopLoading());
    }
  };

  return (
    <form className="w-full">
      <h1 className="text-3xl font-bold mb-2">Submit OTP</h1>

      <div className="w-full">
        <div className="flex justify-between">
          <div
            className={`pb-1 text-xs text-red-500 transition-opacity duration-500 ${
              error == 2 ? "" : "opacity-0"
            }`}
          >
            {errorMsg ? errorMsg : "Enter the otp"}
          </div>{" "}
          <div
            className={`pb-1 text-xs text-red-500 transition-opacity duration-500 ${
              customError ? "" : "opacity-0"
            }`}
          >
            {customError}
          </div>
        </div>

        <input
          onChange={(e) => setOtp({ otp: e.target.value.trim() })}
          placeholder="Enter your otp"
        ></input>

        <div
          className={` text-xs text-red-500 transition-opacity duration-500 ${
            error == 1 ? " " : "opacity-0"
          }`}
        >
          Enter a valide
        </div>
      </div>
      <div className="text-sm font-medium">00:{otpCounter}</div>
      {otpCounter == 0 ? (
        <button
          disabled={isLoading}
          onClick={handleResendOtp}
          className="signup-button flex justify-center items-center"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-white-900"></div>
          ) : (
            "RESEND"
          )}
        </button>
      ) : (
        <button
          disabled={isLoading}
          onClick={handleSubmit}
          className="signup-button flex justify-center items-center"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-white-900"></div>
          ) : (
            "Submit"
          )}
        </button>
      )}
    </form>
  );
}
