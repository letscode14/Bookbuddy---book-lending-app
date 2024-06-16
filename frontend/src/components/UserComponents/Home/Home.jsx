import { useEffect, useRef } from "react";
import "./Home.css";
import { useLocation } from "react-router-dom";
export default function Home() {
  const contentPage = useRef(null);
  const { pathname } = useLocation();
  useEffect(() => {
    const element = contentPage.current;

    element.style.right = "12px";
  }, [pathname]);
  return (
    <div
      ref={contentPage}
      className="text-center home-content absolute top-3 bottom-3   bg-[#ffffff]"
    >
      Home
    </div>
  );
}
