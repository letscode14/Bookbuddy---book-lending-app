import "./AdminLogin.css";
import Logo from "/images/Logo2.png";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import {
  validateEmail,
  validatePassword,
} from "../../../../helpers/ValidationHelpers/ValidationHelper";

export default function AdminLogin() {
  const [error, setError] = useState(0);
  const [userDetails, setUserDetails] = useState({});
  const [passView, setPassView] = useState(true);
  const [passwordError, setPassError] = useState("");

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
    <div className="flex justify-center items-center relative admin-login-container">
      <div className="absolute top-5 left-5 w-44 ">
        <img src={Logo} />
      </div>

      <div className="flex shadow-xl rounded-2xl h-[50%] w-[800px] bg-[#ffffff]">
        <div className="relative w-[50%] rounded-l-2xl flex">
          <div className="grow justify-center flex rounded-l-2xl bg-[#FFDE59]">
            <span className="text-[28px] font-semibold self-center">B</span>
          </div>
          <div className="grow justify-center flex bg-[#DDB07F]">
            <span className="text-[28px] font-semibold self-center">O</span>
          </div>
          <div className="grow justify-center flex bg-[#C9E265]">
            <span className="text-[28px] font-semibold self-center">O</span>
          </div>
          <div className="grow justify-center flex bg-[#FF914D]">
            <span className="text-[28px] font-semibold self-center">K</span>
          </div>
          <div className="grow justify-center flex bg-[#FFDE59]">
            <span className="text-[28px] font-semibold self-center">B</span>
          </div>
          <div className="grow justify-center flex bg-[#C8D6B6]">
            <span className="text-[28px] font-semibold self-center">U</span>
          </div>
          <div className="grow justify-center flex bg-[#C9E265]">
            <span className="text-[28px] font-semibold self-center">D</span>
          </div>
          <div className="grow justify-center flex bg-[#FF5757]">
            <span className="text-[28px] font-semibold self-center">D</span>
          </div>
          <div className="grow justify-center flex bg-[#FFDE59]">
            <span className="text-[28px] font-semibold self-center">Y</span>
          </div>
          <div className="absolute top-[55%] right-16 text-[12px]">
            MAKE A DIFFERENCE EVEN FROM A DISTANCE
          </div>
        </div>
        <div className="w-[50%] flex justify-center items-center">
          <form className="w-[70%]  ">
            <h1 className="text-3xl text-center font-bold mb-2">Admin Login</h1>

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
                  setUserDetails({
                    ...userDetails,
                    email: e.target.value.trim(),
                  })
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
                  setUserDetails({
                    ...userDetails,
                    password: e.target.value.trim(),
                  })
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
                  error == 2 ? " " : "opacity-0"
                }`}
              >
                {passwordError}
              </div>
              <div className="opacity-0">sdv</div>
            </div>
            <div className="text-center">
              <button onClick={handleSubmit} className="sign-in-button">
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
