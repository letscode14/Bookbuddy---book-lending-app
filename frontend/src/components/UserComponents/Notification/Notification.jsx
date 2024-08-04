import React, { useContext, useState } from 'react'
import { useEffect, useRef } from 'react'
import './Notification.css'
import { SocketContext } from '../../../Socket/SocketContext'
import { useDispatch, useSelector } from 'react-redux'
import {
  addFollowing,
  removeFollowing,
  selecUser,
} from '../../../store/slice/userAuth'
import {
  followUser,
  getNotification,
  unfollowUser,
} from '../../../Service/Apiservice/UserApi'
import { useNotificaitonContext } from '../../../Context/NotificationContext'
import Suggestions, { ResponsiveSuggestion } from '../Suggestions/Suggestions'
import ReponsiveNav from '../Navbar/ReponsiveNav'
import { getShuffledIndexes } from '../../../../helpers/ValidationHelpers/helper'
import { useNavigate } from 'react-router-dom'

const ImageComponent = React.lazy(() => import('../../ImageComponent/Image'))

export default function Notification() {
  const socket = useContext(SocketContext)
  const notification = useRef()
  const { user, userDetails } = useSelector(selecUser)
  const dispatch = useDispatch()
  const contentPage = useRef(null)

  const [pageNo, setPageNo] = useState(1)
  const [notificaitons, setNotificaitons] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const { setUnreadNum } = useNotificaitonContext()
  const [loading, setLoading] = useState(true)
  const [notiLaoding, setNotiLoading] = useState(false)
  const { doFetch } = useNotificaitonContext()
  const navigate = useNavigate()

  useEffect(() => {
    notification.current.style.right = '12px'
    document.title = 'Notifications'
    setUnreadNum(0)
  }, [])

  useEffect(() => {
    setNotiLoading(true)
    const fetchNotification = async (userId, pageNo, unRead) => {
      try {
        const response = await getNotification(userId, pageNo, unRead)
        if (response) {
          setNotiLoading(false)
          setNotificaitons((prev) => [...prev, ...response.notifications])
          setHasMore(response.hasMore)
          setUnreadNum('')
        }
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
        setNotiLoading(false)
      }
    }
    fetchNotification(user, pageNo, 0)
  }, [pageNo, doFetch])

  const handleFollow = async (userId, target) => {
    const response = await followUser(userId, target)
    if (response) {
      socket.emit('new follower', {
        _id: userDetails._id,
        userProfile: userDetails.profileUrl,
        userName: userDetails.userName,
        sendTo: target,
      })
      dispatch(addFollowing(target))
    }
  }
  const handleUnFollow = async (userId, target) => {
    const response = await unfollowUser(userId, target)
    if (response) {
      dispatch(removeFollowing(target))
      socket.emit('un follow', { _id: userId, target: target })
    }
  }

  const handleScroll = () => {
    if (!contentPage.current) return

    const { scrollTop, scrollHeight, clientHeight } = contentPage.current

    if (scrollTop + clientHeight >= scrollHeight - 5) {
      if (hasMore && !notiLaoding) {
        setPageNo((prevPageNo) => prevPageNo + 1)
        setNotiLoading(true)
      }
    }
  }
  const [i1, setI1] = useState()
  const [i2, setI2] = useState()
  useEffect(() => {
    if (notificaitons.length > 0) {
      const [index2, index3] = getShuffledIndexes(notificaitons?.length)
      setI1(index2)
      setI2(index3)
    }
  }, [notificaitons])
  useEffect(() => {
    if (socket) {
      socket.on('newnotification', ({ notification }) => {
        setNotificaitons((prev) => [notification, ...prev])
      })
    }
  }, [socket])

  return (
    <>
      <ReponsiveNav />
      <div
        ref={notification}
        className="rounded-[40px]  right-[12px] ps-20 pe-20   overflow-auto    home-content absolute top-3 bottom-3 flex   bg-[#ffffff] 
         xs:left-0 xs:right-0 xs:rounded-[0px] xs:top-0 xs:bottom-0 xs:ps-0.5 xs:pe-0.5 
         sm:left-20
         sm:ps-7 sm:pe-7
         md:left-[240px]
          lg:ps-20 lg:pe-20  lg:left-[280px] "
      >
        <div className=" w-[70%] sm:w-full  lg:w-[70%] xs:w-full">
          <div className="w-full p-5">
            <input
              type="text"
              placeholder="search"
              className="border w-[70%] xs:w-full sm:w-full lg:w-[70%] ps-2 py-1 rounded-lg "
            />
          </div>
          <div className="border mx-2"></div>

          <div
            ref={contentPage}
            style={{ scrollbarWidth: 'thin' }}
            onScroll={handleScroll}
            className=" mx-2  overflow-auto mt-3 max-h-[790px] "
          >
            {loading ? (
              <div className="mt-6 flex justify-center items-baseline  w-full">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-500"></div>
                <span className="ms-3 text-gray-500">loading... </span>
              </div>
            ) : (
              <>
                {notificaitons.length > 0 ? (
                  notificaitons.map((n, index) =>
                    n.type == 'Post' ? (
                      <div key={index} className="mt-2">
                        {i1 && i1 == index && <ResponsiveSuggestion />}
                        {i2 && i2 == index && <ResponsiveSuggestion />}
                        <div className="flex justify-between items-center  py-1 px-2">
                          <div
                            className="flex cursor-pointer"
                            onClick={() =>
                              navigate(`/user/other/${n.actionBy._id}`)
                            }
                          >
                            <div className="">
                              <div className="rounded-full overflow-hidden xs:w-9 w-12">
                                <div className="w-full rounded-full overflow-hidden ">
                                  <React.Suspense
                                    fallback={
                                      <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
                                    }
                                  >
                                    <ImageComponent
                                      src={n.actionBy?.profile?.profileUrl}
                                    />
                                  </React.Suspense>
                                </div>
                              </div>
                            </div>

                            <div className="pt-1 ms-3">
                              <div className="font-semibold text-sm xs:text-xs">
                                {n.actionBy.userName}
                              </div>
                              <div className="text-sm xs:text-xs text-gray-500 font-medium">
                                {n.content}
                                <span>
                                  .{new Date(n.createdAt).toDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="h-12">
                              <React.Suspense
                                fallback={
                                  <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
                                }
                              >
                                <ImageComponent
                                  src={n.contentId.imageUrls[0].secure_url}
                                />
                              </React.Suspense>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : n.type == 'User' ? (
                      <div key={index} className="mt-2">
                        <div className="flex justify-between items-center  py-1 px-2">
                          <div
                            className="flex cursor-pointer"
                            onClick={() =>
                              navigate(`/user/other/${n.actionBy._id}`)
                            }
                          >
                            <div className="">
                              <div className="rounded-full overflow-hidden xs:w-9 w-12">
                                <div className="w-full rounded-full overflow-hidden ">
                                  <React.Suspense
                                    fallback={
                                      <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
                                    }
                                  >
                                    <ImageComponent
                                      src={n.actionBy?.profile?.profileUrl}
                                    />
                                  </React.Suspense>
                                </div>
                              </div>
                            </div>

                            <div className="pt-1 ms-3">
                              <div className="font-semibold text-sm xs:text-xs">
                                {n.actionBy.userName}
                              </div>
                              <div className="text-sm xs:text-xs text-gray-500 font-medium">
                                {n.content}
                                <span>
                                  .{new Date(n.createdAt).toDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            {userDetails?.followingMap?.[n.actionBy?._id] ? (
                              <button
                                className="unfollow-small-button"
                                onClick={() =>
                                  handleUnFollow(user, n.actionBy?._id)
                                }
                              >
                                Unfollow
                              </button>
                            ) : (
                              <button
                                className="follow-small-button"
                                onClick={() =>
                                  handleFollow(user, n.actionBy?._id)
                                }
                              >
                                {userDetails?.followersMap?.[n.actionBy?._id]
                                  ? 'Follow back'
                                  : 'Follow'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : n.type == 'Requests' &&
                      n.type?.contentId?.stage == '' ? (
                      ''
                    ) : n.type == 'Requests' ? (
                      <div key={index} className="mt-2">
                        {i1 && i1 == index && <ResponsiveSuggestion />}
                        {i2 && i2 == index && <ResponsiveSuggestion />}
                        <div className="flex justify-between items-center  py-1 px-2">
                          <div
                            className="flex cursor-pointer"
                            onClick={() =>
                              navigate(`/user/other/${n.actionBy._id}`)
                            }
                          >
                            <div className="">
                              <div className="rounded-full overflow-hidden xs:w-9 w-12">
                                <div className="w-full rounded-full overflow-hidden ">
                                  <React.Suspense
                                    fallback={
                                      <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
                                    }
                                  >
                                    <ImageComponent
                                      src={n.actionBy?.profile?.profileUrl}
                                    />
                                  </React.Suspense>
                                </div>
                              </div>
                            </div>

                            <div className="pt-1 ms-3 xs:text-xs text-sm">
                              <div className="font-semibold ">
                                {n.actionBy.userName}
                              </div>
                              <div className=" text-gray-500 font-medium">
                                {n.content}.{' '}
                                <span className="font-semibold text-black">
                                  ID:{n.contentId.book.ID}
                                </span>
                                <span>
                                  .{new Date(n.createdAt).toDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="h-12">
                              <React.Suspense
                                fallback={
                                  <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
                                }
                              >
                                <ImageComponent
                                  src={n.contentId.book?.imageUrl?.secure_url}
                                />
                              </React.Suspense>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      ''
                    )
                  )
                ) : (
                  <div className="text-center mt-2 text-gray-500">
                    No notifications yet
                  </div>
                )}
                {notiLaoding && notificaitons.length > 0 && (
                  <div className="mt-6 flex justify-center items-baseline  w-full">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-500"></div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <Suggestions />
      </div>
    </>
  )
}
