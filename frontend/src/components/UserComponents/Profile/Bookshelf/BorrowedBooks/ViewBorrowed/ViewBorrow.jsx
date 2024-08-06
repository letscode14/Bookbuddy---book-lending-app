import {
  faCheck,
  faCircleExclamation,
  faLocation,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { selecUser } from '../../../../../../store/slice/userAuth'
import { giveBookBack } from '../../../../../../Service/Apiservice/UserApi'
import { SocketContext } from '../../../../../../Socket/SocketContext'
import ContentModal from '../../../../../Modal/ContentModal'
import Report from '../../../../Report/Report'
const ImageComponent = React.lazy(
  () => import('../../../../../ImageComponent/PostImage')
)

export default function ViewBorrow({ borrow }) {
  const [data, setData] = useState(null)
  const socket = useContext(SocketContext)
  const { user, userDetails } = useSelector(selecUser)
  const [loading, setLoading] = useState(false)
  const [modalFor, setModalFor] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reportDetails, setReporDetails] = useState({})
  useEffect(() => {
    setData(borrow)
  }, [])

  const handleContentModalClose = () => {
    setIsModalOpen(false)
  }

  const handleGiveBack = async (userId, requestId, sendTo, borrowId) => {
    try {
      setLoading(true)
      const response = await giveBookBack(userId, requestId, sendTo, borrowId)
      if (response) {
        const newData = {
          ...data,
          requestDetails: response.content,
        }

        setData(newData)
        socket.emit('new message', response)
      }
    } catch (error) {
      setLoading(false)
    }
  }
  return (
    <div className="w-[400px]  px-6 py-5">
      <ContentModal
        onContentClose={handleContentModalClose}
        isContentModalOpen={isModalOpen}
      >
        {modalFor == 'report' && (
          <Report
            reportData={reportDetails}
            onClose={handleContentModalClose}
          />
        )}
      </ContentModal>
      {data ? (
        <div className="h-full">
          <div className="h-[40%]  flex">
            <div className="h-full w-[35%] overflow-hidden flex items-center">
              <div className=" p-1  overflow-hidden h-[80%]">
                <React.Suspense
                  fallback={
                    <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
                  }
                >
                  <ImageComponent
                    className="rounded-lg"
                    src={data.requestDetails?.book.imageUrl.secure_url}
                  />
                </React.Suspense>
              </div>
            </div>
            <div className="pt-4 ms-2 px-3">
              <div className="text-xl font-semibold">
                {data.requestDetails?.book.bookName}
              </div>
              <div className="mt-2">
                {data.requestDetails?.book.author}
                <div className="text-md font-medium"></div>
                <div className="text-sm font-medium semibold">
                  ID :
                  <span className="font-semibold text-[#000000]">
                    {data.requestDetails?.book.ID}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-sm mt-2 font-semibold text-gray-400">
            <div>
              <span>From :</span>{' '}
              <span className="text-[#512da8]">{data.lUser?.userName}</span>{' '}
              <span className="ms-2 text-[#000000]">
                {new Date(data.borrowedOn).toDateString()}
              </span>
            </div>
            <div>
              <span>
                Location :{' '}
                <FontAwesomeIcon
                  icon={faLocation}
                  className="text-red-500 text-sm"
                />
                <span className="ms-1 text-black">
                  {' '}
                  {data.requestDetails.book.location?.address}
                </span>
              </span>
            </div>
            <div>
              {(data.remainingDays == 0 &&
                data.requestDetails.stage == 'approved') ||
              data.requestDetails.stage == 'times up' ? (
                <div className="text-[#000000] font-medium py-[3px] text-sm inline-block px-3 rounded-lg mt-2  bg-[#ede9f7]">
                  <FontAwesomeIcon
                    icon={faCircleExclamation}
                    className="me-2 text-red-500"
                  />
                  {data.remainingDays} Days left times up ! give back book
                </div>
              ) : data.requestDetails.stage == 'transaction complete' ? (
                <div className="text-[#000000] font-medium py-[3px] text-sm inline-block px-3 rounded-lg mt-2  bg-[#ede9f7]">
                  <FontAwesomeIcon
                    icon={faCheck}
                    className="me-2 text-green-500"
                  />
                  Book returned successfully
                </div>
              ) : (
                <span className="text-black">
                  {data.remainingDays} Days remaining
                </span>
              )}
            </div>
          </div>
          <div
            style={{ scrollbarWidth: 'none' }}
            className="fit-content max-h-32 mt-3 overflow-auto"
          >
            <p className="text-wrap">{data.requestDetails.book.description}</p>
          </div>
          <div>
            {data.requestDetails.stage == 'collect' ? (
              <div className="text-[#000000] font-medium py-[3px] text-sm inline-block px-3 rounded-lg mt-2  bg-[#ede9f7]">
                <FontAwesomeIcon
                  icon={faCircleExclamation}
                  className="me-2 text-red-500"
                />
                the user will collect the book immediately
              </div>
            ) : (
              ''
            )}
          </div>
          <div className=" mt-2  w-full  flex gap-3 justify-center font-medium text-[#000000]">
            <button
              onClick={() => {
                setReporDetails({
                  culprit: data?.lUser._id,
                  contentId: data._id,
                  userId: user,
                  email: userDetails.email,
                  userName: userDetails.userName,
                  type: 'Borrowed',
                })
                setModalFor('report')
                setIsModalOpen(true)
              }}
              className="border  bg-[#512da8] font-semibold text-[#ffffff] w-28 text-xs py-2 rounded-lg uppercase"
            >
              Report
            </button>
            {(data.remainingDays == 0 &&
              data.requestDetails.stage == 'requested') ||
            data.requestDetails.stage == 'times up' ? (
              <button
                onClick={() => {
                  if (!loading)
                    handleGiveBack(
                      user,
                      data.requestDetails._id,
                      data.lUser._id,
                      data._id
                    )
                }}
                className="flex justify-center items-center border border-[#512da8] text-[#512da8] text-xs font-semibold   w-28 text-sm py-1 rounded-lg uppercase"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
                ) : (
                  'give back'
                )}
              </button>
            ) : (
              ''
            )}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
        </div>
      )}
    </div>
  )
}
