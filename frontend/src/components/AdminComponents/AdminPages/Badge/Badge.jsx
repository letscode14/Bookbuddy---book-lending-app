import { faPen, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import React from 'react'
import ContentModal from '../../../Modal/ContentModal'
import BadgeForm from './AddBadge/BadgeForm'
import { getBadge } from '../../../../Service/Apiservice/AdminApi'
import EditdBadge from './EditBadge/EditdBadge'
import { useConfirmationModal } from '../../../Modal/ModalContext'

export default function Badge() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModelOpen, setIsModalOpen] = useState(false)
  const [modalFor, setModalFor] = useState('')
  const [badgeId, setBadgeId] = useState('')
  const { showModal } = useConfirmationModal()

  useEffect(() => {
    document.title = 'Badge management'
  }, [])

  useEffect(() => {
    const fetchBadge = async () => {
      const response = await getBadge()

      setData(response)
      setLoading(false)
    }
    fetchBadge()
  }, [isModelOpen])
  const handleClose = (data) => {
    if (data) {
      setData((prev) => [...prev, data])
    }
    setIsModalOpen(false)
  }

  return (
    <div className="bg-[#ffffff] grow relative rounded-2xl mt-4">
      <ContentModal
        isContentModalOpen={isModelOpen}
        onContentClose={handleClose}
      >
        {modalFor == 'addbadge' && <BadgeForm handleModelClose={handleClose} />}
        {modalFor == 'editbadge' && (
          <EditdBadge handleModelClose={handleClose} badgeId={badgeId} />
        )}
      </ContentModal>
      <div className="h-20 flex gap-9 items-center  justify-between">
        <div>
          <span className="font-semibold text-2xl ms-4 uppercase">
            Badge Management
          </span>
        </div>
        <div className="me-4">
          <button
            onClick={() => {
              setModalFor('addbadge')
              setIsModalOpen(true)
            }}
            className="py-2    rounded-lg w-40 bg-[#512da8] uppercase text-xs text-[#ffffff]"
          >
            Add badge
          </button>
        </div>
      </div>
      <div className="border-line"></div>
      <div className="px-10">
        <table className="mt-6 w-full">
          <thead className="table-head">
            <tr className="head grid-cols-10">
              <th>Badge ID</th>
              <th>Badge name</th>
              <th>Icon</th>
              <th>Min Score</th>
              <th>Borrow Limit</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th>Action</th>
            </tr>
          </thead>
          {data.length > 0 ? (
            data.map((b, index) => (
              <tbody key={index}>
                <tr className="grid-cols-10 border h-12 text-center">
                  <td className="max-w-32 font-semibold">{b.ID}</td>
                  <td className="font-semibold">{b.name}</td>
                  <td>
                    <div className="flex justify-center">
                      <div className="w-16 h-16 flex  justify-center items-center">
                        <React.Suspense
                          fallback={
                            <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
                          }
                        >
                          <img
                            src={b.iconUrl.secureUrl}
                            className="h-full"
                            alt=""
                          />
                        </React.Suspense>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-44 ">{b.minScore}</td>
                  <td>{b.limit}</td>
                  <td>{new Date(b.createdOn).toDateString()}</td>
                  <td>{new Date(b.updatedOn).toDateString()}</td>

                  <td>
                    <div
                      onClick={() => {
                        showModal('Are you sure', 'admin', () => {
                          setBadgeId(b._id)
                          setModalFor('editbadge')
                          setIsModalOpen(true)
                        })
                      }}
                      className="text-xl text-red-400 gap-4  flex justify-center items-center"
                    >
                      <FontAwesomeIcon
                        className="text-[#000000] cursor-pointer"
                        icon={faPen}
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            ))
          ) : (
            <tbody className="relative ">
              <tr className="absolute right-[50%] top-16">
                {loading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#512da8]"></div>
                ) : (
                  <td className="text-xl text-gray-400">No badges found!</td>
                )}
              </tr>
            </tbody>
          )}
        </table>
      </div>
    </div>
  )
}
