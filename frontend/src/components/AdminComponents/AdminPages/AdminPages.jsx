import { Route, Routes } from 'react-router-dom'
import AdminNavbar from '../AdminNavbar/AdminNavbar'
import User from './User/User'
import Page404 from '../../errorPages/Page404'
import Dashboard from './Dashboard/Dashboard'
import Post from './Post/Post'
import Badge from './Badge/Badge'
import Trasactions from './Transactions/Trasactions'
import { useEffect } from 'react'
export default function AdminPages() {
  return (
    <div className=" flex flex-col p-4 h-full bg-[#51557e]  ">
      <AdminNavbar />

      <Routes>
        <Route path="/user/management" element={<User />}></Route>
        <Route path="/dashboard" element={<Dashboard />}></Route>
        <Route path="/post/management" element={<Post />}></Route>
        <Route path="/badge/management" element={<Badge />} />
        <Route path="/transactions" element={<Trasactions />} />

        <Route path="*" element={<Page404 />}></Route>
      </Routes>
    </div>
  )
}
