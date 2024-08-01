import React, { useContext, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selecUser } from '../../../../store/slice/userAuth'
import { getAllChat } from '../../../../Service/Apiservice/UserApi'
import { useChatContext } from '../../../../Context/ChatContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import './UserChat.css'
import { SocketContext } from '../../../../Socket/SocketContext'
import {
  saveUnReadMesg,
  selectMsgMap,
} from '../../../../store/slice/messageQue'
const ImageComponent = React.lazy(() => import('../../../ImageComponent/Image'))
export default function UserChats() {
  const socket = useContext(SocketContext)
  const dispatch = useDispatch()
  const chatContainerRef = useRef(null)
  const [pageNo, setPageNo] = useState(1)
  const { messageQue } = useSelector(selectMsgMap)

  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasMOre, setHas] = useState(true)
  const { user } = useSelector(selecUser)
  const [newChat, setNewChat] = useState(false)
  const { singleChat, mesObj, setObj, setChatOnTop, createChat, chatOntheTop } =
    useChatContext()

  useEffect(() => {
    if (Object.keys(mesObj).length > 0) {
      const { chatId, content } = mesObj

      const chatIndex = chats.findIndex((chat) => chat._id === chatId)

      if (chatIndex !== -1) {
        const updatedChats = [...chats]

        updatedChats[chatIndex].lastMessage = {
          messageId: { content: content },
          timeStamp: new Date().getTime(),
        }

        setChats(updatedChats)
        setObj({})
      }
    }
    if (chatOntheTop && chats.length > 0) {
      const chatIndex = chats.findIndex((chat) => chat._id === chatOntheTop)

      if (chatIndex !== -1) {
        const updatedChats = [...chats]
        const [chat] = updatedChats.splice(chatIndex, 1)
        updatedChats.unshift(chat)
        setChats(updatedChats)
        setChatOnTop('')
      }
    }
  }, [chatOntheTop, mesObj])

  useEffect(() => {
    const fetchChat = async () => {
      setLoading(true)
      try {
        const response = await getAllChat(user, pageNo)
        if (response) {
          setLoading(false)
          setChats((prev) => {
            const prevSet = new Set(prev.map((item) => item._id.toString()))
            const newItems = response.chats.filter(
              (item) => !prevSet.has(item._id.toString())
            )
            if (!newItems) {
              setHas(false)
            }
            return [...prev, ...newItems]
          })

          dispatch(saveUnReadMesg({ ...messageQue, ...response.messageMap }))
        }
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    if (hasMOre) {
      fetchChat()
    }
  }, [pageNo, newChat, singleChat])
  useEffect(() => {
    if (socket) {
      socket.on('newchat comming', () => {
        setNewChat(!newChat)
      })
    }
  })

  const handleScroll = () => {
    const container = chatContainerRef.current
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container
      if (scrollTop + clientHeight >= scrollHeight) {
        setPageNo(pageNo + 1)
      }
    }
  }
  return (
    <div
      onScroll={handleScroll}
      ref={chatContainerRef}
      className="overflow-y-auto   chat-scroll"
    >
      {chats.length > 0 ? (
        chats.map((chat, i) => (
          <div
            key={i}
            className={`h-16  ${singleChat?._id == chat._id && 'border rounded-xl bg-[#ede9f7]'} cursor-pointer mt-1 flex items-center p-3 w-full`}
          >
            {chat.participants
              .filter((participant) => user !== participant._id)
              .map((participant) => (
                <div
                  key={participant._id}
                  onClick={() => {
                    createChat(user, participant._id)
                  }}
                  className="flex items-start w-full"
                >
                  <div className="relative  w-[55px]">
                    <div className="rounded-full h-full  w-full cursor-pointer flex items-center justify-center overflow-hidden">
                      <React.Suspense
                        fallback={
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#512da8]"></div>
                        }
                      >
                        <ImageComponent src={participant.profile.profileUrl} />
                      </React.Suspense>
                    </div>
                    {participant.isSubscribed && (
                      <FontAwesomeIcon
                        className="text-sm text-[#512da8] absolute bg-[#ffffff] rounded-full bottom-0 right-0"
                        icon={faCircleCheck}
                      />
                    )}
                  </div>
                  {messageQue[chat._id].mCount > 0 ? (
                    <div className="ms-2 flex w-full justify-between items-center">
                      <div>
                        <div>
                          <span className="font-semibold">
                            {participant.userName}
                          </span>
                        </div>
                        <div className="max-w-48 font-semibold text-sm truncate">
                          {messageQue[chat._id].content}
                        </div>
                      </div>

                      <div>
                        <span className=" py-[4px] px-[6px] font-semibold bg-[#512da8] text-[#ffffff] rounded-xl text-[10px] ">
                          {messageQue[chat._id].mCount}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="ms-2">
                      <div>
                        <span className="font-semibold">
                          {participant.userName}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm truncate w-40">
                          {chat.lastMessage.messageId?.content
                            ? chat.lastMessage.messageId?.type == 'request'
                              ? 'Request for a book'
                              : chat.lastMessage.messageId?.content
                            : 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500">No chats</div>
      )}
      {loading && (
        <div className="w-full  mt-3    flex justify-center">
          <div className="animate-spin  rounded-full h-5 w-5  border-t-2 border-b-2 border-[#512da8]"></div>
        </div>
      )}
    </div>
  )
}
