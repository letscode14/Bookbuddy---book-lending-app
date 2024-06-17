import Logo from "/images/Logo2.png";
import "./AdminNavbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUser,
  faUsers,
  faMedal,
  faTentArrowLeftRight,
  faPhotoFilm,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
export default function AdminNavbar() {
  const menu = useRef(null);
  const navigate = useNavigate();

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
              (menu.current.style.left = "-16px"), navigate("/admin/dashboard");
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
        <button className=" admin-logout-button me-4">Log out</button>
      </div>
    </div>
  );
}
