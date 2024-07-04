import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

//reduc state management
import { otpAuthIn } from "../../../../store/slice/authSlice";
//font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

//validations helpers
import {
  validateEmail,
  validatePassword,
} from "../../../../../helpers/ValidationHelpers/ValidationHelper";
import { useDispatch, useSelector } from "react-redux";
import {
  selectLoading,
  startLoading,
  stopLoading,
} from "../../../../store/slice/loadinSlice";
import OAuth from "../../../Oauth/OAuth";
import { selectError } from "../../../../store/slice/errorSlice";
import {
  checkUserName,
  registerUser,
} from "../../../../Service/Apiservice/UserApi";
export default function SignupForm() {
  const dispatch = useDispatch();

  const { isLoading } = useSelector(selectLoading);
  const { customError } = useSelector(selectError);

  const navigate = useNavigate();
  const [error, setError] = useState([]);
  const [usernameError, setUserNameError] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [passView, setPassView] = useState(false);
  const [errorMsg, setErrorMsg] = useState({
    emailError: "",
    passwordError: "",
    usernameMsg: "",
    confirmPassError: "",
  });
  useEffect(() => {
    document.title = "Signup";
  }, []);
  const resetError = () => {
    setTimeout(() => {
      setError([]);
      setTimeout(() => {
        setErrorMsg({
          emailError: "",
          passwordError: "",
          confirmPassError: "",
        });
      }, 300);
    }, 1500);
  };

  const isUsername = async (username) => {
    if (!username) return;
    const isValid = await checkUserName(username);
    if (!isValid) {
      setError([2]);
      setUserNameError(true);

      resetError();
      return;
    }
    setUserNameError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errorIndices = [];
    const keys = Object.keys(userDetails);

    keys.forEach((key, index) => {
      if (userDetails[key].trim() === "") {
        errorIndices.push(index + 1);
      }
    });

    if (errorIndices.length > 0) {
      setError(errorIndices);
      resetError();
      return;
    }

    if (usernameError) {
      setError([2]);
      resetError();
      return;
    }

    const email = validateEmail(userDetails.email);
    if (!email) {
      setError([3]);
      setErrorMsg({ ...errorMsg, emailError: "Enter a valid email" });
      resetError();
      return;
    }
    const pass = validatePassword(userDetails.password);
    if (pass !== true) {
      setError([4]);
      setErrorMsg({ ...errorMsg, passwordError: pass });
      resetError();
      return;
    }

    if (userDetails.password != userDetails.confirmPassword) {
      setErrorMsg({ ...errorMsg, confirmPassError: "Password does not match" });
      setError([5]);
      resetError();
      return;
    }

    dispatch(startLoading());
    const response = await registerUser(userDetails);

    if (response.status) {
      const { token } = response;
      dispatch(otpAuthIn(token));
      dispatch(stopLoading());
      navigate("/submit-otp");
    }
    if (usernameError) {
      setUserNameError(true);
      setError([2]);

      resetError();

      return;
    }
  };

  return (
    <form className="w-full">
      <h1 className="text-3xl font-bold mb-1">Create Account</h1>
      <div className="w-full">
        <div className="flex justify-between">
          <div
            className={`  text-xs text-red-500 transition-opacity duration-500 ${
              customError ? " " : "opacity-0"
            }`}
          >
            {customError}
          </div>
          <div className="text-xs opacity-0 ">sda</div>
        </div>

        <input
          onChange={(e) =>
            setUserDetails({ ...userDetails, name: e.target.value.trim() })
          }
          type="text"
          placeholder="Name"
        />
        <div
          className={`pb-1  text-xs text-red-500 transition-opacity duration-500 ${
            error.includes(1) ? " " : "opacity-0"
          }`}
        >
          Name is required
        </div>
      </div>
      <div className="w-full ">
        <input
          onChange={(e) => {
            isUsername(e.target.value);
            setUserDetails({ ...userDetails, userName: e.target.value.trim() });
          }}
          type="text"
          placeholder="Username"
        />

        <div
          className={`pb-1  text-xs text-red-500 transition-opacity duration-500 ${
            error.includes(2) ? "" : "opacity-0"
          }`}
        >
          {usernameError
            ? "User name is not valid try another one"
            : "Username is required"}
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
            error.includes(3) ? "" : "opacity-0"
          }`}
        >
          {errorMsg.emailError ? errorMsg.emailError : "Email is required"}
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
              error.includes(4) ? "" : "opacity-0"
            }`}
          >
            {errorMsg.passwordError
              ? errorMsg.passwordError
              : "Password is required"}
          </div>
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
            error.includes(5) ? "" : "opacity-0"
          }`}
        >
          {errorMsg.confirmPassError
            ? errorMsg.confirmPassError
            : "Confirm password required"}
        </div>
      </div>
      <div className="flex justify-center items-center"></div>

      <button
        disabled={isLoading}
        onClick={handleSubmit}
        className="signup-button flex justify-center items-center"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-white-900"></div>
        ) : (
          "SIGN UP"
        )}
      </button>
      <div className="w-full text-center py-1">
        <span>--------- OR ---------</span>
      </div>
      <OAuth />
    </form>
  );
}
