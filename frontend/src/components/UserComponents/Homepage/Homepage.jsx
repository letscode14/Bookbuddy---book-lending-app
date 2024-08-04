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
import { useContext, useEffect } from 'react'
import { SocketContext } from '../../../Socket/SocketContext'
import { useSelector } from 'react-redux'
import { selecUser } from '../../../store/slice/userAuth'
import { MenuProvider } from '../../../Context/Context'
import { NotificationProvider } from '../../../Context/NotificationContext'
import { ChatProvider } from '../../../Context/ChatContext'
import { StoryProvider } from '../../../Context/StoryContext'
import Explore from '../Explore/Explore'
import Page404 from '../../errorPages/Page404'

export default function Homepage() {
  const socket = useContext(SocketContext)
  const { user } = useSelector(selecUser)

  useEffect(() => {
    if (socket) {
      socket.emit('setup', user)
      socket.on('connected', () => {
        console.log('coonected')
      })
    }
    return () => {
      socket.off('connected')
    }
  }, [socket])
  return (
    <div className="h-screen w-screen bg-[#512da8] relative ">
      <StoryProvider>
        <ChatProvider>
          <NotificationProvider>
            <MenuProvider>
              <Navbar />
              <Routes>
                <Route path="home" element={<Home />} />
                <Route path="notification" element={<Notification />} />
                <Route path="search" element={<Search />} />
                <Route path="profile" element={<Profile />} />
                <Route path="create" element={<CreatePost />} />
                <Route path="messages" element={<Chat />} />
                <Route path="explore" element={<Explore />} />
                <Route path="*" element={<Page404 />} />
                <Route path="other/:id" element={<OtherProfile />} />
              </Routes>
            </MenuProvider>
          </NotificationProvider>
        </ChatProvider>
      </StoryProvider>
    </div>
  )
}
