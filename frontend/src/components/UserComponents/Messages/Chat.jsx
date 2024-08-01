import React, { useEffect, useRef, useState } from 'react'
import './Chat.css'
import UserChats from './UserChats/UserChats'
import Community from './Community/Community'
import { useChatContext } from '../../../Context/ChatContext'
import ChatBox from './ChatBox/ChatBox'
import chatImage from '/images/7495.jpg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import ResponsiveNav from '../Navbar/ReponsiveNav'
const ImageComponent = React.lazy(() => import('../../ImageComponent/Image'))

export default function Chat() {
  const { singleChat, chatLoading } = useChatContext()
  const chatContainer = useRef()
  const lineMenu = useRef()
  const [menuNo, setMenu] = useState(1)
  useEffect(() => {
    document.title = 'Messages'
  }, [])

  return (
    <>
      <ResponsiveNav />
      <div
        ref={chatContainer}
        className="rounded-[40px] right-[12px] search-content  absolute top-3 bottom-3 gap-2 flex  ps-9 pt-4   bg-[#ffffff]
      xs:left-0 xs:right-0 xs:rounded-[0px] xs:top-0 xs:bottom-0 xs:ps-0 xs:pe-0 xs:pt-1 
      sm:left-20 sm:ps-0 sm:pe-0 
      md:left-[230px]  
      lg:pe-0 lg:ps-5 lg:pt-2 lg:left-[280px]"
      >
        <div
          className={`chat-left-container px-1 xs:w-full sm:w-full lg:w-[30%] ${singleChat ? 'xs:hidden sm:hidden lg:block' : ''}`}
        >
          <div className="py-2 px-2">
            <input
              placeholder="Search"
              className="chat-search text-sm ps-2 py-2 rounded-xl w-full "
            />
          </div>
          <div className="border my-2"></div>
          <UserChats />
        </div>
        <div
          className="border  mx-1 
        xs:hidden 
        sm:hidden
        lg:flex"
        ></div>

        {singleChat ? (
          <ChatBox />
        ) : (
          <div
            className=" chat-right-container flex justify-center items-center 
          xs:hidden 
          sm:hidden 
          lg:flex"
          >
            {chatLoading ? (
              <div className="w-full h-full flex justify-center items-center">
                <div className="pulse-container">
                  <div className="wave-loading"></div>
                  <div className="wave-loading"></div>
                  <div className="pulse-loading flex items-center justify-center"></div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-36">
                  <React.Suspense
                    fallback={
                      <div className="animate-spin rounded-full h-7 w-7  border-t-2 border-b-2 border-[#512da8]"></div>
                    }
                  >
                    <ImageComponent src={chatImage} />
                  </React.Suspense>
                </div>
                <p className="bg-[#ede9f7] border p-3 rounded-lg text-wrap text-center  w-[600px] text-sm">
                  Engage in conversations with your friends and connections
                  effortlessly Ensure secure and trustworthy interactions by
                  connecting with users who have verified profiles. Look out for
                  the<span className="font-semibold"> verification badge</span>{' '}
                  <span>
                    <FontAwesomeIcon
                      className="text-[#512da8] text-md"
                      icon={faCircleCheck}
                    />
                  </span>{' '}
                  next to their name
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
