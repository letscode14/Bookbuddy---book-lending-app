// Create a new context for menu state
import { createContext, useContext, useState } from 'react'

const MenuContext = createContext()

export const useMenuContext = () => useContext(MenuContext)

export const MenuProvider = ({ children }) => {
  const [menu, setMenu] = useState(0)

  return (
    <MenuContext.Provider value={{ menu, setMenu }}>
      {children}
    </MenuContext.Provider>
  )
}
