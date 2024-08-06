import React from 'react'

import { useEffect, useRef, useState } from 'react'

import { useSelector } from 'react-redux'
import { selectLoading } from '../../../../store/slice/loadinSlice'

import '../Profile.css'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBook,
  faCalendar,
  faCircleCheck,
  faCircleExclamation,
  faEllipsis,
  faHandshake,
  faImages,
} from '@fortawesome/free-solid-svg-icons'

import ContentModal from '../../../Modal/ContentModal'

import Post from '../Post/Post'
import {
  followUser,
  getUser,
  unfollowUser,
} from '../../../../Service/Apiservice/UserApi'
import FollowerList from '../FollowersList/FollowerList'
import FollowingList from '../FollowingLIst/FollowingList'
import Bookshelf from '../Bookshelf/Bookshelf'
import { selectMap, selecUser } from '../../../../store/slice/userAuth'
import { useChatContext } from '../../../../Context/ChatContext'
import Report from '../../Report/Report'
import Suggestions, {
  ResponsiveSuggestion,
} from '../../Suggestions/Suggestions'
import ReponsiveNav from '../../Navbar/ReponsiveNav'
const ImageComponent = React.lazy(() => import('../../../ImageComponent/Image'))
export default function OtherProfile() {
  const { id } = useParams()
  console.log(id)
  const { user } = useSelector(selecUser)
  const { createChat } = useChatContext()
  const navigate = useNavigate()

  const contentPage = useRef(null)
  const [bio, setBio] = useState(false)
  const lineMenu = useRef(null)
  const [menu, setMenu] = useState(0)
  const [userDetails, setUserDetails] = useState(null)

  const [followingIds, setFollowingId] = useState({})
  const [followersIds, setFollowerId] = useState({})
  const [metaData, setMetaData] = useState({})
  const { isLoading } = useSelector(selectLoading)
  const { pathname } = useLocation()
  const [loading, setLoading] = useState(true)
  const [menuShow, setMenuShow] = useState(false)
  const [reportDetails, setReporDetails] = useState({})

  //Current user datals
  const { email, userName } = useSelector(selectMap)

  const [userData, setUserData] = useState(null)
  const [modalFor, setModaFor] = useState('')
  useEffect(() => {
    const element = contentPage.current
    document.title = `${id}`
  }, [pathname])

  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleContentModalClose = () => {
    setUserData(userDetails)
    setIsModalOpen(false)
    setModaFor('')
  }

  useEffect(() => {
    setLoading(true)
    async function fetchUser() {
      try {
        const response = await getUser(id, user)
        if (response) {
          setLoading(false)
          setUserDetails(response.user)
          setUserData(response.user)
          setFollowingId(response.followingMap)
          setFollowerId(response.followersMap)
          setMetaData({
            followers: Number(response.followersLength),
            following: Number(response.followingLength),
            postLength: response.postLength,
          })
        }
      } catch (error) {
        console.log(error)
        setLoading(false)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [id])

  const handleMessage = (senderId, userId) => {
    createChat(senderId, userId)
  }

  const handleFollow = async (userId, targetId) => {
    const response = await followUser(userId, targetId)
    if (response) {
      setFollowerId((prev) => ({ ...prev, [userId]: true }))
      setMetaData((prev) => ({ ...prev, followers: prev.followers + 1 }))
    }
  }

  const handleUnFollow = async (userId, targetId) => {
    const response = await unfollowUser(userId, targetId)
    if (response) {
      setFollowerId((prev) => ({ ...prev, [userId]: false }))
      setMetaData((prev) => ({ ...prev, followers: prev.followers - 1 }))
    }
  }

  return (
    <>
      <ReponsiveNav />
      <ContentModal
        isContentModalOpen={isModalOpen}
        onContentClose={handleContentModalClose}
      >
        {modalFor == 'report' && (
          <Report
            reportData={reportDetails}
            onClose={handleContentModalClose}
          />
        )}
        {modalFor == 'followers' && <FollowerList user={userData} />}
        {modalFor == 'following' && <FollowingList user={userData} />}
      </ContentModal>
      <div
        ref={contentPage}
        className="rounded-[40px] right-[12px] ps-20 pe-20  overflow-auto    home-content absolute top-3 bottom-3 flex   bg-[#ffffff] 
      xs:left-1 xs:right-1 xs:rounded-[10px] xs:top-1 xs:bottom-1 xs:ps-1 xs:pe-1  
       sm:left-20 sm:pe-5 sm:ps-5
          sm:pe-10 sm:ps-10
          md:left-[240px] 
          lg:left-[280px] lg:pe-7 lg:ps-7
           xl:ps-20 
          "
      >
        {loading ? (
          <div className="w-full h-full flex justify-center items-center">
            <div className="pulse-container">
              <div className="wave-loading"></div>
              <div className="wave-loading"></div>
              <div className="pulse-loading flex items-center justify-center"></div>
            </div>
          </div>
        ) : !userData ? (
          <div className="w-full h-full flex justify-center items-center">
            <div className="pulse-container">
              <div className="wave-loading"></div>
              <div className="wave-loading"></div>
              <div className="pulse-loading flex items-center justify-center"></div>
            </div>
          </div>
        ) : (
          <>
            <div className={`flex w-full   ${loading ? 'hidden' : ''}`}>
              <div
                className={`w-[65%]
               xs:w-full pt-10  
               xs:pt-5 xs:px-1 
               xl:w-[66%]

               sm:w-full lg:w-[65%]`}
              >
                <div
                  className="relative flex  
              xs:block   xs:w-full  
               sm:w-full sm:pe-12"
                >
                  <div className="absolute right-0 md:top-[-38px] sm:top-[-38px] xs:top-[-15px] lg:top-[-38px]">
                    <FontAwesomeIcon
                      onClick={() => setMenuShow(!menuShow)}
                      icon={faEllipsis}
                      className="me-4 mt-4 text-2xl cursor-pointer xs:mt-2 xs:text-xl"
                    />
                    <div
                      className={`gap-y-1 grid  text-[#ffffff] absolute
                     ${menuShow ? 'py-2 ' : 'h-0'}  px-3 overflow-hidden 
                       z-20 rounded-b-2xl rounded-ss-2xl bg-[#512da8] text-sm
                       left-[-170px]
                   w-44 uppercase transition-all duration-100 xs:text-xs xs:w-40 xs:left-[-150px]`}
                    >
                      <div
                        onClick={() => {
                          setReporDetails({
                            culprit: userDetails._id,
                            contentId: userDetails._id,
                            userId: user,
                            email: email,
                            userName: userName,
                            type: 'User',
                          })
                          setModaFor('report')
                          setIsModalOpen(true)
                        }}
                        className="cursor-pointer"
                      >
                        Report
                      </div>
                      <div
                        onClick={() => {
                          handleMessage(user, userDetails._id)
                          navigate('/user/messages')
                        }}
                        className="cursor-pointer"
                      >
                        Message
                      </div>
                    </div>
                  </div>
                  <div
                    className="   
                 xs:flex w-40 xs:w-full"
                  >
                    <div className="">
                      <div className="fit-content relative inline-block">
                        <div
                          className="rounded-full relative   overflow-hidden  w-[210px]  
                  xs:w-28 xs:h-28
                  sm:h-32 sm:w-32 
                  md:w-[150px] md:h-[150px]
                  lg:w-[160px] lg:h-[160px]
                  xl:w-[150px] xl:h-[150px] 
                  2xl:w-[180px] 2xl:h-[180px] "
                        >
                          <React.Suspense
                            fallback={
                              <div className="animate-spin rounded-full h-7 w-7  border-t-2 border-b-2 border-[#512da8]"></div>
                            }
                          >
                            <ImageComponent
                              src={userData?.profile?.profileUrl}
                            />
                          </React.Suspense>
                        </div>
                        {userDetails.isSubscribed && (
                          <FontAwesomeIcon
                            className="text-4xl text-[#512da8] absolute bg-[#ffffff] rounded-full bottom-2 right-5 z-30 
                        xs:text-xl xs:bottom-0 xs:right-5
                      sm:text-2xl sm:right-3 
                      lg:text-4xl"
                            icon={faCircleCheck}
                          />
                        )}
                      </div>
                    </div>

                    <div
                      className="mt-3 grid  grid-cols-2 
                xs:mt-0 xs:ms-9"
                    >
                      <div className="">
                        <div
                          className="font-bold text-2xl 
                    xs:text-lg 
                    sm:text-xl 
                    lg:text-2xl 
                  max-w-60 w-40  truncate xs:max-w-full"
                        >
                          {userDetails.userName}
                        </div>
                        <div
                          className="text-xl font-medium 
                    xs:text-base 
                    sm:text-xl"
                        >
                          {userDetails.name}
                        </div>
                        <div
                          className="mt-3 ms-3 
                    xs:mt-0 xs:ms-0
                    sm:mt-0 sm:ms-0 "
                        >
                          <div>
                            <span className="font-bold xs:text-sm">Bio</span>
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
                          <div
                            className={`text-md ms-3 ${bio ? `` : 'hidden'}`}
                          >
                            {userDetails.about}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="ms-16 grow  px-20  bg-[#ede9f7] shadow-lg rounded-lg 
              xs:ms-0 xs:px-1 xs:ms-4 xs:me-4 xs:py-0.5
              sm:ms-4 sm:px-3 
              lg:px-5  lg:ms-5 
              xl:px-16 xl:ms-16 xl:pb-3"
                  >
                    <div
                      className="grid font-bold mt-3 text-2xl grid-cols-3 gap-4 
                xs:text-sm xs:gap-3 
                sm:text-xl sm:gap-2 
                lg:text-[20px] lg:py-2 
                xl:text-2xl"
                    >
                      <div className=" ">
                        <div className="text-center xs:text-xl">
                          {metaData.followers}
                        </div>
                        <div
                          className="cursor-pointer text-center xs:text-sm"
                          onClick={() => {
                            setModaFor('followers')
                            setIsModalOpen(true)
                          }}
                        >
                          Followers
                        </div>
                      </div>
                      <div className="">
                        <div className="text-center xs:text-xl">
                          {metaData.following}
                        </div>
                        <div
                          className="text-center cursor-pointer xs:text-sm"
                          onClick={() => {
                            setModaFor('following')
                            setIsModalOpen(true)
                          }}
                        >
                          Following
                        </div>
                      </div>
                      <div className=" ">
                        <div className="text-center xs:text-xl">
                          {metaData?.postLength | 0}
                        </div>
                        <div className="text-center xs:text-sm">Posts</div>
                      </div>
                    </div>

                    {userData.lendscore ? (
                      <div className=" p-2 h-48 my-3 flex  w-full xs:h-20 xs:my-3">
                        <div className=" flex items-center justify-center w-full">
                          <div className="h-32 rotating-image xs:h-12">
                            <React.Suspense
                              fallback={
                                <div className="animate-spin rounded-full h-7 w-7  border-t-2 border-b-2 border-[#512da8]"></div>
                              }
                            >
                              <ImageComponent
                                className="object-contain"
                                src={
                                  userDetails.lendscore.badgeId.iconUrl
                                    .secureUrl
                                }
                              />
                            </React.Suspense>
                          </div>
                        </div>
                        <div className=" flex items-center justify-center w-full ">
                          <div
                            className="text-center grid gap-y-3 xs:gap-y-1 
                        sm:gap-y-1 lg:gap-y-3"
                          >
                            <div
                              className="text-2xl font-medium 
                          xs:text-base 
                          sm:text-xl 
                          lg:text-2xl"
                            >
                              Lendscore
                            </div>
                            <div
                              className="text-5xl font-semibold 
                          xs:text-xl 
                          sm:text-4xl 
                          lg:text-5xl"
                            >
                              {userData.lendscore.lendScore}
                            </div>
                            <div
                              className="text-2xl font-medium 
                          xs:text-lg
                          sm:text-xl 
                          lg:text-2xl"
                            >
                              {userData.lendscore.badgeId.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className=" h-48   fit-content py-2 mt-3  ">
                        <div className=" p-4 border h-full w-[460px] bg-[#ede9f7] shadow-lg rounded-lg xs:w-full xs:overflow-auto">
                          <div className="">
                            <div className="flex items-start">
                              <FontAwesomeIcon
                                className="me-2 text-red-400"
                                icon={faCircleExclamation}
                              />
                              <p className="text-sm  text-wrap xs:text-xs ">
                                The user you are attempting to interact with is
                                not verified user
                                <p>
                                  <span className="text-sm font-semibold   text-wrap xs:text-xs ">
                                    No Caution Deposit:
                                  </span>{' '}
                                  If you choose to initiate a transaction with
                                  this user on a personal basis, you will not
                                  recieve service for the transaction
                                  <p>
                                    <span className="text-sm  mt-2 font-semibold xs:text-xs">
                                      No Compensation for Book Damage:
                                    </span>{' '}
                                    In the event of book damage, you will not be
                                    compensated. The app will not be responsible
                                    for any damages or losses incurred.
                                  </p>
                                </p>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-3 justify-center mt-4 mb-4">
                      {followersIds[user] ? (
                        <button
                          disabled={isLoading}
                          className="bg-[#512da8] text-[#ffffff] 
                          text-[14px] text-nowrap py-3 flex justify-center
                           items-center rounded-lg font-semibold uppercase w-[200px] cursor-pointer flex justify-center
                          xs:text-xs xs:w-full xs:py-2
                          sm:w-40 sm:text-xs sm:py-2 sm:px-2
                          lg:w-[150px] lg:text-[12px] lg:py-3
                          xl:w-[165px] xl:text-[14px]
      
                          "
                          onClick={() => handleUnFollow(user, userDetails._id)}
                        >
                          unfollow
                        </button>
                      ) : followingIds[user] ? (
                        <button
                          disabled={isLoading}
                          className="bg-[#512da8] text-[#ffffff] 
                          text-[14px] text-nowrap py-3 flex justify-center
                           items-center rounded-lg font-semibold uppercase w-[200px] cursor-pointer flex justify-center
                          xs:text-xs xs:w-full xs:py-2
                          sm:w-40 sm:text-xs sm:py-2 sm:px-2
                          lg:w-[150px] lg:text-[12px] lg:py-3
                          xl:w-[165px] xl:text-[14px]
      
                          "
                          onClick={() => handleFollow(user, userDetails._id)}
                        >
                          follow back
                        </button>
                      ) : (
                        <button
                          disabled={isLoading}
                          className="bg-[#512da8] text-[#ffffff] 
                    text-[14px] text-nowrap py-3 flex justify-center
                     items-center rounded-lg font-semibold uppercase w-[200px] cursor-pointer flex justify-center
                    xs:text-xs xs:w-full xs:py-2
                    sm:w-40 sm:text-xs sm:py-2 sm:px-2
                    lg:w-[150px] lg:text-[12px] lg:py-3
                    xl:w-[165px] xl:text-[14px]

                    "
                          onClick={() => handleFollow(user, userDetails._id)}
                        >
                          follow
                        </button>
                      )}

                      <button
                        onClick={() => {
                          handleMessage(user, userDetails._id)
                          navigate('/user/messages')
                        }}
                        className="border-[#512da8] border  text-[#512da8] text-[14px] text-nowrap py-3 flex justify-center items-center rounded-lg font-semibold uppercase w-[200px] cursor-pointer flex justify-center
                        xs:text-xs xs:w-full xs:py-1 
                        sm:w-40 sm:text-xs sm:py-2 sm:px-2
                        lg:w-[150px] lg:text-[12px] lg:py-3 
                        xl:w-[165px] xl:text-[14px]"
                      >
                        Message
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-line mt-5"></div>

                <ResponsiveSuggestion />
                <div className="border-line hidden xs:flex  mt-5 sm:flex lg:hidden"></div>

                <div
                  className="flex  lg:flex gap-7 mt-2 justify-center  menu-profile text-[17px] 
            xs:text-lg xs:gap-7 
            lg:text-[15px]"
                >
                  <div
                    onClick={() => setMenu(0)}
                    className={
                      menu == 0
                        ? `${'flex lg:px-3 xs:border xs:bg-[#512da8] xs:text-[#ffffff]  xs:p-1 xs:rounded-lg xs:ps-2 transition-all duration-200 sm:border sm:bg-[#512da8] sm:text-[#ffffff]  sm:p-1 sm:rounded-lg sm:ps-2 '}`
                        : 'text-gray-400 flex'
                    }
                  >
                    <FontAwesomeIcon
                      icon={faImages}
                      className="me-1 sm:text-xl 
                cursor-pointer"
                    />
                    <span
                      className=" cursor-pointer font-semibold 
                xs:hidden 
                sm:hidden
                lg:flex"
                    >
                      POSTS
                    </span>
                  </div>
                  <div
                    onClick={() => setMenu(1)}
                    className={
                      menu == 1
                        ? 'flex lg:px-3 xs:border xs:bg-[#512da8] xs:text-[#ffffff]  xs:p-1 xs:rounded-lg xs:ps-2 transition-all duration-200 sm:border sm:bg-[#512da8] sm:text-[#ffffff]  sm:p-1 sm:rounded-lg sm:ps-2'
                        : 'flex text-gray-400'
                    }
                  >
                    <FontAwesomeIcon
                      icon={faBook}
                      className="me-1 sm:text-xl 
                cursor-pointer"
                    />
                    <span
                      className="cursor-pointer font-semibold 
                xs:hidden sm:hidden
                lg:flex"
                    >
                      BOOKSHELF
                    </span>
                  </div>
                </div>

                <div className="relative">
                  {menu == 0 && userData && <Post user={id} />}
                  {menu == 1 && <Bookshelf userId={id} />}
                </div>
              </div>

              <div className="">
                <div className="fixed  ms-1 border-line-vertical xs:hidden sm:hidden lg:block "></div>
              </div>
              <Suggestions />
            </div>
          </>
        )}
      </div>
    </>
  )
}
