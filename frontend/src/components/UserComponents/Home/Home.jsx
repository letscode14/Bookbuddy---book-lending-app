import React from "react";
import { useEffect, useRef, useState } from "react";
import "./Home.css";
import { useLocation } from "react-router-dom";
import { getUser } from "../../../Service/Apiservice/UserApi";
import { useDispatch, useSelector } from "react-redux";
import {
  saveUserDetails,
  selecUser,
  selectUserDetails,
} from "../../../store/slice/userAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";

const ImageComponent = React.lazy(() =>
  import("../../ImageComponent/PostImage")
);
export default function Home() {
  const { user } = useSelector(selecUser);

  const contentPage = useRef(null);
  const { pathname } = useLocation();
  const [userData, setUser] = useState({});
  const dispatch = useDispatch();
  useEffect(() => {
    const element = contentPage.current;
    document.title = "Home";

    element.style.right = "12px";
  }, [pathname]);

  useEffect(() => {
    (async function fetchUser() {
      const response = await getUser(user);
      if (response) {
        console.log(response);
        setUser(response);
        dispatch(saveUserDetails(response));
      }
    })();
  }, []);

  return (
    <div
      ref={contentPage}
      className="ps-20 pe-20 pt-4 overflow-auto  home-content absolute top-3 bottom-3 flex   bg-[#ffffff]"
    >
      <div className="left-container-home object-fit f relative  border">
        <div className="story-segment items-center ps-2 overflow-y-auto sticky top-0 border flex">
          <div className="own-profile flex justify-center">
            <div className="rounded-full flex items-center justify-center   overflow-hidden">
              <React.Suspense
                fallback={
                  <div className="animate-spin rounded-full h-7 w-7  border-t-2 border-b-2 border-[#512da8]"></div>
                }
              >
                <ImageComponent src={userData.profileUrl} />
              </React.Suspense>
            </div>
          </div>
          <div className="others-story"> </div>
        </div>
        <div className=" flex justify-center">
          <div className="post-container mt-3  ">
            <div className="one-post">
              <div className="posted-user-details py-2 px-2 flex justify-between items-center">
                <div className="flex ">
                  <div className="post-profile flex justify-center">
                    <div className="rounded-full flex items-center justify-center   overflow-hidden">
                      <React.Suspense
                        fallback={
                          <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
                        }
                      >
                        <ImageComponent src={userData.profileUrl} />
                      </React.Suspense>
                    </div>
                  </div>
                  <div className="ms-4 ">
                    <div className=" font-semibold">{userData.userName}</div>
                    <div></div>
                  </div>
                </div>
                <div>
                  <FontAwesomeIcon className="text-2xl" icon={faEllipsis} />
                </div>
              </div>

              <div className="border post-home flex justify-center items-center">
                <React.Suspense
                  fallback={
                    <div className="animate-spin rounded-full h-20 w-20  border-t-2 border-b-2 border-[#512da8]"></div>
                  }
                >
                  <ImageComponent src="https://res.cloudinary.com/dcoy7olo9/image/upload/v1719172996/Bookbuddy/phm2jpezgmlznza2xul9.jpg" />
                </React.Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="sticky top-0 right-container-home border">
        right container
      </div>
    </div>
  );
}
