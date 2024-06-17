import Logo from "/images/Logo2.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  faSearch,
  faHome,
  faMessage,
  faCompass,
  faBell,
  faPlus,
  faPeopleGroup,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import ProfileAlt from "/images/Profile-alt.png";
import { useParams } from "react-router-dom";

import "./Navbar.css";

export default function Navbar() {
  const { param } = useParams();
  console.log(param);
  const profile = false;
  const { pathname } = useLocation();
  const [menu, setMenu] = useState(0);
  const navigate = useNavigate();

  const menuHighlight = useRef(null);

  useEffect(() => {
    const element = menuHighlight.current;
    switch (pathname) {
      case "/user/home":
        element.style.top = `${0}px`;
        setMenu(0);

        break;
      case "/user/search":
        element.style.top = `${52.5}px`;
        setMenu(1);
        break;
      case "/user/profile":
        element.style.top = `${372.5}px`;
        setMenu(7);
        break;
    }
  }, [pathname]);

  return (
    <div>
      <div className="h-24 pt-3 ">
        <img className="ms-3  h-full" src={Logo} alt="" />
        <div className="ps-8 py-2 relative navbar-menu text-[22px] mt-24">
          <div
            ref={menuHighlight}
            className="menu-highlight h-[48px] bg-[#FFFFFF] z-0 absolute left-3  w-[300px]"
          >
            {" "}
          </div>
          <div
            onClick={() => {
              setMenu(0), navigate("/user/home");
            }}
            className={`flex items-baseline  ${
              menu == 0 ? "text-[#000000]" : "text-[#ffffff]"
            }  font-bold `}
          >
            <FontAwesomeIcon className="me-4 z-20 " icon={faHome} />
            <label className="z-20">Home</label>
          </div>
          <div
            onClick={() => {
              setMenu(1), navigate("/user/search");
            }}
            className={`flex items-baseline  ${
              menu == 1 ? "text-[#000000]" : "text-[#ffffff]"
            }  font-bold `}
          >
            <FontAwesomeIcon className="me-4 z-20" icon={faSearch} />
            <label className="z-20">Search</label>
          </div>
          <div
            onClick={() => {
              setMenu(2), navigate("/home");
            }}
            className={`flex items-baseline  ${
              menu == 2 ? "text-[#000000]" : "text-[#ffffff]"
            }  font-bold `}
          >
            <FontAwesomeIcon className="me-4 z-20" icon={faMessage} />
            <label className=" z-20">Messages</label>
          </div>
          <div
            onClick={() => {
              setMenu(3), navigate("/home");
            }}
            className={`flex items-baseline  ${
              menu == 3 ? "text-[#000000]" : "text-[#ffffff]"
            }  font-bold `}
          >
            <FontAwesomeIcon className="me-4 z-20" icon={faCompass} />
            <label className=" z-20">Explore</label>
          </div>
          <div
            onClick={() => {
              setMenu(4), navigate("/home");
            }}
            className={`flex items-baseline  ${
              menu == 4 ? "text-[#000000]" : "text-[#ffffff]"
            }  font-bold `}
          >
            <FontAwesomeIcon className="me-4 z-20" icon={faBell} />
            <label className=" z-20">Notification</label>
          </div>
          <div
            onClick={() => {
              setMenu(5), navigate("/home");
            }}
            className={`flex items-baseline  ${
              menu == 5 ? "text-[#000000]" : "text-[#ffffff]"
            }  font-bold `}
          >
            <FontAwesomeIcon className="me-4 z-20" icon={faPlus} />
            <label className=" z-20">Create</label>
          </div>
          <div
            onClick={() => {
              setMenu(6), navigate("/home");
            }}
            className={`flex items-baseline  ${
              menu == 6 ? "text-[#000000]" : "text-[#ffffff]"
            }  font-bold `}
          >
            <FontAwesomeIcon className="me-2 z-20" icon={faPeopleGroup} />
            <label className=" z-20">Communities</label>
          </div>
          <div
            onClick={() => {
              setMenu(7), navigate("/user/profile");
            }}
            className={`flex items-baseline  ${
              menu == 7 ? "text-[#000000]" : "text-[#ffffff]"
            }  font-bold `}
          >
            <div className="rounded-full z-20  bg-[#ffffff] h-7 w-7 me-2">
              <img src={profile ? "" : ProfileAlt} alt="" />
            </div>
            <label className=" z-20">Profile</label>
          </div>
        </div>
        <div
          className="flex items-baseline  text-[22px]  absolute bottom-5 left-8  text-[#ffffff] font-bold 
          "
        >
          <FontAwesomeIcon className="me-2 z-20" icon={faBars} />
          <label className=" z-20">More</label>
        </div>
      </div>
    </div>
  );
}
