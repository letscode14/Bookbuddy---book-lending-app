import { useEffect, useRef } from "react";
import { removeUser } from "../../../store/slice/userAuth";

import { useDispatch, useSelector } from "react-redux";
import { startLoading, stopLoading } from "../../../store/slice/loadinSlice";
import { selectLoading } from "../../../store/slice/loadinSlice";

import "./Profile.css";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../../Service/api";
export default function Search() {
  const contentPage = useRef(null);
  const { isLoading } = useSelector(selectLoading);
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    const element = contentPage.current;

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

      navigate("/login");
    }
  };

  return (
    <div
      ref={contentPage}
      className=" profile-content absolute flex top-3 bottom-3   bg-[#ffffff]"
    >
      <div className="w-[75%] ">
        <div className="">
          <div className="bg-[#7D7B7B] relative profile-photo">
            <button
              disabled={isLoading}
              onClick={logout}
              className="edit-profile-button flex justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-white-900"></div>
              ) : (
                "logout"
              )}
            </button>
          </div>
        </div>
        <div></div>
      </div>
      <div className="border border-[#7D7B7B]-500 border-2"></div>
      <div></div>
    </div>
  );
}
