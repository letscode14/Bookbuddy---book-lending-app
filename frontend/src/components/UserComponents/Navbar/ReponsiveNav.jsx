import {
  faBell,
  faCompass,
  faHome,
  faMessage,
  faPlus,
  faSearch,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useMenuContext } from '../../../Context/Context'
import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { selecUser } from '../../../store/slice/userAuth'

export default function ReponsiveNav() {
  const navigate = useNavigate()
  const { activeRmenu, setMenuActive, menuNo, setMenuNo } = useMenuContext()
  const { userDetails } = useSelector(selecUser)

  const menuRef = useRef(null)
  const menuContainer = useRef(null)

  const handleClickOutside = (event) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target) &&
      !menuContainer.current.contains(event.target) &&
      event.target.tagName !== 'path'
    ) {
      setMenuActive(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  return (
    <div
      className={`cursor-pointer  transition-all duration-500  rounded-e-[30px] text-xl bg-[#512da8] absolute xs:block hidden  overflow-hidden hover:opacity-100  drop-shadow-2xl  z-50    ${activeRmenu ? ' p-2  w-16 top-[20%] grid h-[400px]' : 'top-[45%] h-28 w-3 hover:w-5 h-30  opacity-50 '} `}
    >
      <div
        ref={menuContainer}
        className="flex relative transition-all duration-200 flex-col justify-between items-center me-2 h-full py-4 text-[#ffffff]"
      >
        <div
          ref={menuRef}
          onBlur={() => setMenuActive(false)}
          onClick={() => setMenuActive(!activeRmenu)}
          className={`border absolute right-[-8px]  border-2 hover:border-4 rounded-lg h-10 ${activeRmenu ? 'top-[42%]' : 'top-[30%] me-1'}`}
        ></div>
        {activeRmenu && (
          <>
            {' '}
            <div
              onClick={() => navigate('/user/home')}
              className={`hover:border ${menuNo == 0 ? 'border' : ''} py-1 px-2 h-10 rounded-xl`}
            >
              <FontAwesomeIcon icon={faHome} />
            </div>
            <div
              onClick={() => navigate('/user/search')}
              className={`hover:border py-1 ${menuNo == 1 ? 'border' : ''} px-2 h-10 rounded-xl`}
            >
              <FontAwesomeIcon icon={faSearch} />
            </div>
            <div
              onClick={() => navigate('/user/messages')}
              className={`hover:border py-1 ${menuNo == 2 ? 'border' : ''} px-2 h-10  rounded-xl`}
            >
              <FontAwesomeIcon icon={faMessage} />
            </div>
            <div
              onClick={() => navigate('/user/explore')}
              className={`hover:border py-1 ${menuNo == 3 ? 'border' : ''} px-2 h-10 rounded-xl`}
            >
              <FontAwesomeIcon icon={faCompass} />
            </div>
            <div
              className={`hover:border py-1 ${menuNo == 4 ? 'border' : ''} px-2 h-10 rounded-xl`}
            >
              <FontAwesomeIcon icon={faBell} />
            </div>
            <div
              onClick={() => navigate('/user/create')}
              className={`hover:border py-1 ${menuNo == 5 ? 'border' : ''} px-2 h-10 rounded-xl`}
            >
              <FontAwesomeIcon icon={faPlus} />
            </div>
            <div
              className={`hover:border ${menuNo == 6 ? 'border' : ''} py-1 px-1 h-10 rounded-xl`}
              onClick={() => navigate('/user/profile')}
            >
              <div className="rounded-full z-20 overflow-hidden bg-[#ffffff] h-7 w-7">
                <img src={userDetails?.profileUrl} alt="" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
