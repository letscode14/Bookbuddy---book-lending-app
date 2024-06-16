import { useEffect, useRef } from "react";
import "./Search.css";
import { useLocation } from "react-router-dom";
export default function Search() {
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
      search
    </div>
  );
}
