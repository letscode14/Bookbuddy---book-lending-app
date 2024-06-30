import { useEffect, useRef } from "react";
import "./Search.css";

export default function Search() {
  const searchContainer = useRef();
  useEffect(() => {
    searchContainer.current.style.right = "12px";
  }, []);
  return (
    <div
      ref={searchContainer}
      className="text-center search-content absolute top-3 bottom-3   bg-[#ffffff]"
    >
      <div className="App">
        <button className="mt-3 inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:mt-0 sm:w-auto">
          Open Modal
        </button>
      </div>
    </div>
  );
}
