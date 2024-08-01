import React, { useEffect, useRef, useState } from 'react'
import { getLendedBooks } from '../../../../Service/Apiservice/UserApi'
import ContentModal from '../../../Modal/ContentModal'
import ViewLended from './ViewLended/ViewLended'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faCircleExclamation,
  faSadTear,
} from '@fortawesome/free-solid-svg-icons'

const ImageComponent = React.lazy(
  () => import('../../../ImageComponent/PostImage')
)

export default function LendedBooks({ userId }) {
  const [loading, setLoading] = useState(true)
  const lendedContainer = useRef()
  const [data, setData] = useState([])
  const [pageNo, setPageNo] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [lend, setLendId] = useState(null)
  const [modalFor, setModelFor] = useState('')
  const [isModalOpen, setModelOpen] = useState(false)

  useEffect(() => {
    const fetchLended = async (userId, pageNo) => {
      try {
        const response = await getLendedBooks(userId, pageNo)
        console.log(response)
        if (response) {
          setData((prev) => [...prev, ...response.lended])
          setHasMore(response.hasMore)
        }
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    fetchLended(userId, pageNo)
  }, [pageNo])

  const handleScroll = () => {
    const container = lendedContainer.current
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container
      if (scrollTop + clientHeight >= scrollHeight) {
        if (hasMore) {
          setPageNo(pageNo + 1)
        }
      }
    }
  }

  const handleClose = () => {
    setModelOpen(false)
    setModelFor('')
    setLendId(null)
  }
  return (
    <>
      {loading ? (
        <div className="mt-6 flex justify-center items-baseline  w-full">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-500"></div>
          <span className="ms-3 text-gray-500">loading... </span>
        </div>
      ) : (
        <div
          style={{ scrollbarWidth: 'none' }}
          ref={lendedContainer}
          onScroll={handleScroll}
          className=" overflow-auto max-h-[450px] mt-4 pb-10 grid grid-cols-4 gap-4  mx-20 
          xs:mx-0 xs:grid-cols-2 xs:gap-1 
          sm:mx-3 sm:grid-cols-3 
         md:mx-12 md:grid-cols-4
         lg:mx-12"
        >
          <ContentModal
            isContentModalOpen={isModalOpen}
            onContentClose={handleClose}
          >
            {modalFor == 'view' && lend && <ViewLended lend={lend} />}
          </ContentModal>
          {data.length > 0 ? (
            data.map((book, index) => (
              <div
                key={index}
                onClick={() => {
                  setModelFor('view')
                  setModelOpen(true)
                  setLendId(book)
                }}
                className="h-[230px] shadow border rounded-lg"
              >
                <div className="w-full p-1 h-[50%] ">
                  <React.Suspense
                    fallback={
                      <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
                    }
                  >
                    <ImageComponent
                      src={book?.requestDetails?.book?.imageUrl?.secure_url}
                    />
                  </React.Suspense>
                </div>
                <div className="px-2 py-1 h-[50%]">
                  <div className="text-md font-semibold  truncate ">
                    {' '}
                    {book?.requestDetails?.book?.bookName}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    <div>
                      <span className="font-bold">ID:</span>{' '}
                      {book?.requestDetails?.book?.ID}
                    </div>

                    {(book.remainingDays == 0 &&
                      book.requestDetails.stage == 'approved') ||
                    book.requestDetails.stage == 'times up' ? (
                      <div className="text-[#000000] py-[3px] mt-1  inline-block px-3 rounded-lg  text-nowrap xs:py-1 xs:text-truncate bg-[#ede9f7] xs:px-2">
                        <FontAwesomeIcon
                          icon={faCircleExclamation}
                          className="me-2 text-red-500"
                        />
                        Times up! get the book
                      </div>
                    ) : book.requestDetails.stage == 'transaction complete' ? (
                      <div className="text-[#000000] flex py-[3px] mt-1  inline-block px-3 rounded-lg  text-nowrap xs:py-1 xs:text-truncate bg-[#ede9f7] xs:px-2">
                        <FontAwesomeIcon
                          icon={faCheck}
                          className="me-2 text-green-500"
                        />
                        <p className="max-w-40 text-wrap">
                          Returned book successfully
                        </p>
                      </div>
                    ) : (
                      <div>{book.remainingDays} Days remaining</div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="absolute text-center w-full text-gray-400 text-lg">
              No lended books yet!
              <FontAwesomeIcon icon={faSadTear} className="ms-2" />
            </div>
          )}
        </div>
      )}
    </>
  )
}
