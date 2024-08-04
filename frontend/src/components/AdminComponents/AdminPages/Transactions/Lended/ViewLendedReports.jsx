import {
  faChevronLeft,
  faChevronRight,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import React, { useCallback, useEffect, useState } from 'react'
import {
  getReports,
  removeReports,
} from '../../../../../Service/Apiservice/AdminApi'
import ChildModal from '../../../../Modal/ChildModal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { showAdminToast } from '../../../../../utils/toast'
const ImageComponent = React.lazy(
  () => import('../../../../ImageComponent/Image')
)
import useEmblaCarousel from 'embla-carousel-react'

export default function ViewLendedReports({ lendId }) {
  const [pageNo, setPageNo] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setReports] = useState([])
  const [isChildOpen, setChildOpen] = useState(false)
  const [rid, setRid] = useState('')
  const [bLoading, setBloading] = useState(false)
  const [modalFor, setModalFor] = useState('')
  const [damageImages, setDamageImages] = useState([])

  useEffect(() => {
    const fetchReports = async (lendId) => {
      setLoading(true)
      const response = await getReports(lendId, pageNo)
      if (response) {
        setReports((prev) => [...prev, ...response.reports])
        setHasMore(response.hasMore)
        setLoading(false)
      }
    }
    fetchReports(lendId)
  }, [pageNo])

  const handleChildClose = () => {
    setChildOpen(false)
    setRid('')
  }
  const removeReport = (rId) => {
    setChildOpen(true)
    setRid(rId)
  }
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
  const handleConfirm = async () => {
    setBloading(true)
    const response = await removeReports(rid)
    if (response) {
      showAdminToast('Report removed success fully')
      setReports(data.filter((r) => rid != r._id))
      setBloading(false)
      handleChildClose()
    }
  }

  const [emblaRef, emblaApi] = useEmblaCarousel()
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  })

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  })
  return (
    <>
      <div className="h-[550px] overflow-y-auto max-h-[550px] p-4 w-[430px]">
        <ChildModal isOpen={isChildOpen} onClose={handleChildClose}>
          {modalFor == 'confirm' && (
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
          )}
          {modalFor == 'viewdamage' && (
            <div className="max-w-[600px] ">
              <div className="embla h-full " ref={emblaRef}>
                <div className="embla__container   h-full">
                  {damageImages?.map((image, index) => (
                    <div key={index} className="embla__slide h-full">
                      <React.Suspense
                        fallback={
                          <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
                        }
                      >
                        <ImageComponent src={image?.secure_url} />
                      </React.Suspense>
                    </div>
                  ))}
                </div>
              </div>
              {damageImages.length > 1 && (
                <div className="absolute opacity-25 hover:opacity-100   top-[45%] px-1 w-full flex justify-between ">
                  <FontAwesomeIcon
                    onClick={scrollPrev}
                    className="p-2 bg-gray-200  rounded-xl"
                    icon={faChevronLeft}
                  />
                  <FontAwesomeIcon
                    onClick={scrollNext}
                    className="p-2 bg-gray-200   rounded-xl"
                    icon={faChevronRight}
                  />
                </div>
              )}
            </div>
          )}
        </ChildModal>
        <div className="font-semibold text-lg">
          <span>
            {data?.length} {data.length > 1 ? 'Reports ' : ' Report'}{' '}
          </span>
        </div>
        <div className="border my-2"></div>
        <div
          className="h-[470px] overflow-y-auto"
          style={{ scrollbarWidth: 'thin' }}
          onScroll={handleScroll}
        >
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
                        onClick={() => {
                          setModalFor('confirm')
                          removeReport(r._id)
                        }}
                        className="border flex justify-center py-1 px-4 text-xs uppercase w-28  rounded-lg text-[#ffffff] bg-[#512da8]"
                      >
                        {bLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-white-900"></div>
                        ) : (
                          'remove'
                        )}
                      </button>
                      {r?.damageImages.length > 0 && (
                        <button
                          onClick={() => {
                            setChildOpen(true)
                            setModalFor('viewdamage')
                            setDamageImages(r.damageImages)
                          }}
                          className="border w-28 mt-1 flex justify-center py-1 px-1 text-xs uppercase   rounded-lg text-[#512da8] bg-[#ffffff] border-[#512da8]"
                        >
                          view damage
                        </button>
                      )}
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
    </>
  )
}
