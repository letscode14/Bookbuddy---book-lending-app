import Navbar from "../Navbar/Navbar";
import { Routes, Route } from "react-router-dom";
import Home from "../Home/Home";
import Search from "../Search/Search";
import Page from "../../errorPages/Page404";
import Profile from "../Profile/Profile";

export default function Homepage() {
  return (
    <div className="h-screen w-screen bg-[#512da8] relative ">
      <Navbar />
      <Routes>
        <Route path="/Home" element={<Home />}></Route>
        <Route path="/search" element={<Search />}></Route>
        <Route path={`/profile`} element={<Profile />}></Route>
        <Route path="*" element={<Page />}></Route>
      </Routes>
    </div>
  );
}
