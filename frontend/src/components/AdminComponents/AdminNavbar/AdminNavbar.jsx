import Logo from "/images/Logo2.png";
import "./AdminNavbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axiosInstance from "../../../Service/api";
import {
  faHome,
  faUser,
  faUsers,
  faMedal,
  faTentArrowLeftRight,
  faPhotoFilm,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  selectLoading,
  startLoading,
  stopLoading,
} from "../../../store/slice/loadinSlice";
import { removeAdmin } from "../../../store/slice/adminAuth";
import { useConfirmationModal } from "../../Modal/ModalContext";
export default function AdminNavbar() {
  const { isLoading } = useSelector(selectLoading);

  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const menu = useRef(null);

  const { showModal } = useConfirmationModal();
  useEffect(() => {
    switch (pathname) {
      case "/admin/user/management":
        menu.current.style.left = "54px";

        break;
      case "/admin/dashboard":
        menu.current.style.left = "-16px";
    }
  }, [pathname]);
  const navigate = useNavigate();
  const logout = async () => {
    dispatch(startLoading());
    const response = await axiosInstance.get("/admin/logout");
    if (response.status == 200) {
      localStorage.removeItem("adminAccessToken");
      localStorage.removeItem("adminRefreshToken");
      dispatch(removeAdmin());
      dispatch(stopLoading());
      navigate("/admin/login");
    }
  };
  const handleLogout = () => {
    showModal("Are you sure you need to logout", "admin", () => logout());
  };

  return (
    <div className="flex justify-between bg-[#ffffff] h-[70px] rounded-2xl">
      <div className="flex  items-center ms-3">
        <img src={Logo} className="h-[60px]" />
        <input className="ms-10 navbar-input" placeholder="Search"></input>
        <div className="ms-28 relative">
          <div
            ref={menu}
            className="border-4  absolute border-black menu-selector"
          ></div>
          <FontAwesomeIcon
            onClick={() => {
              navigate("/admin/dashboard");
            }}
            className="navbar-icon"
            icon={faHome}
          />
          <FontAwesomeIcon
            onClick={() => {
              (menu.current.style.left = "54px"),
                navigate("/admin/user/management");
            }}
            className="navbar-icon"
            icon={faUser}
          />
          <FontAwesomeIcon
            onClick={() => {
              (menu.current.style.left = "123px"), navigate();
            }}
            className="navbar-icon"
            icon={faUsers}
          />
          <FontAwesomeIcon
            onClick={() => {
              (menu.current.style.left = "195px"), navigate();
            }}
            className="navbar-icon"
            icon={faMedal}
          />
          <FontAwesomeIcon
            onClick={() => {
              (menu.current.style.left = "264px"), navigate();
            }}
            className="navbar-icon"
            icon={faTentArrowLeftRight}
          />
          <FontAwesomeIcon
            onClick={() => {
              (menu.current.style.left = "335px"), navigate();
            }}
            className="navbar-icon"
            icon={faPhotoFilm}
          />
        </div>
      </div>
      <div className="flex items-center">
        <FontAwesomeIcon
          onClick={() => (menu.current.style.left = "857px")}
          className="navbar-icon"
          icon={faBell}
        />
        <button
          disabled={isLoading}
          onClick={handleLogout}
          className="me-4 admin-logout-button flex justify-center items-center"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-white-900"></div>
          ) : (
            "Log out"
          )}
        </button>
      </div>
    </div>
  );
}
