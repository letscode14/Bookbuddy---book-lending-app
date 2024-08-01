import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import ChildModal from '../../../../Modal/ChildModal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { showAdminToast } from '../../../../../utils/toast'
import {
  getReports,
  removeReports,
} from '../../../../../Service/Apiservice/AdminApi'

export default function ViewReports({ postId, type }) {
  const [data, setReports] = useState([])
  const [isChildOpen, setChildOpen] = useState(false)
  const [pageNo, setPageNo] = useState(1)
  const [rid, setRid] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    const response = await removeReports(rid)
    if (response) {
      showAdminToast('Report removed success fully')
      setReports(data.filter((r) => rid != r._id))
      setLoading(false)
      handleChildClose()
    }
  }

  const removeReport = (rId) => {
    setChildOpen(true)
    setRid(rId)
  }

  const handleChildClose = () => {
    setChildOpen(false)
    setRid('')
  }

  useEffect(() => {
    const fetchReports = async (targetId) => {
      setLoading(true)
      const response = await getReports(targetId, pageNo)
      if (response) {
        setReports((prev) => [...prev, ...response.reports])
        setHasMore(response.hasMore)
        setLoading(false)
      }
    }
    fetchReports(postId)
  }, [pageNo])
  const handleScroll = () => {
    const container = event.currentTarget
    if (
      container.scrollHeight - container.scrollTop ===
      container.clientHeight
    ) {
      if (!loading && hasMore) {
        setPageNo((prev) => prev + 1)
      }
    }
  }
  return (
    <div className="h-[550px] overflow-y-auto max-h-[550px] p-4 w-full min-w-[430px]">
      <ChildModal isOpen={isChildOpen} onClose={handleChildClose}>
        <div className="w-[500px] py-6 px-10">
          <div>
            <span>
              <FontAwesomeIcon
                className="text-2xl text-red-400 me-5"
                icon={faTriangleExclamation}
              />
            </span>
            Are you sure?
          </div>
          <div className="text-end  mt-5">
            <div>
              <button
                onClick={() => {
                  handleChildClose()
                }}
                className="me-3 py-1 bg-[#512da8] text-[#ffffff] font-semibold uppercase px-5 text-xs border rounded-lg"
              >
                cancel
              </button>

              <button
                onClick={handleConfirm}
                className="py-1 bg-red-400 text-[#ffffff] font-semibold uppercase px-5 text-xs border rounded-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </ChildModal>
      <div className="font-semibold text-lg">
        <span>
          {data?.length} {data.length > 1 ? 'Reports ' : ' Report'}{' '}
        </span>
      </div>
      <div className="border my-2"></div>
      <div className="h-[470px] overflow-y-auto" onScroll={handleScroll}>
        {data.length > 0
          ? data.map((r, i) => (
              <div key={i} className="border-b p-2 ">
                <div className="flex justify-between items-center">
                  <div className="text-sm  font-medium text-gray-500">
                    <div className="flex ">
                      <div className="w-28 ">Reported by</div>
                      <span className="text-black text-[16px]">
                        : {r?.reportedBy.userName}
                      </span>
                    </div>
                    <div className="flex mt-1">
                      <div className="w-28 ">Status </div>
                      <span className="text-black text-[16px]">
                        : {r?.status}
                      </span>
                    </div>
                    <div className="flex mt-1">
                      <div className="w-28 ">Reported On</div>
                      <span className="text-black text-[16px]">
                        : {new Date(r?.reportedOn).toDateString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => removeReport(r._id)}
                      className="border flex justify-center py-1 px-4 text-xs uppercase w-28  rounded-lg text-[#ffffff] bg-[#512da8]"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-white-900"></div>
                      ) : (
                        'remove'
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex mt-1">
                  <div className="text-sm  font-medium text-gray-500 w-28">
                    Reason
                  </div>
                  <div
                    style={{ scrollbarWidth: 'none' }}
                    className="text-[15px] w-[270px] h-[50px] max-h-[50px] flex   overflow-y-auto  "
                  >
                    <span>:</span>
                    <article className="text-wrap ...">
                      <p> {r?.reason}</p>
                    </article>
                  </div>
                </div>
              </div>
            ))
          : !loading && <span>No reports</span>}
        {loading && (
          <div className="w-full  mt-3    flex justify-center">
            <div className="animate-spin  rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
          </div>
        )}
      </div>
    </div>
  )
}
