import { createContext, useContext, useState } from 'react'
import { getSingleChat } from '../Service/Apiservice/UserApi'
import { selectLoading } from '../store/slice/loadinSlice'
import { useDispatch } from 'react-redux'
import { updateMessageRead } from '../store/slice/messageQue'

const ChatContext = createContext()

export const useChatContext = () => useContext(ChatContext)

export const ChatProvider = ({ children }) => {
  const dispatch = useDispatch()

  const [chatOntheTop, setChatOnTop] = useState('')
  const [mesObj, setObj] = useState({})
  const [singleChat, setSingleChat] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const createChat = async (senderId, userId) => {
    try {
      setSingleChat('')
      setChatLoading(true)

      const response = await getSingleChat(senderId, userId)

      if (response) {
        console.log(response)
        setSingleChat(response)
        const chatId = response._id
        dispatch(updateMessageRead({ content: '', id: chatId, newCount: 0 }))
        selectLoading(false)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <ChatContext.Provider
      value={{
        singleChat,
        setSingleChat,
        createChat,
        chatLoading,
        setChatLoading,
        setChatOnTop,
        chatOntheTop,
        setObj,
        mesObj,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}
