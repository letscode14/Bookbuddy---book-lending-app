import React from "react";

import { useEffect, useRef, useState } from "react";
import {
  removeUser,
  saveUserDetails,
  selecUser,
} from "../../../store/slice/userAuth";

import { useDispatch, useSelector } from "react-redux";
import { startLoading, stopLoading } from "../../../store/slice/loadinSlice";
import { selectLoading } from "../../../store/slice/loadinSlice";

import "./Profile.css";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../../Service/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faCalendar,
  faHandshake,
  faImages,
} from "@fortawesome/free-solid-svg-icons";
import { showSuccessToast } from "../../../utils/toast";

import ContentModal from "../../Modal/ContentModal";

import Post from "./Post/Post";
import { useConfirmationModal } from "../../Modal/ModalContext";
import { getUser } from "../../../Service/Apiservice/UserApi";
import EditUser from "./EditUser/EditUser";
import { setVerifyFalse } from "../../../store/slice/VerifyEmailAuth";
import FollowerList from "./FollowersList/FollowerList";
import FollowingList from "./FollowingLIst/FollowingList";
import Bookshelf from "./Bookshelf/Bookshelf";
const ImageComponent = React.lazy(() => import("../../ImageComponent/Image"));
export default function Search() {
  //modal state

  const contentPage = useRef(null);
  const [bio, setBio] = useState(false);
  const lineMenu = useRef(null);
  const [menu, setMenu] = useState(0);
  const [userDetails, setUserDetails] = useState({});

  const { isLoading } = useSelector(selectLoading);
  const { user } = useSelector(selecUser);
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const { showModal } = useConfirmationModal();
  const [modalFor, setModaFor] = useState("");
  useEffect(() => {
    const element = contentPage.current;
    document.title = "Profile";
    element.style.right = "12px";
  }, [pathname]);
  const logout = async () => {
    dispatch(startLoading());
    const response = await axiosInstance.post("/user/logout");
    if (response.status === 200) {
      dispatch(removeUser());

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      dispatch(stopLoading());
      showSuccessToast("Logged out success fully");
      navigate("/login");
    }
  };
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleContentModalClose = () => {
    dispatch(setVerifyFalse());
    setUserData(userDetails);
    setIsModalOpen(false);
    setModaFor("");
    dispatch(stopLoading());
  };

  useEffect(() => {
    (async function fetchUser() {
      const response = await getUser(user);

      if (response) {
        dispatch(saveUserDetails(response));
        setUserDetails(response);
        setUserData(response);
      }
    })();
  }, [isModalOpen]);

  useEffect(() => {
    const element = lineMenu.current;
    switch (menu) {
      case 0:
        element.style.left = `245px`;
        element.style.width = `88px`;
        break;
      case 1:
        element.style.left = `354px`;
        element.style.width = `132px`;
        break;
      case 2:
        element.style.left = `510px`;
        element.style.width = `133px`;
        break;
      case 3:
        element.style.left = `663px`;
        element.style.width = `96px`;
        break;
    }
    dispatch(setVerifyFalse());
  }, [menu]);

  return (
    <>
      <ContentModal
        isContentModalOpen={isModalOpen}
        onContentClose={handleContentModalClose}
      >
        {modalFor == "edituser" && (
          <EditUser userInfo={userData} onClose={handleContentModalClose} />
        )}
        {modalFor == "followers" && <FollowerList user={userData} />}
        {modalFor == "following" && <FollowingList user={userData} />}
      </ContentModal>
      <div
        ref={contentPage}
        className="  ps-20  profile-content overflow-y-auto  absolute flex top-3 bottom-3 bg-[#ffffff]"
      >
        <div className="w-[65%] pt-10  ">
          <div className="flex">
            <div className="relative   flex  flex-col  ">
              <div className="rounded-full  overflow-hidden profile-photo">
                <React.Suspense
                  fallback={
                    <div className="animate-spin rounded-full h-7 w-7  border-t-2 border-b-2 border-[#512da8]"></div>
                  }
                >
                  <ImageComponent src={userData?.profileUrl} />
                </React.Suspense>
              </div>

              <div className="mt-3 grid gap-y-2 grid-cols-2">
                <div className="grid gap-y-2">
                  <div className="font-bold text-2xl">
                    {userDetails.userName}
                  </div>
                  <div className="text-xl font-medium">{userDetails.name}</div>
                </div>

                <div className="mt-3 ms-3">
                  <div>
                    <span className="font-bold ps-3">Bio</span>
                    <span
                      onClick={() => {
                        if (bio) setBio(false);
                        else setBio(true);
                      }}
                      className="text-xs ms-2 font-bold text-gray-400"
                    >
                      {bio ? "hide" : "view"}
                    </span>
                  </div>
                  <div className={`text-md ms-3 ${bio ? `` : "hidden"}`}>
                    {userDetails.about}
                  </div>
                </div>
              </div>
            </div>

            <div className="ms-20 px-20 profile-right-container">
              <div className="grid font-bold mt-3 text-2xl grid-cols-3 gap-4">
                <div className=" ">
                  <div className="text-center">
                    {userDetails.followers?.length}
                  </div>
                  <div
                    className="cursor-pointer text-center"
                    onClick={() => {
                      setModaFor("followers");
                      setIsModalOpen(true);
                    }}
                  >
                    Followers
                  </div>
                </div>
                <div className="">
                  <div className="text-center">
                    {userDetails.following?.length}
                  </div>
                  <div
                    className="text-center cursor-pointer"
                    onClick={() => {
                      setModaFor("following");
                      setIsModalOpen(true);
                    }}
                  >
                    Following
                  </div>
                </div>
                <div className=" ">
                  <div className="text-center">
                    {userDetails.followers?.length}
                  </div>
                  <div className="text-center">Posts</div>
                </div>
              </div>
              <div className="flex items-center gap-7 my-8 justify-center">
                <div>
                  <button className="subscribe-button">subscribe</button>
                </div>

                <div className="grid gap-y-2 text-center font-bold text-2xl">
                  <div>lend Score</div>
                  <div className="text-3xl">0</div>
                  <div>no badge </div>
                </div>
              </div>
              <div className="flex gap-3 justify-center mt-2 mb-5">
                <button
                  disabled={isLoading}
                  onClick={() =>
                    showModal("Are you sure you need to logout", "user", () =>
                      logout()
                    )
                  }
                  className="log-out-button flex justify-center"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-white-900"></div>
                  ) : (
                    "logout"
                  )}
                </button>
                <button
                  onClick={() =>
                    showModal("Do you wish to continue", "user", () => {
                      setIsModalOpen(true);
                      setModaFor("edituser");
                    })
                  }
                  className="edit-profile-button"
                >
                  edit profile
                </button>
              </div>
            </div>
          </div>

          <div className="border-line mt-5"></div>
          <div className="relative">
            <div ref={lineMenu} className="absolute line-menu"></div>
          </div>

          <div className="flex  gap-7 mt-2 justify-center  menu-profile">
            <div
              onClick={() => setMenu(0)}
              className={menu == 0 ? "" : "text-gray-400"}
            >
              <FontAwesomeIcon icon={faImages} className="me-1" />
              <span className="cursor-pointer font-semibold">POSTS</span>
            </div>
            <div
              onClick={() => setMenu(1)}
              className={menu == 1 ? "" : "text-gray-400"}
            >
              <FontAwesomeIcon icon={faBook} className="me-1" />
              <span className="cursor-pointer font-semibold">BOOKSHELF</span>
            </div>
            <div
              onClick={() => setMenu(2)}
              className={menu == 2 ? "" : "text-gray-400"}
            >
              <FontAwesomeIcon icon={faHandshake} className="me-1" />
              <span className="cursor-pointer font-semibold">BORROWED</span>
            </div>
            <div
              onClick={() => setMenu(3)}
              className={menu == 3 ? "" : "text-gray-400"}
            >
              <FontAwesomeIcon icon={faCalendar} className="me-1" />
              <span className="cursor-pointer font-semibold">LENDED</span>
            </div>
          </div>

          {menu == 0 && <Post />}
          {menu == 1 && <Bookshelf userId={userData._id} />}
        </div>
        <div className="">
          <div className="fixed  ms-1 border-line-vertical"></div>
        </div>
      </div>
    </>
  );
}
