import React, { useState, useEffect, useRef } from "react";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import ChildModal from "../../../Modal/ChildModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faPen,
  faTriangleExclamation,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { validateEmail } from "../../../../../helpers/ValidationHelpers/ValidationHelper";
import {
  checkUserName,
  editUserDetails,
  resendOtp,
  sendVerifyEmail,
  submitEmailVerifyOtp,
} from "../../../../Service/Apiservice/UserApi";
import { showErrorToast, showSuccessToast } from "../../../../utils/toast";
import "./EditUser.css";

//cropping images
import Cropper from "react-easy-crop";
import getCroppedImg from "../../../../../helpers/ValidationHelpers/CropImage/CropImage";
import { useSelector, useDispatch } from "react-redux";
import {
  decrementOtpCounter,
  resetOtpCounter,
} from "../../../../store/slice/authSlice";
import {
  selectEditState,
  setVerify,
} from "../../../../store/slice/VerifyEmailAuth";
import {
  selectLoading,
  startLoading,
  stopLoading,
} from "../../../../store/slice/loadinSlice";
import {
  selectError,
  setCustomError,
} from "../../../../store/slice/errorSlice";
import { selectUserDetails } from "../../../../store/slice/userAuth";

export default function EditUser({ userInfo, onClose }) {
  const dispatch = useDispatch();
  const profileInput = useRef(null);
  const [currentEmail, setCurrent] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [modalFor, setModalFor] = useState("");
  const [usernameError, setUserNameError] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  //cropping image states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [newProfile, setNewProfile] = useState("");

  const [isChildOpen, setChildOpen] = useState(false);
  const [croppedProfile, setProfile] = useState({});

  //set for otp count
  const [intervalId, setIntervalId] = useState();
  const [otp, setOtp] = useState("");
  //
  //action to store the modal
  const [action, setAction] = useState("");

  //loadin stae
  const { isLoading } = useSelector(selectLoading);

  //custom error
  const { customError } = useSelector(selectError);
  //get user id from redux

  const { user } = useSelector(selectUserDetails);

  //state to chek if the email is verified or not
  const { isVerified } = useSelector(selectEditState);

  const [error, setError] = useState([]);
  const [errorMsg, setErrorMsg] = useState({
    emailError: "",
    usernameMsg: "",
    contactError: "",
  });
  const [userData, setUserData] = useState({
    name: "",
    userName: "",
    email: "",
    age: "",
    privacy: "",
    contact: "",
    gender: "",
    profileUrl: "",
    newProfile: "",
  });

  const resetError = () => {
    setTimeout(() => {
      setError([]);
      setTimeout(() => {
        setErrorMsg({ emailError: "", usernameMsg: "", contactError: "" });
      }, 250);
    }, 2000);
  };

  useEffect(() => {
    if (userInfo) {
      setUserData((prevData) => ({
        ...prevData,
        name: userInfo.name || prevData.name,
        userName: userInfo.userName || prevData.userName,
        email: userInfo.email || prevData.email,
        age: userInfo.age || prevData.age,
        gender: userInfo.gender || prevData.gender,
        contact: userInfo.contact || prevData.contact,
        privacy: userInfo.privacy ? "private" : "public",

        profileUrl: userInfo.profileUrl || prevData.profileUrl,
      }));
      setCurrent(userInfo.email);
      setCurrentUsername(userInfo.userName);
    }
  }, [userInfo]);

  const handleProfileInput = () => {
    profileInput.current.click();
  };

  const isUsername = async (username) => {
    if (!username) return;
    if (username == currentUsername) return;
    const isValid = await checkUserName(username);
    if (!isValid) {
      setError([2]);
      setUserNameError(true);

      resetError();
      return;
    }
    setUserNameError(false);
  };

  //to set profile image and cropping
  const handleProfileImageInput = (e) => {
    try {
      const file = e.target.files[0];
      if (file) {
        const fileNameParts = file.name.split(".");
        const fileExtension =
          fileNameParts[fileNameParts.length - 1].toLowerCase();

        const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
        if (!allowedExtensions.includes(fileExtension)) {
          showErrorToast(
            "Invalid file extension only jpg,jpeg,webp is allowed"
          );
          return;
        }

        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = () => {
          setNewProfile(reader.result);
          setModalFor("crop");
          setChildOpen(true);
          e.target.value = null;
        };
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleCloseChild = () => {
    clearInterval(intervalId);
    setChildOpen(false);
    setOtp("");
  };
  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
    showCroppedImage();
  };
  const showCroppedImage = async () => {
    try {
      if (!newProfile || !croppedAreaPixels) {
        return;
      }
      const croppedImageBlobUrl = await getCroppedImg(
        newProfile,
        croppedAreaPixels
      );

      const response = await fetch(croppedImageBlobUrl);

      const blob = await response.blob();
      const file = new File([blob], "croppedImage.jpg", {
        type: "image/jpeg",
      });
      setProfile({ url: croppedImageBlobUrl, file });
      setUserData((prev) => ({ ...prev, newProfile: file }));
    } catch (error) {
      console.log(error);
    }
  };

  const otpCounter = useSelector((state) => state.otpAuth.otpCounter);

  const handleConfirm = async () => {
    if (action == "removeprofile") {
      setUserData((prevUserData) => ({
        ...prevUserData,
        profileUrl:
          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
        newProfile: "",
      }));
      handleCloseChild();
      setProfile({});
    }
    if (action == "updateprofile") {
      console.log("profile");
      handleProfileInput();
    }
  };
  useEffect(() => {
    if (otpCounter > 0) {
      const interval = setInterval(() => {
        dispatch(decrementOtpCounter());
      }, 1000);

      setIntervalId(interval);

      return () => clearInterval(interval);
    }
  }, [dispatch, otpCounter]);

  const handleVerify = async () => {
    dispatch(startLoading());

    const response = await sendVerifyEmail(userData.email, userData._id);

    if (response) {
      setChildOpen(true);
      setModalFor("otp");
      dispatch(stopLoading());
      dispatch(resetOtpCounter());
      dispatch(setCustomError(response.message));
      setTimeout(() => {
        dispatch(setCustomError(""));
      }, 2000);
    } else {
      handleCloseChild();
    }
  };
  //to handle resend
  const handleResend = async () => {
    dispatch(startLoading());
    const response = await resendOtp();
    if (response.status) {
      dispatch(setCustomError(response.message));
      dispatch(resetOtpCounter());
      dispatch(stopLoading());
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp && otp == "") {
      setError([8]);
      setTimeout(() => {
        setError([]);
      }, 2500);
      return;
    }
    if (otpCounter == 0) {
      setError([8]);
      dispatch(setCustomError("Times up hit resend"));
      setTimeout(() => {
        setError([]);
        setTimeout(() => {
          dispatch(setCustomError(""));
        }, 400);
      }, 1600);
      return;
    }
    dispatch(startLoading());

    const response = await submitEmailVerifyOtp(otp);
    if (response) {
      dispatch(stopLoading());
      dispatch(setVerify());
      handleCloseChild();
      setEmailValid(true);
      setCurrent(userData.email);
      setError([]);
      setErrorMsg((prev) => ({ ...prev, emailError: "" }));
    }
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const errorIndices = [];
      const key = Object.keys(userData);
      key.forEach((key, index) => {
        if (key !== "newProfile") {
          if (userData[key] === "") {
            errorIndices.push(index + 1);
          }
        }
      });

      if (errorIndices.length > 0) {
        setError(errorIndices);
        resetError();
        return;
      }

      if (!validateEmail(userData.email)) {
        setError([3]);
        setErrorMsg({ ...errorMsg, emailError: "Enter a valid email" });
        resetError();
        return;
      }

      const phoneNumber = parsePhoneNumberFromString(userData.contact);

      if (!phoneNumber || !phoneNumber.isValid()) {
        setErrorMsg({
          ...errorMsg,
          contactError: "Enter a valid Phone number",
        });
        setError([6]);
        resetError();
        return;
      }
      console.log("a");

      if (usernameError) {
        setError([3]);
        resetError();
        return;
      }

      if (!emailValid) {
        setErrorMsg({
          ...errorMsg,
          emailError: "Email changed needs to verify",
        });
        setError([3]);
        resetError();
        return;
      }
      dispatch(startLoading());
      const formData = new FormData();
      formData.append("age", userData.age);
      formData.append("contact", userData.contact);
      formData.append("email", userData.email);
      formData.append("gender", userData.gender);
      formData.append("name", userData.name);
      formData.append("privacy", userData.privacy);
      formData.append("profileUrl", userData.profileUrl);
      formData.append("userName", userData.userName);
      formData.append("userId", user);

      if (userData.newProfile) {
        formData.append("newProfile", userData.newProfile);
      }

      const response = await editUserDetails(formData, user);
      if (response) {
        showSuccessToast(response);

        onClose();
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (!validateEmail(userData.email)) {
      setError([3]);
      setErrorMsg({ ...errorMsg, emailError: "Enter a valid email" });

      return;
    }

    if (currentEmail !== userData.email) {
      setErrorMsg({
        ...errorMsg,
        emailError: "Email changed needs to verify",
      });
      setError([3]);
      setEmailValid(false);
      return;
    }

    if (userData.email == currentEmail && validateEmail(userData.email)) {
      setEmailValid(true);
      const updatedErrors = error.filter((error) => error !== 3);
      setError(updatedErrors);
    }
  }, [userData]);

  return (
    <>
      <ChildModal isOpen={isChildOpen} onClose={handleCloseChild}>
        {modalFor == "otp" && (
          <div className="w-[300px] p-5 text-center">
            <div className="text-start text-lg font-semibold = mb-2">
              <label htmlFor="">submit otp</label>
            </div>
            <div>
              <div className="text-start  flex justify-between text-xs">
                <div
                  className={`  text-xs text-red-500 transition-opacity duration-500 ${
                    customError ? "" : error.includes(8) ? " " : "opacity-0"
                  }`}
                >
                  {customError ? customError : "field is required"}
                </div>
              </div>
              <input
                onChange={(e) => setOtp(e.target.value)}
                type="number"
                className="border py-1 w-full rounded-lg "
              />
            </div>
            <div className="my-2">00 : {otpCounter}</div>
            {otpCounter == 0 ? (
              <button
                onClick={handleResend}
                className="border text-[#ffffff] font-semibold  bg-[#512da8]  rounded-lg py-1 px-5 text-sm uppercase"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-white-900"></div>
                ) : (
                  "resend"
                )}
              </button>
            ) : (
              <button
                onClick={handleOtpSubmit}
                className="border text-[#ffffff] font-semibold  bg-[#512da8]  rounded-lg py-1 px-5 text-sm uppercase"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-white-900"></div>
                ) : (
                  "Submit"
                )}
              </button>
            )}
          </div>
        )}
        {modalFor == "confirm" && (
          <div className="w-[500px] py-6 px-10">
            <div>
              <span>
                <FontAwesomeIcon
                  className="text-2xl text-red-400 me-5"
                  icon={faTriangleExclamation}
                />
              </span>
              Are you sure?
            </div>
            <div className="text-end  mt-5">
              <div>
                <button
                  onClick={() => {
                    handleCloseChild();
                    setAction("");
                  }}
                  className="me-3 py-1 bg-[#512da8] text-[#ffffff] font-semibold uppercase px-5 text-xs border rounded-lg"
                >
                  cancel
                </button>

                <button
                  onClick={handleConfirm}
                  className="py-1 bg-red-400 text-[#ffffff] font-semibold uppercase px-5 text-xs border rounded-lg"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
        {modalFor == "crop" && (
          <div className="p-10">
            <div className=" gap-12 flex justify-between  edit-profile-container">
              <div className=" border edit-profile-image-container">
                <Cropper
                  image={newProfile}
                  crop={crop}
                  zoom={zoom}
                  aspect={4 / 4}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>

              <div className="new-profile-outcome">
                <img
                  className="w-full h-full rounded-full border"
                  src={croppedProfile.url}
                  alt=""
                />
              </div>
            </div>
            <div className="text-center">
              <button
                onClick={() => {
                  setUserData({ ...userData, profileUrl: croppedProfile.url });
                  setChildOpen(false);
                }}
                className="mt-5 border py-2 px-10 rounded-lg bg-[#512da8] text-[#ffffff] font-semibold uppercase text-xs "
              >
                submit
              </button>
            </div>
          </div>
        )}
      </ChildModal>
      <div className=" py-7 px-3 flex w-[700px]">
        <div className="w-[20%]   h-28 mx-6">
          <div className="flex justify-center h-28">
            <React.Suspense
              fallback={
                <div className="animate-spin rounded-full h-7 w-7  border-t-2 border-b-2 border-[#512da8]"></div>
              }
            >
              <img
                className="rounded-full object-contain"
                src={userData.profileUrl}
              />
            </React.Suspense>
          </div>

          <input
            type="file"
            onChange={(e) => {
              console.log("file input");
              handleProfileImageInput(e);
            }}
            className="hidden"
            ref={profileInput}
          />
          <div className="text-center mt-3">
            {userData.profileUrl !==
              "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" && (
              <FontAwesomeIcon
                className="border bg-red-400 text-[#ffffff]  me-2 rounded-lg py-2 px-3"
                icon={faXmark}
                onClick={() => {
                  setModalFor("confirm");
                  setAction("removeprofile");
                  setProfile({});
                  setChildOpen(true);
                }}
              />
            )}

            <FontAwesomeIcon
              className="border bg-[#512da8] text-[#ffffff] rounded-lg py-2 px-2"
              onClick={() => {
                setModalFor("confirm");
                setAction("updateprofile");
                setChildOpen(true);
              }}
              icon={faPen}
            />
          </div>
        </div>

        <div className="ms-4 w-[80%] ">
          <div className="flex  gap-5 justify-between">
            <div className="sm:col-span-3 fit-content w-full">
              <label
                htmlFor="first-name"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                First name
              </label>
              <div>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) =>
                    setUserData({ ...userData, name: e.target.value })
                  }
                  name="first-name"
                  autoComplete="given-name"
                  className="block w-full ps-2  rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                <div
                  className={`  text-xs text-red-500 transition-opacity duration-500 ${
                    error.includes(1) ? " " : "opacity-0"
                  }`}
                >
                  field is required
                </div>
              </div>
            </div>
            <div className="sm:col-span-3 w-full">
              <label
                htmlFor="user-name"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Username
              </label>
              <div>
                <input
                  type="text"
                  value={userData.userName}
                  onChange={(e) => {
                    isUsername(e.target.value);
                    setUserData({ ...userData, userName: e.target.value });
                  }}
                  name="user-name"
                  autoComplete="username"
                  className="block w-full ps-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                <div
                  className={`  text-xs text-red-500 transition-opacity duration-500 ${
                    error.includes(2) ? " " : "opacity-0"
                  }`}
                >
                  {usernameError
                    ? "User name is not available"
                    : "field is required"}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center ">
            <div className="sm:col-span-3 w-[60%]">
              <label
                htmlFor="user-name"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Email
              </label>
              <div>
                <input
                  readOnly={isVerified ? true : false}
                  type="text"
                  value={userData.email}
                  onChange={(e) =>
                    setUserData({ ...userData, email: e.target.value })
                  }
                  name="user-name"
                  autoComplete="username"
                  className="block w-full ps-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                <div
                  className={`  text-xs text-red-500 transition-opacity duration-500 ${
                    customError ? "" : error.includes(3) ? " " : "opacity-0"
                  }`}
                >
                  {customError
                    ? customError
                    : errorMsg.emailError
                    ? errorMsg.emailError
                    : "field is required"}
                </div>
              </div>
            </div>
            <div className="w-[20%] mt-2 ms-2">
              {emailValid ? (
                isVerified ? (
                  <FontAwesomeIcon
                    className="p-2 border rounded-full bg-green-400 text-[#ffffff]"
                    icon={faCheck}
                  />
                ) : (
                  ""
                )
              ) : (
                <button
                  onClick={() => {
                    handleVerify();
                  }}
                  className="border py-2 px-10 rounded-lg bg-[#512da8] text-[#ffffff] font-semibold uppercase text-xs "
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-white-900"></div>
                  ) : (
                    "VERIFY"
                  )}
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-5 items-center w-[70%] ">
            <div className="sm:col-span-3 w-full">
              <label
                htmlFor="user-name"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Age
              </label>
              <div>
                <input
                  type="number"
                  value={userData.age}
                  onChange={(e) =>
                    setUserData({ ...userData, age: e.target.value })
                  }
                  name="user-name"
                  autoComplete="username"
                  className="block w-full ps-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                <div
                  className={`  text-xs text-red-500 transition-opacity duration-500 ${
                    error.includes(4) ? " " : "opacity-0"
                  }`}
                >
                  field is required
                </div>
              </div>
            </div>
            <div className="sm:col-span-3 w-full">
              <label
                htmlFor="country"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Privacy
              </label>
              <div>
                <select
                  className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                  value={userData.privacy ? "public" : "private"}
                  onChange={(e) =>
                    setUserData({ ...userData, privacy: e.target.value })
                  }
                >
                  <option value="">Select option</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
                <div
                  className={`  text-xs text-red-500 transition-opacity duration-500 ${
                    error.includes(5) ? " " : "opacity-0"
                  }`}
                >
                  field is required
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-5 items-center w-[70%] ">
            <div className="sm:col-span-3  w-[48%]">
              <label
                htmlFor="user-name"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Contact
              </label>
              <div>
                <PhoneInput
                  country="US"
                  className="border border-gray-300 py-1  rounded-lg"
                  value={userData.contact}
                  onChange={(value) =>
                    setUserData({ ...userData, contact: value })
                  }
                />
                <div
                  className={`  text-xs text-red-500 transition-opacity duration-500 ${
                    error.includes(6) ? " " : "opacity-0"
                  }`}
                >
                  {errorMsg.contactError
                    ? errorMsg.contactError
                    : "field is required"}
                </div>
              </div>
            </div>
            <div className="sm:col-span-3 w-full">
              <label
                htmlFor="gender"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Gender
              </label>
              <div>
                <select
                  name="gender"
                  className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                  value={userData.gender}
                  onChange={(e) =>
                    setUserData({ ...userData, gender: e.target.value })
                  }
                >
                  <option value="">Select option</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Others">Others</option>
                </select>
                <div
                  className={`  text-xs text-red-500 transition-opacity duration-500 ${
                    error.includes(7) ? " " : "opacity-0"
                  }`}
                >
                  field is required
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 text-center w-[60%]">
            <button
              onClick={handleSubmit}
              className="bg-[#512da8] text-[#ffffff] uppercase pty-2 font-semibold py-2 px-3 rounded-lg text-xs "
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-white-900"></div>
              ) : (
                "save changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
