import React, { useEffect, useState } from 'react'
import {
  getLended,
  makeRefundAmount,
} from '../../../../../Service/Apiservice/AdminApi'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronLeft,
  faChevronRight,
  faFlag,
  faHandHoldingDollar,
} from '@fortawesome/free-solid-svg-icons'
import ContentModal from '../../../../Modal/ContentModal'
import ViewLendedReports from './ViewLendedReports'
import { useConfirmationModal } from '../../../../Modal/ModalContext'
import { showAdminToast, showErrorToast } from '../../../../../utils/toast'
const ImageComponent = React.lazy(
  () => import('../../../../ImageComponent/PostImage')
)
export default function Lended() {
  const [loading, setLoading] = useState(true)
  const [hasMore, sethasMore] = useState(true)
  const [data, setData] = useState([])
  const [pageNo, setPageNo] = useState(1)
  const [filter, setFilter] = useState('all')
  const { showModal } = useConfirmationModal()

  useEffect(() => {
    try {
      setLoading(true)
      const fetchLended = async (pageNo, filter) => {
        const response = await getLended(pageNo, filter)
        if (response) {
          setData(response.lended)
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

  const [lendId, setLendId] = useState('')
  const [isModalOpen, setModelOpen] = useState(false)
  const handleContentModalClose = () => {
    setModelOpen(false)
  }

  const [isPloading, setPlaoding] = useState(false)

  const makeRefund = async (culpritId, beneficiaryId, lendId) => {
    setPlaoding(true)
    const response = await makeRefundAmount(culpritId, beneficiaryId, lendId)
    if (response.status == true) {
      setPlaoding(false)

      showAdminToast('Refund is initiated successfully')
    } else {
      showErrorToast(response)
      setPlaoding(false)
    }
  }
  return (
    <>
      <ContentModal
        isContentModalOpen={isModalOpen}
        onContentClose={handleContentModalClose}
      >
        <ViewLendedReports lendId={lendId} />
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
              <th>lended to</th>
              <th>lended from</th>
              <th>Book </th>
              <th>Book ID </th>
              <th>Score earned</th>
              <th>Is returned</th>
              <th>Remaining Days</th>
              <th>lended On</th>
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
                        {l.earnedScore}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div className="font-semibold text-center">
                        {l.isReturned ? (
                          <div className="text-green-500">Returned</div>
                        ) : (
                          <div className="text-red-500">Lended</div>
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
                      {new Date(l.lendedOn).toDateString()}
                    </div>
                  </td>
                  <td>
                    <div className="ms-2 text-center">
                      {new Date(l.keepingTime).toDateString()}
                    </div>
                  </td>
                  <td>
                    <div className="text-center ">
                      <button
                        onClick={() => {
                          setLendId(l._id)
                          setModelOpen(true)
                        }}
                        className="uppercase me-2 rounded-lg text-sm border py-2 font-bold text-[#ffffff] px-3 bg-[#51557e]"
                      >
                        <FontAwesomeIcon icon={faFlag} />
                      </button>
                      <button
                        className="uppercase  text-center rounded-lg text-sm border py-2 font-bold text-[#ffffff] px-3 bg-[#51557e]"
                        onClick={() => {
                          if (isPloading) {
                            return
                          }
                          showModal('Are you sure', 'admin', () =>
                            makeRefund(l?.lUser._id, l.userId, l._id)
                          )
                        }}
                      >
                        <FontAwesomeIcon icon={faHandHoldingDollar} />
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
