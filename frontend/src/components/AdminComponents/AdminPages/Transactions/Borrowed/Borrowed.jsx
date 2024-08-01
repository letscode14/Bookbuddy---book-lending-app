import React, { useEffect, useState } from 'react'
import {
  getBorrowed,
  getLended,
} from '../../../../../Service/Apiservice/AdminApi'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import ContentModal from '../../../../Modal/ContentModal'
import ViewBorrowReports from './ViewBorrowReports'
const ImageComponent = React.lazy(
  () => import('../../../../ImageComponent/PostImage')
)
export default function Borrowed() {
  const [loading, setLoading] = useState(true)
  const [hasMore, sethasMore] = useState(true)
  const [data, setData] = useState([])
  const [pageNo, setPageNo] = useState(1)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    try {
      setLoading(true)
      const fetchLended = async (pageNo, filter) => {
        const response = await getBorrowed(pageNo, filter)
        if (response) {
          setData(response.borrowed)
          sethasMore(response.hasMore)
          setLoading(false)
        }
      }
      fetchLended(pageNo, filter)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }, [pageNo, filter])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [borrowId, setBorrowId] = useState('')

  const handleContentModalClose = () => {
    setIsModalOpen(false)
  }
  return (
    <>
      <ContentModal
        isContentModalOpen={isModalOpen}
        onContentClose={handleContentModalClose}
      >
        <ViewBorrowReports borrowId={borrowId} />
      </ContentModal>
      <div className="absolute text-xl right-10 bottom-10 flex justify-center items-center gap-2">
        <FontAwesomeIcon
          icon={faChevronLeft}
          onClick={() => {
            if (pageNo > 1) {
              setPageNo(pageNo - 1)
            }
          }}
        />
        <div className="border bg-[#51557E] text-[#ffffff] text-sm px-3 py-1 rounded-lg">
          {pageNo}
        </div>
        <FontAwesomeIcon
          icon={faChevronRight}
          onClick={() => {
            if (hasMore) {
              setPageNo(pageNo + 1)
            }
          }}
        />
      </div>
      <div className="px-10">
        <table className="mt-6 w-full">
          <thead className="table-head">
            <tr className="head grid-cols-10">
              <th>Brrowed from</th>
              <th>Borrowed by</th>
              <th>Book </th>
              <th>Book ID </th>
              <th>Is returned</th>
              <th>Remaining Days</th>
              <th>borrowed On</th>
              <th>Returning date</th>
              <th>Action</th>
            </tr>
          </thead>
          {data.length > 0 ? (
            data.map((l, i) => (
              <tbody className="text-sm" key={i}>
                <tr>
                  <td>
                    <div className="flex items-center justify-center">
                      <div className="w-16 rounded-full overflow-hidden">
                        <React.Suspense
                          fallback={
                            <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
                          }
                        >
                          <ImageComponent
                            className="rounded-full"
                            src={l?.lUser?.profile.profileUrl}
                          ></ImageComponent>
                        </React.Suspense>
                      </div>
                      <div className="ms-2">{l?.lUser?.userName}</div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center justify-center">
                      <div className="w-16 rounded-full overflow-hidden">
                        <React.Suspense
                          fallback={
                            <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
                          }
                        >
                          <ImageComponent
                            className="rounded-full"
                            src={l.profile.profileUrl}
                          ></ImageComponent>
                        </React.Suspense>
                      </div>
                      <div className="ms-2">{l.userName}</div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center justify-center">
                      <div className="w-16">
                        <React.Suspense
                          fallback={
                            <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
                          }
                        >
                          <ImageComponent
                            className="rounded-full"
                            src={l.requestDetails.book.imageUrl.secure_url}
                          ></ImageComponent>
                        </React.Suspense>
                      </div>
                      <div className="ms-2">
                        <p className="text-truncate w-24">
                          {l.requestDetails.book.bookName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="font-semibold text-center">
                      {l.requestDetails.book.ID}
                    </div>
                  </td>

                  <td>
                    <div>
                      <div className="font-semibold text-center">
                        {l.isReturned ? (
                          <div className="text-green-500">Returned</div>
                        ) : (
                          <div className="text-red-500">Borrowed</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="ms-2 text-center">
                      {l.remainingDays} Days{' '}
                    </div>
                  </td>
                  <td>
                    <div className="ms-2 text-center">
                      {new Date(l.borrowedOn).toDateString()}
                    </div>
                  </td>
                  <td>
                    <div className="ms-2 text-center">
                      {new Date(l.keepingTime).toDateString()}
                    </div>
                  </td>
                  <td>
                    <div className="text-center">
                      <button
                        onClick={() => {
                          setBorrowId(l._id)
                          setIsModalOpen(true)
                        }}
                        className="uppercase rounded-lg text-xs border py-2 font-bold text-[#ffffff] px-3 bg-[#51557e]"
                      >
                        View Reports
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            ))
          ) : (
            <tbody className="relative ">
              <tr className="absolute right-[50%] top-16">
                {loading ? (
                  <td>
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#512da8]"></div>
                  </td>
                ) : (
                  <td className="text-xl text-gray-400">
                    No Lended transactions
                  </td>
                )}
              </tr>
            </tbody>
          )}
        </table>
      </div>
    </>
  )
}
