import React, { useContext, useEffect, useRef, useState } from 'react'
import { useChatContext } from '../../../../Context/ChatContext'
import { useDispatch, useSelector } from 'react-redux'
import { selecUser } from '../../../../store/slice/userAuth'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faChevronLeft,
  faCircleCheck,
  faCircleExclamation,
  faEllipsis,
  faPaperPlane,
} from '@fortawesome/free-solid-svg-icons'
import {
  acceptCollect,
  acceptRequest,
  declineRequest,
  getAllMessages,
  makeMesgRead,
  sendMessage,
} from '../../../../Service/Apiservice/UserApi'
import './ChatBox.css'
const ImageComponent = React.lazy(() => import('../../../ImageComponent/Image'))
import { SocketContext } from '../../../../Socket/SocketContext'
import { selectMsgMap } from '../../../../store/slice/messageQue'
import { showErrorToast } from '../../../../utils/toast'
import { useNavigate } from 'react-router-dom'

export default function ChatBox() {
  const { messageQue } = useSelector(selectMsgMap)
  const [scrollPosition, setScrollPosition] = useState(0)
  const navigate = useNavigate()
  //scoket
  const socket = useContext(SocketContext)
  const dispatch = useDispatch()
  const { singleChat, setChatOnTop, setObj, setSingleChat } = useChatContext()
  const chatContainerRef = useRef(null)
  const { user } = useSelector(selecUser)
  const [receiver, setReciever] = useState({})
  const [menuShow, setMenuShow] = useState(false)
  const [content, setContent] = useState('')
  const [pageNo, setPageNo] = useState(1)
  const [hasMore, sethasMore] = useState(true)
  const [messages, setMessages] = useState([])
  const [mLoading, setMloading] = useState(true)
  const [typing, setTyping] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [messageMap, setMessageMap] = useState({})

  //loading
  const [isDeclineBLoad, setisDeclineBLoad] = useState(false)

  const [isAgree, setAgreeBLoad] = useState(false)
  const [isCollect, setCollBLoad] = useState(false)
  useEffect(() => {
    if (singleChat) {
      const recieverInfo = singleChat.participants.find((p) => p._id != user)
      setReciever(recieverInfo)
    }
  }, [singleChat, user])

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setMloading(true)
        const response = await getAllMessages(singleChat._id, pageNo)
        if (response) {
          setMessages((prev) => [...prev, ...response.messages])
          sethasMore(response.hasMore)
          setMessageMap((prev) => ({ ...prev, ...response.messageMap }))
        }
        socket.emit('join chat', singleChat._id)
      } catch (error) {
        console.log(error)
      } finally {
        setMloading(false)
      }
    }
    fetchMessages()
  }, [singleChat, pageNo, socket])

  const makeMsgRead = async (messageId) => {
    const response = await makeMesgRead(messageId)
  }

  useEffect(() => {
    socket.on('message recieved', (newMessage) => {
      setIsTyping(false)
      if (!singleChat || singleChat._id != newMessage.chatId._id) {
        setChatOnTop(newMessage.chatId._id)
      } else {
        makeMsgRead(newMessage._id)
        setChatOnTop(newMessage.chatId._id)
        setObj({
          chatId: newMessage.chatId._id,
          content:
            newMessage.type == 'request'
              ? `${newMessage.content.stage}`
              : newMessage.content,
        })
        setMessages((prev) => [newMessage, ...prev])
      }
    })

    socket.on('typing', (room) => {
      const receiv = singleChat.participants.find((p) => p._id != user)

      if (receiv._id) {
        if (room.user == receiv._id) {
          setIsTyping(true)
        }
      }
    })
    socket.on('stop typing', (room) => {
      const receiv = singleChat.participants.find((p) => p._id != user)

      if (receiv._id) {
        if (room.user == receiv._id) {
          setIsTyping(false)
        }
      }
    })
    return () => {
      socket.off('message recieved')
      socket.off('typing')
      socket.off('stop typing')
      socket.off('new message')
    }
  }, [socket, singleChat, setChatOnTop, setObj, setMessages, user])

  const handleSendMessage = async () => {
    socket.emit('stop typing', singleChat._id)
    const obj = {
      senderId: user,
      chatId: singleChat._id,
      content: content.trim(),
      isRequestForBook: false,
    }

    setContent('')
    setChatOnTop(singleChat._id)
    setObj({ chatId: singleChat._id, content: obj.content })
    const response = await sendMessage(obj)

    if (response) {
      setMessages((prev) => [response.message, ...prev])
      if (!response.isNewChat) socket.emit('new message', response.message)
      else {
        const newreciever = response.message.chatId.participants.find(
          (p) => p != user
        )
        socket.emit('newchatwithuser', newreciever)
      }
    }
  }

  useEffect(() => {
    const scrollToSavedPosition = () => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight - scrollPosition
      }
    }

    scrollToSavedPosition()
  }, [messages, isTyping])

  const handleScroll = () => {
    if (chatContainerRef.current.scrollTop === 0) {
      if (hasMore) {
        setPageNo(pageNo + 1)
      }
    }
    setScrollPosition(
      chatContainerRef.current.scrollHeight - chatContainerRef.current.scrollTop
    )
  }

  const typeHandler = (e) => {
    setContent(e.target.value)
    if (!socket) return

    if (!typing) {
      setTyping(true)
      socket.emit('typing', { user, receiver: receiver._id })
    }
    let lastTypingTime = new Date().getTime()
    var timerLength = 3000

    setTimeout(() => {
      var timeNow = new Date().getTime()
      var timeDifff = timeNow - lastTypingTime

      if (timeDifff >= timerLength && typing) {
        socket.emit('stop typing', { user, receiver: receiver._id })
        setTyping(false)
      }
    }, timerLength)
  }

  const handleDecline = async (
    requestedUserId,
    requestId,
    messageId,
    chatId,
    senderId
  ) => {
    try {
      setisDeclineBLoad(true)
      const response = await declineRequest(
        senderId,
        requestId,
        messageId,
        chatId
      )
      if (response) {
        setMessages((prev) => {
          const updatedMessages = prev.map((message) => {
            if (message._id == messageId) {
              const content = message.content
              if (content) {
                content.stage = 'declined'
                content.isCancelled = true
              }
            }
            return message
          })
          return [response, ...updatedMessages]
        })
        socket.emit('new message', response)
        setisDeclineBLoad(false)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setisDeclineBLoad(false)
    }
  }

  const handleAcceptrequest = async (
    requestId,
    requestedUser,
    user,
    mId,
    chatId
  ) => {
    try {
      setAgreeBLoad(true)
      const response = await acceptRequest(
        requestId,
        requestedUser,
        user,
        mId,
        chatId
      )
      if (response.status == true) {
        setMessages((prev) => {
          const updatedMessages = prev.map((message) => {
            if (message._id == mId) {
              const content = message.content
              if (content) {
                content.stage = 'approved'
                content.isCancelled = false
                content.isAccepted = true
              }
            }
            return message
          })
          return [response.message, ...updatedMessages]
        })
        socket.emit('new message', response.message)
      } else {
        showErrorToast(response)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setAgreeBLoad(false)
    }
  }

  const handleCollectrequest = async (
    requestId,
    requestedUser,
    user,
    mId,
    chatId
  ) => {
    setCollBLoad(true)
    const response = await acceptCollect(
      requestId,
      requestedUser,
      user,
      mId,
      chatId
    )
    if (response.status == true) {
      setMessages((prev) => {
        const updatedMessages = prev.map((message) => {
          if (message._id == mId) {
            const content = message.content
            if (content) {
              content.stage = 'transaction complete'
              content.isCancelled = false
              content.isAccepted = true
            }
          }
          return message
        })
        return [response.message, ...updatedMessages]
      })
      socket.emit('new message', response.message)
    } else {
      showErrorToast(response)
    }
  }

  return (
    <div className="chat-right-container flex flex-col  xs:w-full sm:w-full lg:w-[70%] ">
      <div className=" flex items-center justify-between p-2 flex h-20 xs:h-16">
        <div className="flex cursor-pointer xs:items-center ">
          <div
            onClick={() => {
              setSingleChat(null)
            }}
            className="me-2 flex items-center lg:hidden"
          >
            <div>
              <FontAwesomeIcon icon={faChevronLeft} />
            </div>
          </div>
          <div
            className="flex"
            onClick={() => navigate(`/user/other/${receiver._id}`)}
          >
            <div className="relative h-16 w-16 xs:h-12 xs:w-12">
              <div className="rounded-full h-full w-full cursor-pointer flex items-center justify-center overflow-hidden">
                <React.Suspense
                  fallback={
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#512da8]"></div>
                  }
                >
                  <ImageComponent src={receiver?.profile?.profileUrl} />
                </React.Suspense>
              </div>
              {receiver?.isSubscribed && (
                <FontAwesomeIcon
                  className="text-lg text-[#512da8] absolute bg-[#ffffff] rounded-full bottom-0 right-0"
                  icon={faCircleCheck}
                />
              )}
            </div>
            <div className="h-full ">
              <div className="ms-3 font-semibold">{receiver.userName}</div>
              <div className="ms-3 text-gray-400 text-sm">{receiver.name}</div>
            </div>
          </div>
        </div>
        <div className="relative h-full flex items-center">
          <div
            style={{ bottom: '-60px', left: '-170px' }}
            className={`gap-y-1 grid  text-[#ffffff] absolute ${menuShow ? 'py-2 xs:border xs:border-2 xs:border-[#512da8]' : 'h-0'}  px-3 overflow-hidden   z-20 rounded-b-2xl rounded-ss-2xl bg-[#512da8] text-sm w-44 uppercase transition-all duration-100 
            xs:bg-[#ffffff] xs:text-[#512da8]  `}
          >
            <div>Report</div>
            <div>Delete</div>
            <div>Change wallpaper</div>
          </div>
          {/* <FontAwesomeIcon
            onClick={() => setMenuShow(!menuShow)}
            onBlur={() => setMenuShow(false)}
            icon={faEllipsis}
            className="me-10 text-2xl xs:me-4"
          /> */}
        </div>
      </div>
      <div className="relative grow">
        <div
          style={{
            backgroundImage: `url("https://res.cloudinary.com/dcoy7olo9/image/upload/v1720547395/chat_defualt_r0plmt.jpg")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          className="rounded-br-[40px] relative xs:rounded-[0px] h-full sm:rounded-bl-[40px]"
        >
          <div
            onScroll={handleScroll}
            ref={chatContainerRef}
            style={{
              scrollbarWidth: 'none',
              overflowY: 'auto',
            }}
            className={`${hasMore ? 'pt-16' : ''} absolute w-full overflow-auto top-0 bottom-0 mb-16`}
          >
            {mLoading && (
              <div className="text-[#ffffff] flex justify-center items-center">
                <div className="p-2 rounded-full  bg-[#ffffff]">
                  <div className="animate-spin bg-[#ffffff]  rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
                </div>
              </div>
            )}

            <div>
              {messages.length > 0 ? (
                hasMore ? null : (
                  <div className="w-full flex justify-center">
                    <div className="border mt-4 rounded-xl bg-[#ede9f7] text-sm ">
                      <p className="text-center w-[500px] py-2 px-3 xs:w-[300px]">
                        Send and receive messages in real-time. Engage with
                        users who have verified profiles to ensure trustworthy
                        connections.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <div className="w-full flex justify-center">
                  <div className="border mt-4 rounded-xl bg-[#ede9f7] text-sm ">
                    <p className="text-center w-[500px] py-2 px-3 xs:w-[300px]">
                      Send and receive messages in real-time. Engage with users
                      who have verified profiles to ensure trustworthy
                      connections.
                    </p>
                  </div>
                </div>
              )}

              {!hasMore && !receiver.isSubscribed && (
                <div className="w-full flex justify-center">
                  <div className="border  mt-4 rounded-xl bg-[#ede9f7] text-sm ">
                    <p className="text-center w-[500px] py-2 px-3 xs:w-[300px]">
                      <FontAwesomeIcon
                        className="text-red-400"
                        icon={faCircleExclamation}
                      />{' '}
                      Kindly be aware that this users profile has not been
                      verified. Any interactions or issues with this user are
                      your personal responsibility.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="fit-content flex flex-col-reverse mt-5 px-3">
              {messages.map((m, i) => {
                const date = new Date(m.timeStamp)
                const hours = date.getHours().toString().padStart(2, '0')
                const minutes = date.getMinutes().toString().padStart(2, '0')
                const time = `${hours}:${minutes}`

                const showDate =
                  i === 0 ||
                  new Date(m.timeStamp).toDateString() !==
                    new Date(messages[i - 1].timeStamp).toDateString()

                return (
                  <React.Fragment key={i}>
                    {showDate &&
                      new Date().toDateString() !==
                        new Date(m.timeStamp).toDateString() && (
                        <>
                          <div className=" text-center my-1">
                            <div className=" bg-[#ede9f7] font-semibold inline-block px-4 py-1 text-[#000000] rounded-lg  text-xs   mt-1 mb-1">
                              messages up to{' '}
                              {new Date(m.timeStamp).toDateString()}
                            </div>
                          </div>
                        </>
                      )}
                    <div
                      key={i}
                      className={`mt-1 ${
                        m.senderId?._id === user ? 'flex justify-end' : ''
                      }`}
                    >
                      <div
                        className={`inline-block py-1 px-3 rounded-b-xl ${
                          m.senderId?._id === user
                            ? 'rounded-tl-lg bg-[#512da8]'
                            : 'rounded-tr-lg bg-[#ffffff]'
                        } `}
                      >
                        {m.type === 'request' ? (
                          <div
                            className={`p-1 pe-5 ${m.senderId._id == user ? 'text-[#ffffff]' : ''} xs:pe-2 xs:max-w-[250px]`}
                          >
                            <div className="mt-1 my-2 uppercase text-xs font-semibold">
                              <div>
                                {''}
                                {m.content?.stage == 'declined' &&
                                  m.senderId._id !== user &&
                                  m.content.madeBy._id == user && (
                                    <>
                                      <FontAwesomeIcon
                                        icon={faCircleExclamation}
                                        className="me-2 text-red-500"
                                      />
                                      Request {m.content.stage}
                                    </>
                                  )}
                                {''}
                                {m.content?.stage == 'approved' &&
                                  m.senderId._id !== user &&
                                  m.content.madeBy._id == user && (
                                    <>
                                      <FontAwesomeIcon
                                        icon={faCheck}
                                        className="me-2 text-green-500"
                                      />
                                      Request {m.content.stage}
                                    </>
                                  )}

                                {''}
                                {m.content?.stage == 'declined' &&
                                  m.senderId._id == user &&
                                  m.content.madeBy._id !== user && (
                                    <>
                                      <FontAwesomeIcon
                                        icon={faCircleExclamation}
                                        className="me-2 text-red-500"
                                      />
                                      Request {m.content.stage} by you
                                    </>
                                  )}
                                {m.content?.stage == 'times up' &&
                                  m.senderId._id == user &&
                                  m.content.madeBy._id !== user && (
                                    <>
                                      <FontAwesomeIcon
                                        icon={faCircleExclamation}
                                        className="me-2 text-red-500"
                                      />
                                      {m.content.stage} !
                                    </>
                                  )}
                                {m.content?.stage == 'requested' &&
                                  m.senderId?._id !== user &&
                                  m.content.stage}
                                {m.content?.stage == 'collect' &&
                                  m.senderId?._id !== user &&
                                  `Request to collect book`}
                                {m.content?.stage == 'collect' &&
                                  m.senderId?._id == user &&
                                  `Request To collect book`}
                                {m.content?.stage == 'transaction complete' &&
                                  m.senderId?._id !== user && (
                                    <>
                                      <FontAwesomeIcon
                                        icon={faCheck}
                                        className="me-2 text-green-500"
                                      />
                                      Transaction completed
                                    </>
                                  )}
                                {m.content?.stage == 'times up' &&
                                  m.senderId?._id !== user && (
                                    <>
                                      <FontAwesomeIcon
                                        icon={faCircleExclamation}
                                        className="me-2 text-red-500"
                                      />
                                      Times Up!
                                    </>
                                  )}
                              </div>
                            </div>
                            <div className="flex ">
                              <div className="h-12 w-12">
                                <div className="rounded-full h-full  w-full cursor-pointer flex items-center justify-center overflow-hidden">
                                  <React.Suspense
                                    fallback={
                                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#512da8]"></div>
                                    }
                                  >
                                    <ImageComponent
                                      src={m.content?.book?.imageUrl.secure_url}
                                    />
                                  </React.Suspense>
                                </div>
                              </div>
                              <div className="ms-3 text-sm  font-semibold">
                                <div>{m.content?.book?.author}</div>
                                <div>ID:{m.content?.book?.ID}</div>
                                <div className="text-xs">
                                  Requested on:
                                  {new Date(
                                    m.content.requestedOn
                                  ).toDateString()}
                                </div>
                                <div className="text-xs">
                                  Requested By:
                                  {m.content.madeBy._id == user
                                    ? 'You'
                                    : m.content.madeBy.userName}
                                </div>
                              </div>
                            </div>
                            {m.content.madeBy._id == user ? (
                              m.content.stage == 'times up' ? (
                                <div className="text-[#000000] flex py-[3px] text-sm inline-block px-3 rounded-lg mt-2  bg-[#ede9f7]">
                                  <FontAwesomeIcon
                                    icon={faCircleExclamation}
                                    className="me-2 text-red-500"
                                  />
                                  <p className="text-wrap max-w-52">
                                    Give back the book immediately otherwise
                                    comphensation will be charged for you!
                                  </p>
                                </div>
                              ) : (
                                ' '
                              )
                            ) : (
                              ''
                            )}
                            {m.content.madeBy._id !== user ? (
                              m.content.stage == 'declined' ? (
                                m.senderId._id !== user &&
                                m.content.madeBy._id !== user && (
                                  <div className="text-[#000000] py-[3px] text-sm inline-block px-3 rounded-lg mt-2  bg-[#ede9f7]">
                                    <FontAwesomeIcon
                                      icon={faCircleExclamation}
                                      className="me-2 text-red-500"
                                    />
                                    {m.content.stage}
                                  </div>
                                )
                              ) : m.content.stage === 'expired' ? (
                                m.senderId._id !== user &&
                                m.content.madeBy._id !== user && (
                                  <div className="text-[#000000] py-[3px] text-sm inline-block px-3 rounded-lg mt-2  bg-[#ede9f7]">
                                    <FontAwesomeIcon
                                      icon={faCircleExclamation}
                                      className="me-2 text-red-500"
                                    />
                                    {m.content.stage}
                                  </div>
                                )
                              ) : m.content.stage == 'approved' ? (
                                <div className="text-[#000000]  py-[3px] text-sm inline-block px-3 rounded-lg mt-2  bg-[#ede9f7]">
                                  <FontAwesomeIcon
                                    icon={faCheck}
                                    className="me-2 text-green-500 "
                                  />
                                  {m.content.stage}
                                  <div className="mt-1 flex items-start">
                                    <FontAwesomeIcon
                                      icon={faCircleExclamation}
                                      className="me-2 text-[#512da8]"
                                    />
                                    <p className="text-wrap w-60 xs:w-40">
                                      {' '}
                                      You have approved this request Lended book
                                      will be reflected on your account plese
                                      handover the book immediately
                                    </p>
                                  </div>
                                </div>
                              ) : m.content.stage == 'collect' ? (
                                <div className="mt-2 gap-2">
                                  <div className="text-[#000000]  py-[3px] text-sm inline-block px-3 rounded-lg mt-2  bg-[#ede9f7]">
                                    <div className="mt-1 flex items-start">
                                      <FontAwesomeIcon
                                        icon={faCircleExclamation}
                                        className="me-2 text-red-500"
                                      />
                                      <p className="text-wrap w-60 xs:w-40">
                                        {' '}
                                        Accept this request only after
                                        collecting the the book
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() =>
                                      handleCollectrequest(
                                        m.content._id,
                                        m.content.madeBy._id,
                                        user,
                                        m._id,
                                        singleChat._id
                                      )
                                    }
                                    className="px-1 mt-2 min-w-16 py-1 flex justify-center text-[#512da8] uppercase  px-3 font-semibold rounded-lg text-[11px] border border-[#512da8]"
                                  >
                                    {isCollect ? (
                                      <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
                                    ) : (
                                      'Collected'
                                    )}
                                  </button>
                                </div>
                              ) : m.content.stage == 'transaction complete' ? (
                                <div className="text-[#000000] flex  py-[3px] text-sm inline-block px-3 rounded-lg mt-2  bg-[#ede9f7]">
                                  <FontAwesomeIcon
                                    icon={faCheck}
                                    className="me-2 text-green-500 "
                                  />
                                  <p className="text-wrap w-60 xs:w-40">
                                    Your lending process is completed Enjoy
                                    further transactions
                                  </p>
                                </div>
                              ) : m.content.stage == 'times up' ? (
                                <div className="text-[#000000] flex  py-[3px] text-sm inline-block px-3 rounded-lg mt-2  bg-[#ede9f7]">
                                  <FontAwesomeIcon
                                    icon={faCircleExclamation}
                                    className="me-2 text-red-500 "
                                  />
                                  <p className="text-wrap w-60 xs:w-40">
                                    Lending period over
                                  </p>
                                </div>
                              ) : (
                                <div className="flex mt-2 gap-2">
                                  <button
                                    onClick={() =>
                                      handleAcceptrequest(
                                        m.content._id,
                                        m.content.madeBy._id,
                                        user,
                                        m._id,
                                        singleChat._id
                                      )
                                    }
                                    className="min-w-16 text-[#ffffff] px-3 font-semibold rounded-lg text-[11px] uppercase bg-[#512da8]"
                                  >
                                    {isAgree ? (
                                      <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#ffffff]"></div>
                                    ) : (
                                      'Agree'
                                    )}
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDecline(
                                        m.content.madeBy._id,
                                        m.content._id,
                                        m._id,
                                        singleChat._id,
                                        user
                                      )
                                    }
                                    className="px-1 min-w-16 py-1 flex justify-center text-[#512da8] uppercase  px-3 font-semibold rounded-lg text-[11px] border border-[#512da8]"
                                  >
                                    {isDeclineBLoad ? (
                                      <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
                                    ) : (
                                      'decline'
                                    )}
                                  </button>
                                </div>
                              )
                            ) : m.senderId._id == user &&
                              m.content.stage == 'declined' ? (
                              <div className="text-[#000000] py-[3px] text-sm inline-block px-3 rounded-lg mt-2  bg-[#ede9f7]">
                                <FontAwesomeIcon
                                  icon={faCircleExclamation}
                                  className="me-2 text-red-500"
                                />
                                {m.content.stage}
                              </div>
                            ) : m.content.stage == 'expired' ? (
                              <div className="text-[#000000] py-[3px] text-sm inline-block px-3 rounded-lg mt-2  bg-[#ede9f7]">
                                <FontAwesomeIcon
                                  icon={faCircleExclamation}
                                  className="me-2 text-red-500"
                                />
                                {m.content.stage}
                              </div>
                            ) : m.content.stage == 'approved' &&
                              m.content.madeBy._id &&
                              m.senderId._id !== user ? (
                              <div className="text-[#000000] py-[3px] text-sm inline-block px-3 rounded-lg mt-2  bg-[#ede9f7]">
                                <p className="text-wrap w-60">
                                  {' '}
                                  {m.senderId.userName} has accepted your
                                  request check on the bookshelf to see the
                                  borrowed details collect book immediately
                                </p>
                              </div>
                            ) : m.content.stage == 'approved' &&
                              m.content.madeBy._id &&
                              m.senderId._id == user ? (
                              <div className="text-[#000000] py-[3px] text-sm inline-block px-3 rounded-lg mt-2  bg-[#ede9f7]">
                                <FontAwesomeIcon
                                  icon={faCheck}
                                  className="me-2 text-green-500 "
                                />
                                {m.content.stage}
                              </div>
                            ) : m.content.stage == 'collect' &&
                              m.content.madeBy._id &&
                              m.senderId._id == user ? (
                              <div className="text-[#000000] xs:w-full py-[3px] text-sm inline-block px-3 rounded-lg mt-2  bg-[#ede9f7]">
                                <FontAwesomeIcon
                                  icon={faCircleExclamation}
                                  className="me-2 text-red-500 "
                                />
                                {
                                  'user will acceptd this request after handovering the book '
                                }
                              </div>
                            ) : m.content.stage == 'transaction complete' &&
                              m.senderId._id !== user ? (
                              <div className="text-[#000000] flex  py-[3px] text-sm inline-block px-3 rounded-lg mt-2  bg-[#ede9f7]">
                                <FontAwesomeIcon
                                  icon={faCheck}
                                  className="me-2 text-green-500 "
                                />
                                <p className="text-wrap w-60 xs:w-40">
                                  Your borrowing process is completed Enjoy
                                  further transactions
                                </p>
                              </div>
                            ) : (
                              ''
                            )}
                          </div>
                        ) : (
                          <div className="text-wrap max-w-[420px] xs:max-w-[200px]">
                            <p
                              className={` text-sm break-words  ${
                                m.senderId?._id === user ? 'text-[#ffffff]' : ''
                              }`}
                            >
                              {m.content}
                            </p>
                          </div>
                        )}

                        <div
                          className={`text-end ${
                            m.senderId?._id === user
                              ? 'text-[#ffffff] opacity-75 font-semibold'
                              : 'text-gray-400 font-semibold'
                          } text-[9px]`}
                        >
                          {time}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                )
              })}
            </div>

            {isTyping && (
              <div className="text-[#ffffff] ms-3  border inline-block py-1 px-3 rounded-b-xl rounded-tr-lg bg-[#ffffff] mt-1">
                <div className="typing-indicator">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center absolute bottom-2  w-full h-12">
            <input
              value={content}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (content.trim() !== '') {
                    handleSendMessage()
                  }
                }
              }}
              style={{ outline: 'none' }}
              onChange={typeHandler}
              placeholder="write your message"
              type="text"
              className="text-sm p-3 ms-2 rounded-full  w-[90%]"
            />
            <div className="ms-2  text-[#ffffff] w-11 h-11 hover:w-12 hover:h-12  rounded-xl bg-[#512da8] flex justify-center transtion-all tran items-center">
              <FontAwesomeIcon
                onClick={() => {
                  if (content.trim() == '') {
                    return
                  }
                  handleSendMessage()
                }}
                icon={faPaperPlane}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
