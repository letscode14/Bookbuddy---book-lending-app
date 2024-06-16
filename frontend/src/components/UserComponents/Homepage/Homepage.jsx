import Navbar from "../Navbar/Navbar";
import { Routes, Route } from "react-router-dom";
import Home from "../Home/Home";
import Search from "../Search/Search";
import Page from "../../page404/Page404";

export default function Homepage() {
  return (
    <div className="h-screen w-screen bg-[#512da8] relative ">
      <Navbar />
      <Routes>
        <Route path="/Home" element={<Home />}></Route>
        <Route path="/search" element={<Search />}></Route>
        <Route path="*" element={<Page />}></Route>
      </Routes>
    </div>
  );
}
