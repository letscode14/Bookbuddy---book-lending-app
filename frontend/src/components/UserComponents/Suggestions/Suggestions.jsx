import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  followUser,
  getSuggestion,
  unfollowUser,
} from '../../../Service/Apiservice/UserApi'
import { useDispatch, useSelector } from 'react-redux'
import {
  addFollowing,
  removeFollowing,
  selectMap,
  selecUser,
} from '../../../store/slice/userAuth'
import { SocketContext } from '../../../Socket/SocketContext'
const ImageComponent = React.lazy(
  () => import('../../ImageComponent/PostImage')
)
export default function Suggestions() {
  const socket = useContext(SocketContext)
  const dispatch = useDispatch()
  const [sLoading, setSloading] = useState(true)

  const [suggestions, setSuggestion] = useState([])
  const [isBloading, setSButtonLoading] = useState(false)
  const { user, userDetails } = useSelector(selecUser)
  const { followingMap, followersMap } = useSelector(selectMap)
  const [Floading, setFloading] = useState(false)
  const [isReponsive, setIsResponsive] = useState(true)

  const navigate = useNavigate()
  useEffect(() => {
    async function fetchSuggestions() {
      const response = await getSuggestion(user)
      if (response) {
        setSuggestion(response)
        setSloading(false)
        setSButtonLoading(false)
      }
    }
    if (!isReponsive || window.innerWidth > 1200) fetchSuggestions()
  }, [isReponsive])

  const handleMakeReponsive = () => {
    setIsResponsive(false)
  }

  window.addEventListener('resize', () => handleMakeReponsive())

  const handleFollow = async (userId, target) => {
    try {
      if (Floading) {
        return
      }
      setFloading(true)
      const response = await followUser(userId, target)

      if (response) {
        dispatch(addFollowing(target))
        socket.emit('new follower', {
          _id: userDetails._id,
          userProfile: userDetails.profileUrl,
          userName: userDetails.userName,
          sendTo: target,
        })
        setFloading(false)
      }
    } catch (error) {
      console.log(error)
      setFloading(false)
    }
  }

  const handleUnFollow = async (userId, target) => {
    if (Floading) {
      return
    }
    setFloading(true)
    const response = await unfollowUser(userId, target)
    if (response) {
      dispatch(removeFollowing(target))
      socket.emit('un follow', { _id: userId, target: target })
      setFloading(false)
    } else {
      setFloading(false)
    }
  }

  return (
    <div className="pt-12  sticky top-0 w-[30%]  xs:hidden  sm:hidden md:hidden  lg:block ">
      <div className="ms-6">
        <div className="text-xl font-[600] mb-6 w-full ">
          Suggestions for you
        </div>
        {sLoading ? (
          <div className=" flex ">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-500"></div>
            <span className="ms-2 text-gray-500">loading... </span>
          </div>
        ) : suggestions.length > 0 ? (
          suggestions.map((u, index) => (
            <div
              key={index}
              className=" mt-4 flex  justify-between items-center"
            >
              <div className="flex items-center">
                <div
                  className="relative cursor-pointer"
                  onClick={() => navigate(`/user/other/${u._id}`)}
                >
                  <div className="me-2 rounded-full w-10 flex items-center justify-center   overflow-hidden">
                    <React.Suspense
                      fallback={
                        <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
                      }
                    >
                      <ImageComponent src={u.profile.profileUrl} />
                    </React.Suspense>
                  </div>
                  {u.isSubscribed && (
                    <FontAwesomeIcon
                      className="text-sm text-[#512da8] absolute bg-[#ffffff] rounded-full bottom-0 right-1"
                      icon={faCircleCheck}
                    />
                  )}
                </div>
                <div className="ms-3">
                  <div
                    className="font-semibold cursor-pointer truncate w-60 lg:w-20 "
                    onClick={() => navigate(`/user/other/${u._id}`)}
                  >
                    {u.userName}
                  </div>
                  <div className="text-gray-600 text-xs">
                    <div>Suggestions for you.</div>
                  </div>
                </div>
              </div>

              <div>
                {isBloading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-500"></div>
                ) : (
                  <>
                    {followingMap?.[u?._id] ? (
                      <button
                        className="unfollow-small-button"
                        onClick={() => {
                          handleUnFollow(user, u._id)
                        }}
                      >
                        Unfollow
                      </button>
                    ) : (
                      <button
                        className="follow-small-button"
                        onClick={() => {
                          handleFollow(user, u._id)
                        }}
                      >
                        {followersMap?.[u?._id] ? 'Follow back' : 'Follow'}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-400">No suggestions!</div>
        )}
      </div>
    </div>
  )
}

export function ResponsiveSuggestion() {
  const socket = useContext(SocketContext)
  const dispatch = useDispatch()
  const [sLoading, setSloading] = useState(true)

  const [suggestions, setSuggestion] = useState([])
  const [isBloading, setSButtonLoading] = useState(false)
  const { user, userDetails } = useSelector(selecUser)
  const { followingMap, followersMap } = useSelector(selectMap)
  const [Floading, setFloading] = useState(false)
  const [isReponsive, setIsResponsive] = useState(false)

  const navigate = useNavigate()
  useEffect(() => {
    async function fetchSuggestions() {
      const response = await getSuggestion(user)

      if (response) {
        setSuggestion(response)
        setSloading(false)
        setSButtonLoading(false)
      }
    }
    if (isReponsive || window.innerWidth < 1200) {
      fetchSuggestions()
    }
  }, [isReponsive])

  const handleMakeReponsive = () => {
    setIsResponsive(true)
  }

  window.addEventListener('resize', () => handleMakeReponsive())

  const handleFollow = async (userId, target) => {
    try {
      if (Floading) {
        return
      }
      setFloading(true)
      const response = await followUser(userId, target)

      if (response) {
        dispatch(addFollowing(target))
        socket.emit('new follower', {
          _id: userDetails._id,
          userProfile: userDetails.profileUrl,
          userName: userDetails.userName,
          sendTo: target,
        })
        setFloading(false)
      }
    } catch (error) {
      console.log(error)
      setFloading(false)
    }
  }

  const handleUnFollow = async (userId, target) => {
    if (Floading) {
      return
    }
    setFloading(true)
    const response = await unfollowUser(userId, target)
    if (response) {
      dispatch(removeFollowing(target))
      socket.emit('un follow', { _id: userId, target: target })
      setFloading(false)
    } else {
      setFloading(false)
    }
  }

  return (
    <>
      <div className="mt-2 font-semibold hidden xs:flex lg:hidden md:block sm:block ">
        Suggestions for you
      </div>
      <div className="  my-3 hidden xs:flex lg:hidden md:block sm:block ">
        <div
          style={{ scrollbarWidth: 'none' }}
          className="
           w-full   flex overflow-x-auto w-full"
        >
          {sLoading ? (
            <div className="w-[100%] flex justify-center items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-500"></div>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((u, index) => (
              <div
                key={index}
                className="one-suggestion mt-2 shadow-lg border p-3 rounded-lg me-2  flex-col justify-center items-center"
              >
                <div className="">
                  <div
                    className="cursor-pointer flex  justify-center"
                    onClick={() => navigate(`/user/other/${u._id}`)}
                  >
                    <div className="relative w-16">
                      <div className=" rounded-full   flex items-center justify-center   overflow-hidden">
                        <React.Suspense
                          fallback={
                            <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
                          }
                        >
                          <ImageComponent src={u.profile.profileUrl} />
                        </React.Suspense>
                      </div>
                      {u.isSubscribed && (
                        <FontAwesomeIcon
                          className="text-base  text-[#512da8] absolute bg-[#ffffff] rounded-full bottom-0 right-1"
                          icon={faCircleCheck}
                        />
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div
                      className="font-semibold text-center  cursor-pointer"
                      onClick={() => navigate(`/user/other/${u._id}`)}
                    >
                      {u.userName}
                    </div>
                    <div className="text-center text-gray-600 text-xs">
                      {followersMap?.[u._id]
                        ? followingMap?.[u._id]
                          ? 'Followed by you'
                          : 'follows you'
                        : 'Suggestion for you'}
                    </div>
                  </div>
                </div>

                <div className="min-w-5 mt-2">
                  {isBloading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-500"></div>
                  ) : (
                    <>
                      {followingMap?.[u?._id] ? (
                        <button
                          className="unfollow-small-button  w-36"
                          onClick={() => {
                            handleUnFollow(user, u._id)
                          }}
                        >
                          Unfollow
                        </button>
                      ) : (
                        <button
                          className="follow-small-button w-36"
                          onClick={() => {
                            handleFollow(user, u._id)
                          }}
                        >
                          {followersMap?.[u?._id] ? 'Follow back' : 'Follow'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-400">No suggestions!</div>
          )}
        </div>
      </div>
    </>
  )
}
