import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  decrementOtpCounter,
  resetOtpCounter,
} from "../../../store/slice/authSlice";
import axiosInstance from "../../../api/axios";
import { useNavigate } from "react-router-dom";
import {
  selectLoading,
  startLoading,
  stopLoading,
} from "../../../store/slice/loadinSlice";
export default function Submitotp() {
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [data, setOtp] = useState({});
  const { isLoading } = useSelector(selectLoading);
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
    await axiosInstance
      .post("/user/create-user", data)
      .then((response) => {
        if (response.status == 200) {
          dispatch(stopLoading());
          setErrorMessages(response.data.message, 2);
          navigate("/login");
        }
      })
      .catch((error) => {
        dispatch(stopLoading());
        setErrorMessages(error.response.data.message, 2);
      });
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
  const handleResendOtp = async (e) => {
    try {
      e.preventDefault();
      dispatch(startLoading());
      const response = await axiosInstance.get("/user/resendotp");
      if (response.status == 200) {
        dispatch(stopLoading());
        setError(2);
        dispatch(resetOtpCounter());
        setErrorMessages(response.data.message, 2);

        return;
      }
    } catch (error) {
      dispatch(stopLoading());
      setErrorMessages(error.response.data.message, 2);
    }
  };
  return (
    <form className="w-full">
      <h1 className="text-3xl font-bold mb-2">Submit OTP</h1>

      <div className="w-full">
        <div
          className={`pb-1 text-xs text-red-500 transition-opacity duration-500 ${
            error == 2 ? "" : "opacity-0"
          }`}
        >
          {errorMsg ? errorMsg : "Enter the otp"}
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
