import React, { useCallback, useEffect, useState } from 'react'
import { getReportedPost } from '../../../../../../Service/Apiservice/AdminApi'
import ChildModal from '../../../../../Modal/ChildModal'
import ViewReports from '../../../Post/ViewReports/ViewReports'
const ImageComponent = React.lazy(
  () => import('../../../../../ImageComponent/Image')
)
export default function PostReport({ userId }) {
  const [pageNo, setPageNo] = useState(1)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [isChildOpen, setChildOpen] = useState(false)
  const [target, setTarget] = useState('')

  useEffect(() => {
    const fetchReportedPost = async (userId, pageNo) => {
      try {
        setLoading(true)
        const response = await getReportedPost(userId, pageNo)

        if (response) {
          setData((prev) => {
            const prevSet = new Set(prev.map((item) => item._id.toString()))
            const newItems = response.post.filter(
              (item) => !prevSet.has(item._id.toString())
            )
            return [...prev, ...newItems]
          })
          setLoading(false)
          setHasMore(response.hasMore)
        }
      } catch (error) {
        console.log(error)
        setLoading(false)
      } finally {
        setLoading(false)
      }
    }

    fetchReportedPost(userId, pageNo)
  }, [pageNo])

  const handleOnScroll = useCallback((event) => {
    const container = event.currentTarget
    if (
      container.scrollHeight - container.scrollTop ===
      container.clientHeight
    ) {
      if (!loading && hasMore) {
        setPageNo((prev) => prev + 1)
      }
    }
  }, [])

  const handleClose = () => {
    setChildOpen(false)
  }
  return (
    <div
      style={{ scrollbarWidth: 'thin' }}
      onScroll={handleOnScroll}
      className=" pt-2 mt-3  w-full h-[700px] 
      overflow-auto
      "
    >
      <ChildModal isOpen={isChildOpen} onClose={handleClose}>
        <ViewReports type={'Post'} postId={target} />
      </ChildModal>
      {data.length > 0
        ? data.map((p, i) => (
            <div key={i} className="px-4">
              <div className="flex justify-between">
                <div className="flex">
                  <div className="w-20 h-20 h-10 flex  justify-center items-center">
                    <React.Suspense
                      fallback={
                        <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
                      }
                    >
                      <ImageComponent
                        className="rounded-full"
                        src={p?.imageUrls[0].secure_url}
                      ></ImageComponent>
                    </React.Suspense>
                  </div>
                  <div className="text-md ms-4 font-semibold">
                    <div className="">
                      <span className="text-gray-500">ID :</span> {p?.ID}
                    </div>
                    <div className="div">
                      {' '}
                      <span className="text-gray-500">Reports count :</span>
                      {p?.reportCount}{' '}
                    </div>
                  </div>
                </div>
                <div>
                  <button
                    className="border text-sm rounded-lg text-[#ffffff] bg-[#512da8] px-3 py-1"
                    onClick={() => {
                      setTarget(p._id)
                      setChildOpen(true)
                    }}
                  >
                    View reasons
                  </button>
                </div>
              </div>

              <div className="mt-1 ">
                <span className="text-gray-500 font-semibold mt-2">
                  Description :
                </span>
                <p className="text-wrap"> {p?.description}</p>
              </div>
              <div className="border my-2"></div>
            </div>
          ))
        : !loading && (
            <div className="flex justify-center items-center">
              No reported posts
            </div>
          )}
      {loading && (
        <div className="w-full  mt-3    flex justify-center">
          <div className="animate-spin  rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
        </div>
      )}
    </div>
  )
}
