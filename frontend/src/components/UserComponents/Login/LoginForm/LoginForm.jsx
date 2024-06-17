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
import OAuth from "../../../Oauth/OAuth";
//

//store
import { useSelector, useDispatch } from "react-redux";
import { selectError } from "../../../../store/slice/errorSlice";
import {
  selectLoading,
  startLoading,
  stopLoading,
} from "../../../../store/slice/loadinSlice";
import { saveUser } from "../../../../store/slice/userAuth";
import axiosInstance, {
  updateAuthorizationHeader,
} from "../../../../Service/api";
export default function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({});
  const [error, setError] = useState(0);
  const [passwordError, setPassError] = useState("");
  const [passView, setPassView] = useState(false);
  const { customError } = useSelector(selectError);
  const { isLoading } = useSelector(selectLoading);

  const handleSubmit = async (e) => {
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
    dispatch(startLoading());
    const response = await axiosInstance.post("/user/login", userDetails);
    if (response) {
      dispatch(stopLoading());
    }
    if (response.status == 200) {
      dispatch(
        saveUser({
          user: response.data._id,
          accessToken: response.data.accessToken,
        })
      );

      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      updateAuthorizationHeader();
      navigate("/user/home");
    }
  };

  return (
    <form className="w-full ">
      <h1 className="text-3xl font-bold mb-2">Sign In</h1>

      <div className="w-full ">
        <div className="flex justify-between">
          <div
            className={` pt-1 text-xs text-red-500 transition-opacity duration-200 ${
              error == 3 ? "" : "opacity-0"
            }`}
          >
            Fill all the fields
          </div>
          <div
            className={` pt-1 text-xs text-red-500 transition-opacity duration-200 `}
          >
            {customError}
          </div>
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
      <button
        disabled={isLoading}
        onClick={handleSubmit}
        className="signup-button flex justify-center items-center"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-white-900"></div>
        ) : (
          "SIGN in"
        )}
      </button>
      <div className="w-full text-center py-1">
        <span>--------- OR ---------</span>
      </div>
      <div className="flex">
        <OAuth />
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
