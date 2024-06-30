import React from "react";
import { useEffect, useRef } from "react";
import "./Notification.css";

const ImageComponent = React.lazy(() => import("../../ImageComponent/Image"));

export default function Notification() {
  const notification = useRef();
  useEffect(() => {
    notification.current.style.right = "12px";
  }, []);
  return (
    <div
      ref={notification}
      className="text-center notification-content absolute top-3 bottom-3   bg-[#ffffff]"
    >
      <div className="App"></div>
    </div>
  );
}
