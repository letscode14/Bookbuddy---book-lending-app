import React from 'react'

import { useEffect, useRef, useState } from 'react'

import { useSelector } from 'react-redux'
import { selectLoading } from '../../../../store/slice/loadinSlice'

import '../Profile.css'
import { useLocation, useParams } from 'react-router-dom'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBook,
  faCalendar,
  faCircleCheck,
  faCircleExclamation,
  faHandshake,
  faImages,
} from '@fortawesome/free-solid-svg-icons'

import ContentModal from '../../../Modal/ContentModal'

import Post from '../Post/Post'
import { getUser } from '../../../../Service/Apiservice/UserApi'
import FollowerList from '../FollowersList/FollowerList'
import FollowingList from '../FollowingLIst/FollowingList'
import Bookshelf from '../Bookshelf/Bookshelf'
import { selecUser } from '../../../../store/slice/userAuth'
const ImageComponent = React.lazy(() => import('../../../ImageComponent/Image'))
export default function OtherProfile() {
  const { id } = useParams()
  const { user } = useSelector(selecUser)

  const contentPage = useRef(null)
  const [bio, setBio] = useState(false)
  const lineMenu = useRef(null)
  const [menu, setMenu] = useState(0)
  const [userDetails, setUserDetails] = useState({})

  const [followingIds, setFollowingId] = useState({})
  const [followersIds, setFollowerId] = useState({})
  const [metaData, setMetaData] = useState({})
  const { isLoading } = useSelector(selectLoading)
  const { pathname } = useLocation()
  const [loading, setLoading] = useState(true)

  const [userData, setUserData] = useState()
  const [modalFor, setModaFor] = useState('')
  useEffect(() => {
    const element = contentPage.current
    document.title = `${id}`
    element.style.right = '12px'
  }, [pathname])

  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleContentModalClose = () => {
    setUserData(userDetails)
    setIsModalOpen(false)
    setModaFor('')
  }

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await getUser(id, user)
        console.log(response)

        if (response) {
          setUserDetails(response.user)
          setUserData(response.user)
          setFollowingId(response.followingMap)
          setFollowerId(response.followersMap)
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
  }, [menu])

  return (
    <>
      <ContentModal
        isContentModalOpen={isModalOpen}
        onContentClose={handleContentModalClose}
      >
        {modalFor == 'followers' && <FollowerList user={userData} />}
        {modalFor == 'following' && <FollowingList user={userData} />}
      </ContentModal>
      <div
        ref={contentPage}
        className="  ps-20  profile-content overflow-y-auto  absolute flex top-3 bottom-3 bg-[#ffffff]"
      >
        {loading && (
          <div className="w-full h-full flex justify-center items-center">
            <div className="pulse-container">
              <div className="wave-loading"></div>
              <div className="wave-loading"></div>
              <div className="pulse-loading flex items-center justify-center"></div>
            </div>
          </div>
        )}
        <div className={`w-[65%] pt-10 ${loading ? 'hidden' : ''}`}>
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
                  <div className="text-xl font-medium">{userDetails.name}</div>
                </div>

                <div className="mt-3 ms-3">
                  <div>
                    <span className="font-bold ps-3">Bio</span>
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

            <div className="ms-16 px-20 profile-right-container bg-[#ede9f7] shadow-lg rounded-lg">
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
                  <div className="text-center">{'3'}</div>
                  <div className="text-center">Posts</div>
                </div>
              </div>

              {userDetails.lendscore ? (
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
                          src={userDetails.lendscore.badgeId.iconUrl.secureUrl}
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
              ) : (
                <div className=" h-48   fit-content py-2 mt-3  ">
                  <div className=" p-4 border h-full w-[460px] bg-[#ede9f7] shadow-lg rounded-lg">
                    <div className="">
                      <div className="flex items-start">
                        <FontAwesomeIcon
                          className="me-2 text-red-400"
                          icon={faCircleExclamation}
                        />
                        <p className="text-sm  text-wrap">
                          The user you are attempting to interact with is not
                          verified user
                          <p>
                            <span className="font-semibold">
                              No Caution Deposit:
                            </span>{' '}
                            If you choose to initiate a transaction with this
                            user on a personal basis, you will not recieve
                            service for the transaction
                            <p>
                              <span className="font-semibold">
                                No Compensation for Book Damage:
                              </span>{' '}
                              In the event of book damage, you will not be
                              compensated. The app will not be responsible for
                              any damages or losses incurred.
                            </p>
                          </p>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-3 justify-center mt-2 mb-5">
                {followersIds[user] ? (
                  <button
                    disabled={isLoading}
                    className="log-out-button flex justify-center"
                  >
                    unfollow
                  </button>
                ) : followingIds[user] ? (
                  <button
                    disabled={isLoading}
                    className="log-out-button flex justify-center"
                  >
                    follow back
                  </button>
                ) : (
                  <button
                    disabled={isLoading}
                    className="log-out-button flex justify-center"
                  >
                    follow
                  </button>
                )}

                <button className="edit-profile-button">Message</button>
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

          {menu == 0 && userData && <Post user={id} />}
          {menu == 1 && <Bookshelf userId={id} />}
        </div>
        <div className="">
          <div className="fixed  ms-1 border-line-vertical"></div>
        </div>
      </div>
    </>
  )
}
