// Create a new context for menu state
import { createContext, useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const MenuContext = createContext()

export const useMenuContext = () => useContext(MenuContext)

export const MenuProvider = ({ children }) => {
  const { pathname } = useLocation()
  const [menu, setMenu] = useState(0)
  const [menuNo, setMenuNo] = useState()
  const [activeRmenu, setMenuActive] = useState(false)
  useEffect(() => {
    switch (pathname) {
      case '/user/home':
        setMenuNo(0)

        break
      case '/user/search':
        setMenuNo(1)
        break

      case '/user/messages':
        setMenuNo(2)
        break
      case '/user/explore':
        setMenuNo(3)
        break
      case '/user/notification':
        setMenuNo(4)
        break
      case '/user/create':
        setMenuNo(5)
        break

      case '/user/profile':
        setMenuNo(6)
        break

      default:
        setMenuNo(12)
    }
  }, [pathname])
  return (
    <MenuContext.Provider
      value={{
        menu,
        activeRmenu,
        setMenuActive,
        setMenu,
        menuNo,
        setMenuNo,
      }}
    >
      {children}
    </MenuContext.Provider>
  )
}
