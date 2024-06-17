import { Route, Routes } from "react-router-dom";
import AdminNavbar from "../AdminNavbar/AdminNavbar";
import User from "./User/User";
import Page404 from "../../errorPages/Page404";
import Dashboard from "./Dashboard/Dashboard";
export default function AdminPages() {
  return (
    <div className=" p-4 h-screen bg-[#51557e] ">
      <AdminNavbar />
      <Routes>
        <Route path="/user/management" element={<User />}></Route>
        <Route path="/dashboard" element={<Dashboard />}></Route>
        <Route path="*" element={<Page404 />}></Route>
      </Routes>
    </div>
  );
}
