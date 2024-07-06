import Navbar from '../Navbar/Navbar'
import { Routes, Route } from 'react-router-dom'
import Home from '../Home/Home'
import Search from '../Search/Search'
import Page from '../../errorPages/Page404'
import Profile from '../Profile/Profile'
import CreatePost from '../Create/CreatePost'
import Notification from '../Notification/Notification'
import Chat from '../Messages/Chat'
import OtherProfile from '../Profile/OtherProfile/OtherProfile'

export default function Homepage() {
  return (
    <div className="h-screen w-screen bg-[#512da8] relative ">
      <Navbar />
      <Routes>
        <Route path="/Home" element={<Home />}></Route>
        <Route path="/notification" element={<Notification />} />

        <Route path="/search" element={<Search />}></Route>
        <Route path={`/profile`} element={<Profile />}></Route>
        <Route path={'/create'} element={<CreatePost />} />
        <Route path={'/messages'} element={<Chat />}></Route>
        <Route path={'/:id'} element={<OtherProfile />} />
        <Route path="*" element={<Page />}></Route>
      </Routes>
    </div>
  )
}
