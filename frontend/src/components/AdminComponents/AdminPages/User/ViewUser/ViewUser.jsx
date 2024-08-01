import React, { act, useEffect, useState } from 'react'
import './ViewUser.css'
import {
  blockUser,
  getSingleUser,
} from '../../../../../Service/Apiservice/AdminApi'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleExclamation,
  faLock,
  faLockOpen,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import { useConfirmationModal } from '../../../../Modal/ModalContext'
import { showAdminToast } from '../../../../../utils/toast'
import ChildModal from '../../../../Modal/ChildModal'
import ViewReports from '../ViewReports/ViewReports'
const ImageComponent = React.lazy(
  () => import('../../../../ImageComponent/Image')
)

export default function ViewUser({ userId, blockAction }) {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState([])
  const [isBloading, setBloading] = useState(false)
  const { showModal } = useConfirmationModal()
  const [isChildOpen, setChildOpen] = useState(false)
  const [modalFor, setModalFor] = useState('')
  const [action, setAction] = useState('')
  const [metaData, setMetadata] = useState({
    id: '',
    action: '',
  })

  useEffect(() => {
    const fetchUser = async (userId) => {
      const repsonse = await getSingleUser(userId)
      if (repsonse) {
        setData(repsonse)
        setIsLoading(false)
      } else {
        setIsLoading(false)
      }
    }
    fetchUser(userId)
  }, [])

  const proceedBlockUser = async (id, action) => {
    try {
      const response = await blockUser({ userId: id, action: action })
      if (response) {
        showAdminToast(response)
        setData((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            isBlocked: action == 'Block' ? true : false,
          },
        }))
        blockAction(id, action)
        setAction('')
        setMetadata({})

        handleChildClose()
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleConfirm = () => {
    if (action == 'blockuser') {
      proceedBlockUser(metaData.id, metaData.action)
    }
  }

  const handleChildClose = () => {
    setAction('')
    setChildOpen(false)
    setMetadata({})
  }

  return (
    <div className="admin-view-user px-10">
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
                    setAction('')
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
        {modalFor == 'viewReports' && <ViewReports userId={data?.user._id} />}
      </ChildModal>
      {isLoading ? (
        <div className="h-full w-full flex justify-center items-center">
          <div className="animate-spin bg-[#ffffff]  rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between ">
            <div className="flex ">
              <div className="w-32 flex rounded-full overflow-hidden justify-center items-center ">
                <React.Suspense
                  fallback={
                    <div className="animate-spin rounded-full h-7 w-7  border-t-2 border-b-2 border-[#512da8]"></div>
                  }
                >
                  <ImageComponent
                    className="rounded-full"
                    src={data?.user.profile.profileUrl}
                  ></ImageComponent>
                </React.Suspense>
              </div>
              <div className="ms-8">
                <div className="font-semibold  text-xl">_dilu</div>
                <div className="text-lg mt-3">
                  <div>Arjun</div>
                  <div>setyourself free</div>
                  <div>
                    {data?.user?.privacy ? (
                      <>
                        <div className="text-lg flex items-center py-1 mt-1 font-medium  border px-2 bg-[#ede9f7] shadow-lg rounded-lg">
                          <FontAwesomeIcon className="text-sm" icon={faLock} />
                          <span className="text-sm ms-2 font-medium">
                            Private
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-lg flex items-center py-1 mt-1 font-medium  border px-2 bg-[#ede9f7] shadow-lg rounded-lg">
                        <FontAwesomeIcon
                          className="text-sm"
                          icon={faLockOpen}
                        />
                        <span className="text-sm ms-2 font-medium">Public</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div>
              {data?.user?.lendscoreDetails && (
                <>
                  <div className=" h-48  flex  w-full">
                    <div className=" flex items-center justify-center w-full">
                      <div className="h-24 me-6 rotating-image">
                        <React.Suspense
                          fallback={
                            <div className="animate-spin rounded-full h-7 w-7  border-t-2 border-b-2 border-[#512da8]"></div>
                          }
                        >
                          <ImageComponent
                            className="object-contain"
                            src={data?.user?.badgeDetails?.iconUrl?.secureUrl}
                          />
                        </React.Suspense>
                      </div>
                    </div>
                    <div className=" flex items-center justify-center w-full">
                      <div className="text-center grid gap-y-3">
                        <div className="text-xl font-medium">Lendscore</div>
                        <div className="text-2xl font-semibold">
                          {data?.user?.lendscoreDetails.lendScore}
                        </div>
                        <div className="text-lg font-medium">
                          {data?.user?.badgeDetails?.name}
                        </div>
                      </div>
                    </div>
                  </div>
                  {!data?.user?.isSubscribed && (
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        className="me-2 text-red-400"
                        icon={faCircleExclamation}
                      />
                      <p className="text-sm font-semibold">
                        This user is not verified
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            <div className="text-lg font-medium p-4 border text-center bg-[#ede9f7] shadow-lg rounded-lg">
              <div className="font-semibold">{data?.postLength || 0}</div>
              <div>Posts</div>
            </div>
            <div className="text-lg font-medium p-4 border text-center bg-[#ede9f7] shadow-lg rounded-lg">
              <div className="font-semibold">
                {data?.user?.numFollowing || 0}
              </div>
              <div>following</div>
            </div>{' '}
            <div className="text-lg font-medium p-4 border text-center bg-[#ede9f7] shadow-lg rounded-lg">
              <div className="font-semibold">
                {data?.user?.numFollowers || 0}
              </div>
              <div>followers</div>
            </div>{' '}
            <div className="text-lg font-medium p-4 border text-center bg-[#ede9f7] shadow-lg rounded-lg">
              <div className="font-semibold">{data?.user?.numReports || 0}</div>
              <div>reports</div>
            </div>{' '}
            <div className="text-lg font-medium p-4 border text-center bg-[#ede9f7] shadow-lg rounded-lg">
              <div className="font-semibold">{data?.books || 0}</div>
              <div>books</div>
            </div>
          </div>
          <div
            className="mt-5 gap-3 flex
           justify-center"
          >
            {data?.user?.isBlocked ? (
              <button
                onClick={() => {
                  if (!isBloading) {
                    setModalFor('confirm')
                    setAction('blockuser')
                    setChildOpen(true)
                    setMetadata({ id: data?.user?._id, action: 'Unblock' })
                  }
                }}
                className="min-w-36 text-[#ffffff] flex justify-center items-center text-sm uppercase text-lg flex items-center py-1.5 mt-1 font-medium  border px-2 bg-green-500 shadow-lg rounded-lg"
              >
                {isBloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#ffffff]"></div>
                  </>
                ) : (
                  'un block'
                )}
              </button>
            ) : (
              <button
                onClick={() => {
                  if (!isBloading) {
                    setModalFor('confirm')
                    setAction('blockuser')
                    setChildOpen(true)
                    setMetadata({ id: data?.user?._id, action: 'Block' })
                  }
                }}
                className="min-w-36 text-[#ffffff] flex justify-center items-center text-sm uppercase text-lg flex items-center py-1.5 mt-1 font-medium  border px-2 bg-red-500 shadow-lg rounded-lg"
              >
                {isBloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#ffffff]"></div>
                  </>
                ) : (
                  'Block'
                )}
              </button>
            )}
            <button
              onClick={() => {
                setModalFor('viewReports')
                setChildOpen(true)
              }}
              className="min-w-36 text-[#512da8] border-[#512da8] font-semibold flex justify-center items-center text-sm uppercase text-lg flex items-center py-1.5 mt-1 font-medium  border px-2  shadow-lg rounded-lg"
            >
              View reports
            </button>
          </div>
        </>
      )}
    </div>
  )
}
