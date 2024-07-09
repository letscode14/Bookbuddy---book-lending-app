import React, { useState, useEffect } from 'react'
import {
  fetchF,
  followUser,
  unfollowUser,
} from '../../../../Service/Apiservice/UserApi'
import { useSelector } from 'react-redux'
import { selecUser } from '../../../../store/slice/userAuth'

export default function FollowerList({ user }) {
  const [followingIds, setFollowingId] = useState({})
  const [followersIds, setFollowersId] = useState({})
  const [followers, setFollowers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageNo, setPage] = useState(1)
  const [totalPage, setTotalpage] = useState()
  const [loadMore, setLoadMore] = useState()
  const u = useSelector(selecUser)

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const response = await fetchF({
          userId: user._id,
          query: 'followers',
          pageNo,
          currentUser: u.user,
        })
        console.log(response)
        if (response) {
          setTotalpage(response.totalCount)
          setFollowingId(response.followingMapCurrent)
          setFollowersId(response.followersMapCurrent)
          setFollowers((prev) => {
            const prevSet = new Set(prev.map((item) => item._id.toString()))
            const newItems = response.followers.filter(
              (item) => !prevSet.has(item._id.toString())
            )
            return [...prev, ...newItems]
          })

          setLoadMore(false)
        }
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    fetchFollowers()
  }, [pageNo])

  const handleFollow = async (userId, target) => {
    try {
      const response = await followUser(userId, target)
      if (response) {
        setFollowingId((prev) => ({ ...prev, [target]: true }))
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleUnFollow = async (userId, target) => {
    try {
      const response = await unfollowUser(userId, target)
      if (response) {
        setFollowingId((prev) => ({ ...prev, [target]: false }))
      }
    } catch (error) {
      console.log(error)
    }
  }

  const ImageComponent = React.lazy(
    () => import('../../../ImageComponent/Image')
  )

  return (
    <div className="min-w-[500px] min-h-[650px] max-h-[650px] p-4 overflow-y-auto">
      <div className="text-xl font-semibold">Followers</div>
      <div className="border mt-2"></div>
      {loading ? (
        <div className="flex justify-center items-center mt-3">
          <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
        </div>
      ) : followers.length ? (
        <>
          {followers.map((f, index) => (
            <div key={index} className="my-3 flex justify-between items-center">
              <div className="flex items-top ">
                <div className="w-11 h-11">
                  <div className="rounded-full flex items-center justify-center overflow-hidden">
                    <React.Suspense
                      fallback={
                        <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
                      }
                    >
                      <ImageComponent src={f?.userId?.profile?.profileUrl} />
                    </React.Suspense>
                  </div>
                </div>
                <div>
                  <div className="ms-2 ">{f?.userId?.userName}</div>
                  <div className="ms-2 text-xs">{f?.userId?.name}</div>
                </div>
              </div>
              <div>
                {f.userId._id == u.user ? (
                  ''
                ) : followingIds[f?.userId?._id] ? (
                  <button
                    onClick={() => handleUnFollow(u.user, f?.userId?._id)}
                    className="uppercase py-1 font-bold px-5 text-[#512da8] text-[11px] rounded-xl border-[#512da8] border"
                  >
                    Unfollow
                  </button>
                ) : (
                  <button
                    onClick={() => handleFollow(u.user, f.userId._id)}
                    className="uppercase py-1 font-bold px-5 text-[11px] rounded-xl text-[#ffffff] bg-[#512da8] border"
                  >
                    {followersIds[f.userId._id] ? 'follow back' : 'follow'}
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
          No followers
        </div>
      )}
    </div>
  )
}
