import Logo from '/images/Logo2.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  faSearch,
  faHome,
  faMessage,
  faCompass,
  faBell,
  faPlus,
  faPeopleGroup,
  faBars,
} from '@fortawesome/free-solid-svg-icons'

import './Navbar.css'
import { selecUser } from '../../../store/slice/userAuth'
import { useSelector } from 'react-redux'
import { useMenuContext } from '../../../Context/Context'
import { useNotificaitonContext } from '../../../Context/NotificationContext'

export default function Navbar() {
  const { pathname } = useLocation()
  const { userDetails } = useSelector(selecUser)
  const { unReadMsgNum } = useNotificaitonContext()

  const { menu, setMenu } = useMenuContext()

  const navigate = useNavigate()

  const menuHighlight = useRef(null)

  useEffect(() => {
    const element = menuHighlight.current

    switch (pathname) {
      case '/user/home':
        setMenu(0)

        break
      case '/user/search':
        setMenu(1)
        break
      case '/user/messages':
        setMenu(2)
        break

      case '/user/profile':
        setMenu(7)
        break
      case '/user/create':
        setMenu(5)
        break

      case '/user/notification':
        setMenu(4)
        break
      case '/user/explore':
        setMenu(3)
        break
      default:
        setMenu(12)
    }
  }, [pathname])

  return (
    <div className="h-24 xs:w-0 xs:overflow-hidden  menu-container pt-3 ">
      <img
        className="ms-3 h-full sm:h-[45%] sm:hidden md:flex md:h-[70%] 
        lg:h-full"
        src={Logo}
        alt=""
      />
      <div
        className="ps-8 py-2 relative navbar-menu text-[20px] mt-24
     transition-all 
     
      
      sm:ps-6 sm:mt-3 sm:text-[22px] 
      md:mt-24 md:text-[18px] 
      lg:text-[20px]"
      >
        <div
          ref={menuHighlight}
          className={` menu-highlight h-[48px] bg-[#FFFFFF] xs:w-0 z-0 absolute left-3 
             w-[230px] 
            2xl:h-[48px] 
            sm:w-[47px]
            md:w-[200px] 
            lg:w-[230px] lg:h-[48px]
            
          
             ${
               pathname == '/user/home'
                 ? 'top-[0px] lg:top-[4px]  lg:top-[0px]'
                 : pathname == '/user/search'
                   ? 'top-[50px] lg:top-[48px] lg:top-[50px]  lg:top-[50px]'
                   : pathname == '/user/messages'
                     ? 'top-[100px] lg:top-[98px] lg:top-[100px] '
                     : pathname == '/user/profile'
                       ? 'top-[350px]   lg:top-[300px] sm:top-[299px]'
                       : pathname == '/user/create'
                         ? 'top-[251px] lg:top-[245px] lg:top-[251px] '
                         : pathname == '/user/notification'
                           ? 'top-[200px] lg:top-[198px] lg:top-[189px] lg:top-[188px]'
                           : pathname == '/user/explore'
                             ? 'top-[150px] lg:top-[151px] '
                             : 'top-[-1000px]'
             }`}
        ></div>
        <div
          onClick={() => {
            setMenu(0), navigate('/user/home')
          }}
          className={`flex items-center  ${
            menu == 0 ? 'text-[#000000]' : 'text-[#ffffff]'
          }  font-bold h-8 mb-[18px] lg:mb-[14px] lg:mb-[18px]`}
        >
          <FontAwesomeIcon
            className="cursor-pointer me-4 z-20  "
            icon={faHome}
          />
          <label className=" z-20 sm:hidden md:block">Home</label>
        </div>
        <div
          onClick={() => {
            setMenu(1), navigate('/user/search')
          }}
          className={`flex items-center  ${
            menu == 1 ? 'text-[#000000]' : 'text-[#ffffff]'
          }  font-bold h-8 mb-[18px] lg:mb-[14px] lg:mb-[18px] `}
        >
          <FontAwesomeIcon
            className="cursor-pointer me-4 z-20"
            icon={faSearch}
          />
          <label className="z-20 sm:hidden md:block">Search</label>
        </div>
        <div
          onClick={() => {
            setMenu(2), navigate('/user/messages')
          }}
          className={`flex items-center  ${
            menu == 2 ? 'text-[#000000]' : 'text-[#ffffff]'
          }  font-bold h-8 mb-[18px] lg:mb-[14px] lg:mb-[18px]`}
        >
          <FontAwesomeIcon
            className="cursor-pointer me-4 z-20"
            icon={faMessage}
          />
          <label className=" z-20 sm:hidden md:block">Messages</label>
        </div>
        <div
          onClick={() => {
            setMenu(3), navigate('/user/explore')
          }}
          className={`flex items-center  ${
            menu == 3 ? 'text-[#000000]' : 'text-[#ffffff]'
          }  font-bold h-8 mb-[18px] lg:mb-[14px] lg:mb-[18px]`}
        >
          <FontAwesomeIcon
            className="cursor-pointer me-4 z-20"
            icon={faCompass}
          />
          <label className=" z-20 sm:hidden md:block ">Explore</label>
        </div>
        <div
          onClick={() => {
            setMenu(4), navigate('/user/notification')
          }}
          className={`flex items-center relative  ${
            menu == 4 ? 'text-[#000000]' : 'text-[#ffffff]'
          }  font-bold h-8 mb-[18px] lg:mb-[14px] lg:mb-[18px]`}
        >
          <div className="relative">
            {unReadMsgNum ? (
              <div className="z-20 absolute right-1 top-[-10px]  bg-red-500 text-[#ffffff] flex items-center justify-center rounded-full w-5 h-5 text-xs">
                {unReadMsgNum}
              </div>
            ) : (
              ''
            )}
            <FontAwesomeIcon
              className="cursor-pointer me-4 z-20"
              icon={faBell}
            />
          </div>

          <label className=" z-20 sm:hidden md:block">Notification</label>
        </div>
        <div
          onClick={() => {
            setMenu(5), navigate('/user/create')
          }}
          className={`flex items-center  ${
            menu == 5 ? 'text-[#000000]' : 'text-[#ffffff]'
          }  font-bold h-8 mb-[18px]  lg:mb-[18px]`}
        >
          <FontAwesomeIcon className="cursor-pointer me-4 z-20" icon={faPlus} />
          <label className=" z-20 sm:hidden md:block">Create</label>
        </div>

        <div
          onClick={() => {
            setMenu(7), navigate('/user/profile')
          }}
          className={`flex items-center   ${
            menu == 7 ? 'text-[#000000]' : 'text-[#ffffff]'
          }  font-bold h-8 mb-[18px] lg:mb-[18px]`}
        >
          <div className="cursor-pointer rounded-full z-20  overflow-hidden bg-[#ffffff] h-7 w-7 me-2">
            <img src={userDetails?.profileUrl} alt="" />
          </div>
          <div className="z-20 ">
            <label className=" sm:hidden md:block">Profile</label>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <img
          className="ms-3 hidden   h-full sm:h-[20px] sm:block md:hidden"
          src={Logo}
          alt=""
        />
      </div>
    </div>
  )
}
