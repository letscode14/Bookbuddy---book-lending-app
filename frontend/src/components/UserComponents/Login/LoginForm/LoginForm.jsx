import googleLogo from "/images/google-logo-9808.png";
import otpLogo from "/images/email.png";
import "./LoginForm.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

//font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

//validation functions
import {
  validateEmail,
  validatePassword,
} from "../../../../../helpers/ValidationHelpers/ValidationHelper";
//
export default function LoginForm() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({});
  const [error, setError] = useState(0);
  const [passwordError, setPassError] = useState("");
  const [passView, setPassView] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      Object.entries(userDetails).length !== 2 ||
      Object.values(userDetails).some((value) => value == "")
    ) {
      setError(3);
      setTimeout(() => {
        setError(0);
      }, 1500);

      return;
    }
    if (!validateEmail(userDetails.email)) {
      setError(1);
      setTimeout(() => {
        setError(0);
      }, 1500);
      return;
    }

    const pass = validatePassword(userDetails.password);
    if (pass !== true) {
      setPassError(pass);
      setError(2);
      setTimeout(() => {
        setError(0);
        setPassError("");
      }, 1500);
      return;
    }
  };
  return (
    <form className="w-full">
      <h1 className="text-3xl font-bold mb-2">Sign In</h1>

      <div className="w-full">
        <div
          className={` pt-1 text-xs text-red-500 transition-opacity duration-500 ${
            error == 3 ? "" : "opacity-0"
          }`}
        >
          Fill all the fields
        </div>

        <input
          onChange={(e) =>
            setUserDetails({ ...userDetails, email: e.target.value.trim() })
          }
          placeholder="Email"
        ></input>

        <div
          className={`pb-1 text-xs text-red-500 transition-opacity duration-500 ${
            error == 1 ? "" : "opacity-0"
          }`}
        >
          Enter a valid email
        </div>
      </div>
      <div className="w-full relative">
        <input
          type={passView ? "text" : "password"}
          onChange={(e) =>
            setUserDetails({ ...userDetails, password: e.target.value.trim() })
          }
          placeholder="Password"
        />
        {passView ? (
          <FontAwesomeIcon
            onClick={() => setPassView(false)}
            icon={faEye}
            className="size-4 text-[#828282] absolute top-3 right-3"
          />
        ) : (
          <FontAwesomeIcon
            onClick={() => setPassView(true)}
            icon={faEyeSlash}
            className="size-4 text-[#828282] absolute top-3 right-3"
          />
        )}
      </div>

      <div className=" text-sm flex w-full justify-between ">
        <div
          className={` py-1 text-xs text-red-500 transition-opacity duration-500 ${
            error == 2 ? "" : "opacity-0"
          }`}
        >
          {passwordError}
        </div>
        <div
          onClick={() => {
            navigate("/verify-email");
          }}
          className={`cursor-pointer ${error == 2 ? "hidden" : ""}`}
        >
          Forget your password?
        </div>
      </div>
      <button onClick={handleSubmit} className="sign-in-button">
        Sign In
      </button>
      <div className="w-full text-center py-1">
        <span>--------- OR ---------</span>
      </div>
      <div className="flex">
        <div className="cursor-pointer hover:scale-110 duration-300 google-auth-button me-2 flex items-center justify-center">
          <img className="google-auth-icon " src={googleLogo} alt="" />
        </div>
        <div
          onClick={() => navigate("/register-email")}
          className="cursor-pointer hover:scale-110 google-auth-button  flex items-center justify-center duration-300"
        >
          <img className="google-auth-icon " src={otpLogo} alt="" />
        </div>
      </div>
    </form>
  );
}
