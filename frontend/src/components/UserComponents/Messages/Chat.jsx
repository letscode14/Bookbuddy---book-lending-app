import { useEffect, useRef, useState } from 'react'
import './Chat.css'
import UserChats from './UserChats/UserChats'
import Community from './Community/Community'

export default function Chat() {
  const chatContainer = useRef()
  const lineMenu = useRef()
  const [menuNo, setMenu] = useState(2)
  useEffect(() => {
    chatContainer.current.style.right = '12px'
    document.title = 'Messages'
  }, [])

  useEffect(() => {
    if (menuNo == 1) {
      lineMenu.current.style.left = '0px'
      lineMenu.current.style.width = '54px'
    }
    if (menuNo == 2) {
      lineMenu.current.style.left = '59px'
      lineMenu.current.style.width = '102px'
    }
  }, [menuNo])

  return (
    <div
      ref={chatContainer}
      className=" search-content absolute top-3 bottom-3 gap-2 flex  ps-9 pt-4   bg-[#ffffff]"
    >
      <div className="chat-left-container ">
        <div className="py-2 px-2">
          <input
            placeholder="Search"
            className="chat-search text-sm ps-2 py-2 rounded-xl w-full "
          />
        </div>
        <div className="border mt-1 relative">
          <div ref={lineMenu} className="chat-menu-line  absolute"></div>
        </div>
        <div className="text-sm  ms-1 mt-2">
          <span
            onClick={() => setMenu(1)}
            className={`me-2 cursor-pointer ${menuNo == 1 ? 'text-[#000000]' : 'text-gray-400'}  font-semibold`}
          >
            USERS
          </span>
          <span
            onClick={() => setMenu(2)}
            className={`me-2 cursor-pointer ${menuNo == 2 ? 'text-[#000000]' : 'text-gray-400'}  font-semibold`}
          >
            COMMUNITIES
          </span>
        </div>

        <div className="mt-4">
          {menuNo == 1 && <UserChats />}
          {menuNo == 2 && <Community />}
        </div>
      </div>
      <div className="chat-right-container border"></div>
    </div>
  )
}
