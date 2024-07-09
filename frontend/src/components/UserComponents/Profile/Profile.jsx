import React from 'react'

import { useEffect, useRef, useState } from 'react'
import {
  removeUser,
  saveUserDetails,
  selecUser,
} from '../../../store/slice/userAuth'

import { useDispatch, useSelector } from 'react-redux'
import { startLoading, stopLoading } from '../../../store/slice/loadinSlice'
import { selectLoading } from '../../../store/slice/loadinSlice'

import './Profile.css'
import { useLocation, useNavigate } from 'react-router-dom'
import axiosInstance from '../../../Service/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBook,
  faCalendar,
  faCircleCheck,
  faCircleExclamation,
  faHandshake,
  faImages,
} from '@fortawesome/free-solid-svg-icons'
import { showSuccessToast } from '../../../utils/toast'

import ContentModal from '../../Modal/ContentModal'

import Post from './Post/Post'
import { useConfirmationModal } from '../../Modal/ModalContext'
import { getUser } from '../../../Service/Apiservice/UserApi'
import EditUser from './EditUser/EditUser'
import { setVerifyFalse } from '../../../store/slice/VerifyEmailAuth'
import FollowerList from './FollowersList/FollowerList'
import FollowingList from './FollowingLIst/FollowingList'
import Bookshelf from './Bookshelf/Bookshelf'
import Subscribe from '../Subscribe/Subscribe'
const ImageComponent = React.lazy(() => import('../../ImageComponent/Image'))
export default function Search() {
  //modal state

  const contentPage = useRef(null)
  const [bio, setBio] = useState(false)
  const lineMenu = useRef(null)
  const [menu, setMenu] = useState(0)
  const [userDetails, setUserDetails] = useState({})

  const { isLoading } = useSelector(selectLoading)
  const { user } = useSelector(selecUser)
  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [userData, setUserData] = useState()
  const { showModal } = useConfirmationModal()
  const [metaData, setMetaData] = useState({})

  const [modalFor, setModaFor] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const element = contentPage.current
    document.title = 'Profile'
    element.style.right = '12px'
  }, [pathname])
  const logout = async () => {
    dispatch(startLoading())
    const response = await axiosInstance.post('/user/logout')
    if (response.status === 200) {
      dispatch(removeUser())

      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      dispatch(stopLoading())
      showSuccessToast('Logged out success fully')
      navigate('/login')
    }
  }
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleContentModalClose = () => {
    dispatch(setVerifyFalse())
    setUserData(userDetails)
    setIsModalOpen(false)
    setModaFor('')
    dispatch(stopLoading())
  }

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await getUser(user, null)
        if (response) {
          dispatch(
            saveUserDetails({
              _id: response.user._id,
              email: response.user.email,
              isSubscribed: response.user.isSubscribed,
              isGoogleSignUp: response.user.isGoogleSignUp,
              privacy: response.user.privacy,
              profileUrl: response.user.profile.profileUrl,
              name: response.user.name,
              userName: response.user.userName,
            })
          )
          setUserDetails(response.user)
          setUserData(response.user)
          setMetaData({
            followers: response.followersLength,
            following: response.followingLength,
          })
        }
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [isModalOpen])

  useEffect(() => {
    const element = lineMenu.current
    switch (menu) {
      case 0:
        element.style.left = `245px`
        element.style.width = `88px`
        break
      case 1:
        element.style.left = `354px`
        element.style.width = `132px`
        break
      case 2:
        element.style.left = `510px`
        element.style.width = `133px`
        break
      case 3:
        element.style.left = `663px`
        element.style.width = `96px`
        break
    }
    dispatch(setVerifyFalse())
  }, [menu])

  return (
    <>
      <ContentModal
        isContentModalOpen={isModalOpen}
        onContentClose={handleContentModalClose}
      >
        {modalFor == 'edituser' && (
          <EditUser userInfo={userData} onClose={handleContentModalClose} />
        )}
        {modalFor == 'followers' && <FollowerList user={userData} />}
        {modalFor == 'following' && <FollowingList user={userData} />}
        {modalFor == 'subscribe' && (
          <Subscribe close={handleContentModalClose} user={userDetails._id} />
        )}
      </ContentModal>
      <div
        ref={contentPage}
        className="  ps-20  profile-content overflow-y-auto  absolute flex top-3 bottom-3 bg-[#ffffff]"
      >
        <div className={`flex w-full ${loading ? 'hidden' : ''}`}>
          <div className={` w-[65%] pt-10  `}>
            <div className="flex">
              <div className="relative   flex  flex-col  ">
                <div className="relative">
                  <div className="rounded-full    overflow-hidden profile-photo">
                    <React.Suspense
                      fallback={
                        <div className="animate-spin rounded-full h-7 w-7  border-t-2 border-b-2 border-[#512da8]"></div>
                      }
                    >
                      <ImageComponent src={userData?.profile?.profileUrl} />
                    </React.Suspense>
                  </div>
                  {userDetails.isSubscribed && (
                    <FontAwesomeIcon
                      className="text-4xl text-[#512da8] absolute bg-[#ffffff] rounded-full bottom-2 right-5 z-30"
                      icon={faCircleCheck}
                    />
                  )}
                </div>

                <div className="mt-3 grid gap-y-2 grid-cols-2">
                  <div className="grid gap-y-2">
                    <div className="font-bold text-2xl">
                      {userDetails.userName}
                    </div>
                    <div className="text-xl font-medium">
                      {userDetails.name}
                    </div>
                    <div className="h-16">
                      <div>
                        <span className="font-bold ">Bio</span>
                        <span
                          onClick={() => {
                            if (bio) setBio(false)
                            else setBio(true)
                          }}
                          className="text-xs ms-2 font-bold text-gray-400"
                        >
                          {bio ? 'hide' : 'view'}
                        </span>
                      </div>
                      <div className={`text-md ms-3 ${bio ? `` : 'hidden'}`}>
                        {userDetails.about}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="ms-16 px-20 profile-right-container  bg-[#ede9f7] shadow-lg rounded-lg">
                <div className="grid font-bold mt-3 text-2xl grid-cols-3 gap-4">
                  <div className=" ">
                    <div className="text-center">{metaData.followers}</div>
                    <div
                      className="cursor-pointer text-center"
                      onClick={() => {
                        setModaFor('followers')
                        setIsModalOpen(true)
                      }}
                    >
                      Followers
                    </div>
                  </div>
                  <div className="">
                    <div className="text-center">{metaData.following}</div>
                    <div
                      className="text-center cursor-pointer"
                      onClick={() => {
                        setModaFor('following')
                        setIsModalOpen(true)
                      }}
                    >
                      Following
                    </div>
                  </div>
                  <div className=" ">
                    <div className="text-center">{'4'}</div>
                    <div className="text-center">Posts</div>
                  </div>
                </div>

                {userDetails.lendscore ? (
                  <>
                    <div className=" p-2 h-48 my-3 flex  w-full">
                      <div className=" flex items-center justify-center w-full">
                        <div className="h-32 rotating-image">
                          <React.Suspense
                            fallback={
                              <div className="animate-spin rounded-full h-7 w-7  border-t-2 border-b-2 border-[#512da8]"></div>
                            }
                          >
                            <ImageComponent
                              className="object-contain"
                              src={
                                userDetails.lendscore.badgeId.iconUrl.secureUrl
                              }
                            />
                          </React.Suspense>
                        </div>
                      </div>
                      <div className=" flex items-center justify-center w-full">
                        <div className="text-center grid gap-y-3">
                          <div className="text-2xl font-medium">Lendscore</div>
                          <div className="text-5xl font-semibold">
                            {userDetails.lendscore.lendScore}
                          </div>
                          <div className="text-2xl font-medium">
                            {userDetails.lendscore.badgeId.name}
                          </div>
                        </div>
                      </div>
                    </div>
                    {!userDetails.isSubscribed && (
                      <div className="flex items-center">
                        <FontAwesomeIcon
                          className="me-2 text-red-400"
                          icon={faCircleExclamation}
                        />
                        <p className="text-sm font-semibold">
                          This user is not verified
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className=" h-44   fit-content py-2 mt-3  ">
                    <div className=" p-4 border h-full w-[460px] bg-[#ede9f7] shadow-lg rounded-lg">
                      <div className="">
                        <div className="flex items-start">
                          <FontAwesomeIcon
                            className="me-2 text-red-400"
                            icon={faCircleExclamation}
                          />
                          <p className="text-sm  text-wrap">
                            Welcome to your profile page! To lend and borrow
                            books, you need to subscribe. This subscription
                            ensures that every user has access to books and
                            maintains the standard of our community.
                          </p>
                        </div>
                        <p className="text-sm ms-6 mt-2 font-semibold">
                          To subscribe, please click the button below:
                        </p>
                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              setModaFor('subscribe')
                              setIsModalOpen(true)
                            }}
                            className="py-2 ms-6 mt-2 rounded-lg w-40 bg-[#512da8] uppercase text-xs text-[#ffffff]"
                          >
                            Subscribe
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3  justify-center mt-4 mb-4">
                  <button
                    disabled={isLoading}
                    onClick={() =>
                      showModal('Are you sure you need to logout', 'user', () =>
                        logout()
                      )
                    }
                    className="log-out-button flex justify-center"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-white-900"></div>
                    ) : (
                      'logout'
                    )}
                  </button>
                  <button
                    onClick={() =>
                      showModal('Do you wish to continue', 'user', () => {
                        setIsModalOpen(true)
                        setModaFor('edituser')
                      })
                    }
                    className="edit-profile-button"
                  >
                    edit profile
                  </button>
                </div>
              </div>
            </div>

            <div className="border-line mt-5"></div>
            <div className="relative">
              <div ref={lineMenu} className="absolute line-menu"></div>
            </div>

            <div className="flex  gap-7 mt-2 justify-center  menu-profile">
              <div
                onClick={() => setMenu(0)}
                className={menu == 0 ? '' : 'text-gray-400'}
              >
                <FontAwesomeIcon icon={faImages} className="me-1" />
                <span className="cursor-pointer font-semibold">POSTS</span>
              </div>
              <div
                onClick={() => setMenu(1)}
                className={menu == 1 ? '' : 'text-gray-400'}
              >
                <FontAwesomeIcon icon={faBook} className="me-1" />
                <span className="cursor-pointer font-semibold">BOOKSHELF</span>
              </div>
              <div
                onClick={() => setMenu(2)}
                className={menu == 2 ? '' : 'text-gray-400'}
              >
                <FontAwesomeIcon icon={faHandshake} className="me-1" />
                <span className="cursor-pointer font-semibold">BORROWED</span>
              </div>
              <div
                onClick={() => setMenu(3)}
                className={menu == 3 ? '' : 'text-gray-400'}
              >
                <FontAwesomeIcon icon={faCalendar} className="me-1" />
                <span className="cursor-pointer font-semibold">LENDED</span>
              </div>
            </div>

            {menu == 0 && userData && <Post user={userData._id} />}
            {menu == 1 && <Bookshelf userId={userData._id} />}
          </div>
          <div className="">
            <div className="fixed  ms-1 border-line-vertical"></div>
          </div>
        </div>
      </div>
    </>
  )
}
