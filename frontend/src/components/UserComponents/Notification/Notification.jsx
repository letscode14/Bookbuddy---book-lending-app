import React, { useContext } from "react";
import { useEffect, useRef } from "react";
import "./Notification.css";
import { SocketContext } from "../../../Socket/SocketContext";

const ImageComponent = React.lazy(() => import("../../ImageComponent/Image"));

export default function Notification() {
  const socket = useContext(SocketContext);

  const handleOnclik = () => {
    socket.emit("clicked", "you can new emit");
  };
  const notification = useRef();
  useEffect(() => {
    notification.current.style.right = "12px";
  }, []);
  return (
    <div
      ref={notification}
      className="text-center notification-content absolute top-3 bottom-3   bg-[#ffffff]"
    >
      <div className="App" onClick={handleOnclik}>
        clike
      </div>
    </div>
  );
}
