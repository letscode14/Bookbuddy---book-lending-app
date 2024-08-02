import { createContext, useState, useEffect } from 'react'
import { Socket, io } from 'socket.io-client'

const SocketContext = createContext()

const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const socket = io('https://www.api.bookbuddy.lol')
    setSocket(socket)
  }, [Socket])

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  )
}

export { SocketProvider, SocketContext }
