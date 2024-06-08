import googleLogo from "/images/google-logo-9808.png";
import { useState } from "react";

//font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

//validations helpers
import {
  validateEmail,
  validatePassword,
} from "../../../../../helpers/ValidationHelpers/ValidationHelper";

export default function SignupForm() {
  const [error, setError] = useState(0);
  const [passError, setPassError] = useState(" ");
  const [userDetails, setUserDetails] = useState({});
  const [passView, setPassView] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      Object.entries(userDetails).length !== 5 ||
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
      }, 1500);
      return;
    }

    if (userDetails.password !== userDetails.confirmPassword) {
      setPassError(pass);
      setError(5);
      setTimeout(() => {
        setError(0);
      }, 1500);
      return;
    }
  };

  return (
    <form className="w-full">
      <h1 className="text-3xl font-bold mb-1">Create Account</h1>
      <div className="w-full">
        <div
          className={`  text-xs text-red-500 transition-opacity duration-500 ${
            error == 3 ? "" : "opacity-0"
          }`}
        >
          Fill all the fields
        </div>
        <input
          onChange={(e) =>
            setUserDetails({ ...userDetails, name: e.target.value.trim() })
          }
          type="text"
          placeholder="Name"
        />
      </div>
      <div className="w-full ">
        <div
          className={`pb-1  text-xs text-red-500 transition-opacity duration-500 opacity-0`}
        >
          Fill all the fields
        </div>
        <input
          onChange={(e) =>
            setUserDetails({ ...userDetails, username: e.target.value.trim() })
          }
          type="text"
          placeholder="Username"
        />

        <div
          className={`pb-1  text-xs text-red-500 transition-opacity duration-500 ${
            error == 4 ? "" : "opacity-0"
          }`}
        >
          Username not available
        </div>
      </div>
      <div className="w-full">
        <input
          onChange={(e) =>
            setUserDetails({ ...userDetails, email: e.target.value.trim() })
          }
          type="email"
          placeholder="Email"
        />
        <div
          className={` pb-1 text-xs text-red-500 transition-opacity duration-500 ${
            error == 1 ? "" : "opacity-0"
          }`}
        >
          Enter a valid email
        </div>
      </div>

      <div className="w-full relative">
        <input
          onChange={(e) =>
            setUserDetails({ ...userDetails, password: e.target.value.trim() })
          }
          type={passView ? "text" : "password"}
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
        <div className=" text-sm flex w-full justify-between ">
          <div
            className={` py-1 text-xs text-red-500 transition-opacity duration-500 ${
              error == 2 ? "" : "opacity-0"
            }`}
          >
            {passError}
          </div>
          <div className="cursor-pointer  opacity-0">asldn</div>
        </div>
      </div>

      <div className="w-full">
        <input
          onChange={(e) =>
            setUserDetails({
              ...userDetails,
              confirmPassword: e.target.value.trim(),
            })
          }
          type={passView ? "text" : "password"}
          placeholder="Confirm password "
        />
        <div
          className={`  text-xs text-red-500 transition-opacity duration-500 ${
            error == 5 ? "" : "opacity-0"
          }`}
        >
          Password doesnt match
        </div>
      </div>

      <button onClick={handleSubmit} className="signup-button">
        SIGN UP
      </button>
      <div className="w-full text-center py-1">
        <span>--------- OR ---------</span>
      </div>
      <div className="cursor-pointer hover:scale-110 duration-300 google-auth-button me-2 flex items-center justify-center">
        <img className="google-auth-icon " src={googleLogo} alt="" />
      </div>
    </form>
  );
}