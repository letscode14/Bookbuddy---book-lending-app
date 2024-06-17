import { useEffect, useRef } from "react";
import "./Home.css";
import { useLocation } from "react-router-dom";
import axiosInstance from "../../../Service/api";
export default function Home() {
  const contentPage = useRef(null);
  const { pathname } = useLocation();
  useEffect(() => {
    const element = contentPage.current;

    element.style.right = "12px";
  }, [pathname]);
  const handleSubmit = async () => {
    const response = await axiosInstance.get("/user/protected");
    console.log(response);
  };
  return (
    <div
      ref={contentPage}
      className="text-center home-content absolute top-3 bottom-3   bg-[#ffffff]"
    >
      <button onClick={handleSubmit}>refresh token</button>
    </div>
  );
}
