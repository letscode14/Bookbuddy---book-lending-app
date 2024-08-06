import { createContext, useContext, useEffect, useState } from 'react'
import { SocketContext } from '../Socket/SocketContext'
import {
  commentToast,
  followToast,
  likeToast,
  messageToast,
  requestToast,
} from '../utils/toast'
import { useChatContext } from './ChatContext'
import { useDispatch, useSelector } from 'react-redux'
import { selectMsgMap, updateMessageRead } from '../store/slice/messageQue'
import { getNotification } from '../Service/Apiservice/UserApi'
import { addFollower, removeFollower, selecUser } from '../store/slice/userAuth'

const NotificationContext = createContext()

export const useNotificaitonContext = () => useContext(NotificationContext)

export const NotificationProvider = ({ children }) => {
  const { singleChat, setChatOnTop } = useChatContext()
  const { user } = useSelector(selecUser)
  //getting notification

  const { messageQue } = useSelector(selectMsgMap)

  const [pageNo, setPageNo] = useState(1)
  const [doFetch, setFetch] = useState()
  const [unReadMsgNum, setUnreadNum] = useState(0)

  useEffect(() => {
    const fetchNoti = async (userId, pageNo, unRead) => {
      const response = await getNotification(userId, pageNo, unRead)
      if (response) {
        setUnreadNum(response.notifications.length)
      }
    }

    fetchNoti(user, pageNo, 1)
  }, [pageNo, doFetch])

  const dispatch = useDispatch()

  const socket = useContext(SocketContext)
  const [commentResonse, setCommentResponse] = useState('')
  const [latestLike, setLikes] = useState('')

  useEffect(() => {
    if (socket) {
      socket.on('new like', ({ notification }) => {
        if (window.location.pathname == '/user/notification') {
          return
        }
        setLikes({ ...notification })
        const message = `${notification.actionBy.userName} liked your post`
        likeToast(notification, message)

        setUnreadNum((prev) => Number(prev) + 1)
      })

      //new follower
      socket.on('user followed', (data) => {
        if (window.location.pathname == '/user/notification') {
          setFetch(!doFetch)
          dispatch(addFollower(data._id))
        } else {
          const message = `${data.userName} has started following you`
          followToast(data, message)
          dispatch(addFollower(data._id))
          setUnreadNum((prev) => prev + 1)
        }
      })

      socket.on('un followed', (data) => {
        dispatch(removeFollower(data._id))
      })
      //comments

      socket.on('reply comment', ({ response }) => {
        setUnreadNum((prev) => prev + 1)
        const message = `${response.author.userName} has replied to comment `
        commentToast(
          response.author.profile.profileUrl,
          response.content,
          response.author.userName,
          message
        )
      })

      socket.on('comment recieved', ({ response, reply, postId }) => {
        setUnreadNum((prev) => prev + 1)

        let message
        setCommentResponse({ response, postId })
        if (reply) {
          message = `${response.author.userName} has replied to comment on your post`
        } else {
          message = `${response.author.userName} commented on you post`
        }
        commentToast(
          response.author.profile.profileUrl,
          response.content,
          response.author.userName,
          message
        )
      })

      socket.on('message recieved', (newMessage) => {
        if (
          !singleChat ||
          singleChat._id !== newMessage.chatId._id ||
          window.location.pathname !== '/user/messages'
        ) {
          if (newMessage.type !== 'message') {
            setUnreadNum((prev) => prev + 1)
          }

          handlemsgUpdate(
            newMessage.chatId._id,
            newMessage.type == 'request'
              ? 'Request for a book'
              : newMessage.content
          )

          if (newMessage.type == 'message') {
            messageToast(
              newMessage.content,
              newMessage.senderId.userName,
              `You have new  messages `,
              newMessage.senderId.profile.profileUrl
            )
          }
        }
      })

      socket.on('newnotification', ({ notification }) => {
        if (window.location.pathname !== '/user/notification')
          requestToast(
            notification?.contentId?.book?.ID,
            notification?.actionBy.userName,
            notification?.content,
            notification?.actionBy.profile.profileUrl,
            notification?.contentId?.book?.imageUrl.secure_url
          )
      })

      return () => {
        socket.off('new like')
        socket.off('user followed')
        socket.off('un followed')
        socket.off('reply comment')
        socket.off('comment received')
        socket.off('message recieved')
        socket.off('newnotification')
      }
    }
  }, [socket, singleChat, commentResonse, latestLike])

  const [unReadNotification, setNotification] = useState([])

  const handlemsgUpdate = (id, content) => {
    dispatch(updateMessageRead({ content, id }))
    setChatOnTop(id)
  }
  return (
    <NotificationContext.Provider
      value={{
        doFetch,
        pageNo,
        setPageNo,
        unReadMsgNum,
        setUnreadNum,
        unReadNotification,
        setNotification,
        commentResonse,
        setCommentResponse,
        latestLike,
        setLikes,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
