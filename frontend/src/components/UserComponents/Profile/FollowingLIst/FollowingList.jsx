import React, { useState, useEffect } from 'react'
import {
  fetchF,
  followUser,
  unfollowUser,
} from '../../../../Service/Apiservice/UserApi'
import { useSelector } from 'react-redux'
import { selecUser } from '../../../../store/slice/userAuth'
const ImageComponent = React.lazy(() => import('../../../ImageComponent/Image'))

export default function FollowingList({ user }) {
  const [followingIds, setFollowingId] = useState({})
  const [followersIds, setFollowersId] = useState({})
  const [following, setFollowing] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPage, setTotalpage] = useState()
  const [loadMore, setLoadMore] = useState()
  const u = useSelector(selecUser)

  const [pageNo, setPage] = useState(1)

  useEffect(() => {
    const fetchFollowingData = async () => {
      try {
        const response = await fetchF({
          userId: user._id,
          query: 'following',
          pageNo,
          currentUser: u.user,
        })
        if (response) {
          setTotalpage(response.totalCount)
          setFollowingId(response.followingMapCurrent)
          setFollowersId(response.followersMapCurrent)
          console.log(response)
          setFollowing((prev) => {
            const prevSet = new Set(prev.map((item) => item._id.toString()))
            const newItems = response.following.filter(
              (item) => !prevSet.has(item._id.toString())
            )
            return [...prev, ...newItems]
          })
          setLoadMore(false)
        }
      } catch (error) {
        console.log('Error fetching followings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFollowingData()
  }, [pageNo])

  const handleFollow = async (userId, target) => {
    try {
      const response = await followUser(userId, target)
      if (response) {
        setFollowingId((prev) => ({ ...prev, [target]: true }))
      }
    } catch (error) {
      console.log('Error following user:', error)
    }
  }

  const handleUnFollow = async (userId, target) => {
    try {
      const response = await unfollowUser(userId, target)
      if (response) {
        setFollowingId((prev) => ({ ...prev, [target]: false }))
      }
    } catch (error) {
      console.log('Error unfollowing user:', error)
    }
  }

  return (
    <div className="min-w-[500px] min-h-[650px] max-h-[650px] p-4 overflow-y-auto">
      <div className="text-xl font-semibold">Following</div>
      <div className="border mt-2"></div>

      {loading ? (
        <div className="flex justify-center items-center mt-3">
          <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
        </div>
      ) : following.length ? (
        <>
          {following.map((f, index) => (
            <div key={index} className="my-3 flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-11 h-11">
                  <div className="rounded-full flex items-center justify-center overflow-hidden">
                    <React.Suspense
                      fallback={
                        <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
                      }
                    >
                      <ImageComponent src={f.userId.profile.profileUrl} />
                    </React.Suspense>
                  </div>
                </div>
                <div className="ms-2">
                  <div>{f?.userId?.userName}</div>
                  <div className="text-xs">{f?.userId?.name}</div>
                </div>
              </div>
              <div>
                {u.user == f.userId._id ? (
                  ''
                ) : followingIds[f?.userId?._id] ? (
                  <button
                    onClick={() => handleUnFollow(u.user, f?.userId?._id)}
                    className="uppercase py-1 px-5 font-bold text-[#512da8] text-[11px] rounded-xl border-[#512da8] border"
                  >
                    Unfollow
                  </button>
                ) : followersIds[f?.userId?._id] ? (
                  <button
                    onClick={() => handleFollow(u.user, f.userId._id)}
                    className="uppercase py-1 px-5 font-bold text-[11px] rounded-xl text-[#ffffff] bg-[#512da8] border"
                  >
                    Follow Back
                  </button>
                ) : (
                  <button
                    onClick={() => handleFollow(user._id, f.userId._id)}
                    className="uppercase py-1 px-5 font-bold text-[11px] rounded-xl text-[#ffffff] bg-[#512da8] border"
                  >
                    Follow
                  </button>
                )}
              </div>
            </div>
          ))}
          <div
            onClick={() => {
              setLoadMore(true)
              setPage(pageNo + 1)
            }}
            className="w-full cursor-pointer  flex justify-center text-sm text-gray-500"
          >
            {pageNo < totalPage ? (
              loadMore ? (
                <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-[#512da8]"></div>
              ) : (
                <div> Load more </div>
              )
            ) : (
              ''
            )}
          </div>
        </>
      ) : (
        <div className="text-center mt-2 text-gray-500 text-sm">
          No followings
        </div>
      )}
    </div>
  )
}
