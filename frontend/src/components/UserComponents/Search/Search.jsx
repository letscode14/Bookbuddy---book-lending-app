import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import './Search.css'
import { useDispatch, useSelector } from 'react-redux'
import {
  addFollowing,
  removeFollowing,
  selectMap,
  selecUser,
} from '../../../store/slice/userAuth'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import Suggestions, { ResponsiveSuggestion } from '../Suggestions/Suggestions'
import {
  followUser,
  searchUser,
  unfollowUser,
} from '../../../Service/Apiservice/UserApi'
import { SocketContext } from '../../../Socket/SocketContext'
import ReponsiveNav from '../Navbar/ReponsiveNav'

const ImageComponent = React.lazy(
  () => import('../../ImageComponent/PostImage')
)

export default function Search() {
  const { followingMap, followersMap } = useSelector(selectMap)
  const { userDetails } = useSelector(selecUser)
  const socket = useContext(SocketContext)
  const searchContainer = useRef()
  const { user } = useSelector(selecUser)
  const [hasMore, setHasMore] = useState(false)
  const [pageNo, setPageNo] = useState(1)
  const [users, setResults] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [Floading, setFloading] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [strue, setStrue] = useState(false)

  function debounce(func, wait) {
    let timeout
    return function (...args) {
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), wait)
    }
  }

  const fetchResults = async (searchQuery, page) => {
    if (!searchQuery) {
      setLoading(false)
      setResults([])
      return
    }

    try {
      const response = await searchUser(page, searchQuery, user)
      setStrue(true)
      if (response) {
        if (response.users.length == 0) {
          setResults([])
        }
        if (page === 1) {
          setResults(response.users)
        } else {
          setResults((prev) => [...prev, ...response.users])
        }
        setHasMore(response.hasMore)
        setLoading(false)
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  const debouncedFetchResults = useCallback(debounce(fetchResults, 500), [])

  const handleChange = (e) => {
    const value = e.target.value
    setQuery(value)
    setPageNo(1)
    setLoading(true)
    debouncedFetchResults(value, 1)
  }

  useEffect(() => {
    document.title = 'Search'
  }, [])

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

  const handleLoadMore = () => {
    setPageNo((prev) => {
      const nextPage = prev + 1
      debouncedFetchResults(query, nextPage)
      return nextPage
    })
  }

  return (
    <>
      <ReponsiveNav />
      <div
        ref={searchContainer}
        className="rounded-[40px] right-[12px] ps-20 pe-20  overflow-auto    home-content absolute top-3 bottom-3 flex   bg-[#ffffff] 
      xs:left-1 xs:right-1 xs:rounded-[10px] xs:top-1 xs:bottom-1 xs:ps-1 xs:pe-1 
      sm:left-20 sm:pe-5 sm:ps-5 
      md:left-[230px]
      lg:pe-20 lg:ps-20 lg:pt-2 lg:left-[280px]"
      >
        <div className="w-[70%] xs:w-full sm:w-full lg:w-[70%]">
          <div className="w-full p-5 xs:p-4">
            <input
              onChange={handleChange}
              type="text"
              placeholder="search"
              className="border w-[70%] ps-2 py-1 rounded-lg 
              xs:w-full 
              sm:w-full"
            />
          </div>
          <div className="border mx-2"></div>
          <ResponsiveSuggestion />

          <div className="border mx-2 mt-2 lg:hidden "></div>

          <div className="mx-2 h-full mt-3 max-h-[790px] px-5 xs:px-1">
            {loading ? (
              <div className="flex justify-center mt-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#512da8]"></div>
              </div>
            ) : users.length > 0 ? (
              users.map((u, i) => (
                <div
                  key={i}
                  className="one-suggestion mt-4 flex justify-between items-center"
                >
                  <div className="flex items-center">
                    <div
                      className="relative cursor-pointer"
                      onClick={() => navigate(`/user/other/${u._id}`)}
                    >
                      <div className="me-2 rounded-full w-10 flex items-center justify-center overflow-hidden">
                        <React.Suspense
                          fallback={
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#512da8]"></div>
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
                        className="font-semibold cursor-pointer"
                        onClick={() => navigate(`/user/other/${u._id}`)}
                      >
                        {u.userName}
                      </div>
                      <div className="text-gray-600 text-xs">
                        <div>
                          {followingMap?.[u?._id] ? 'Follows you' : u.name}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
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
                  </div>
                </div>
              ))
            ) : (
              strue &&
              query && (
                <div className="text-gray-400 text-center mt-3">
                  No results found
                </div>
              )
            )}
            {hasMore && query && (
              <div
                className="cursor-pointer text-sm mt-4 flex justify-center"
                onClick={handleLoadMore}
              >
                Load More
              </div>
            )}
          </div>
        </div>
        <Suggestions />
      </div>
    </>
  )
}
