import {
  faLocationDot,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useContext, useState } from 'react'
import ChildModal from '../../../../Modal/ChildModal'
import EditShelf from '../EditShelf/EditShelf'
import RemoveBook from '../RemoveBook/RemoveBook'
import {
  giveBookRequest,
  sendMessage,
} from '../../../../../Service/Apiservice/UserApi'
import { showErrorToast, showSuccessToast } from '../../../../../utils/toast'
import { useConfirmationModal } from '../../../../Modal/ModalContext'
import { SocketContext } from '../../../../../Socket/SocketContext'
import { selecUser } from '../../../../../store/slice/userAuth'
import { useSelector } from 'react-redux'
import ContentModal from '../../../../Modal/ContentModal'
import Subscribe from '../../../Subscribe/Subscribe'
const ImageComponent = React.lazy(
  () => import('../../../../ImageComponent/Image')
)

export default function ViewBook({
  book,
  isOwned,
  userId,
  handleContentClose,
}) {
  const { showModal } = useConfirmationModal()
  const socket = useContext(SocketContext)
  const [isChildOpen, setChildOpen] = useState(false)
  const [modalFor, setModalFor] = useState('')
  const [action, setAction] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useSelector(selecUser)

  book.addedOn = new Date(book.addedOn).toDateString()

  const handleChildClose = () => {
    setChildOpen(false)
    setModalFor('')
    setAction('')
  }

  const confirmEdit = () => {
    setModalFor('Confirm')
    setChildOpen(true)
    setAction('Edit')
  }

  const confirmRemove = () => {
    setModalFor('Confirm')
    setChildOpen(true)
    setAction('Remove')
  }

  const handleConfirm = () => {
    if (action == 'Edit') return setModalFor('Edit')
    if (action == 'Remove') return setModalFor('Remove')
  }

  const handleClose = () => {
    setModalFor('')
    setAction('')
  }

  const handleGetTheBook = async (userId, bookId, ownerId) => {
    try {
      setLoading(true)
      const response = await giveBookRequest(userId, bookId, ownerId)
      if (response?.status !== true) {
        setLoading(false)
        if (response.status == 403) {
          setChildOpen(true)
          setModalFor('subscribe')
        } else {
          showErrorToast(response.data.result.message)
        }
      } else {
        showSuccessToast('Request has send success fully')
        handleContentClose()
        setLoading(false)
        const obj = {
          senderId: user,
          chatId: response.response.data.result?.requestedUser.chatId,
          content: response.response.data.result?.requestedUser.requestId,
          isRequestForBook: true,
        }
        const messageResponse = await sendMessage(obj)

        if (messageResponse) {
          if (!messageResponse.isNewChat)
            socket.emit('new message', messageResponse.message)
          else {
            const newreciever =
              messageResponse.message.chatId.participants.find((p) => p != user)
            socket.emit('newchatwithuser', newreciever)
          }
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <ChildModal isOpen={isChildOpen} onClose={handleChildClose}>
        {modalFor == 'subscribe' && <Subscribe user={user} />}
        {modalFor == 'Confirm' && (
          <div className="w-[500px] py-6 px-10 xs:w-full :px-2">
            <div className="xs:text-center">
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
        {modalFor == 'Edit' && (
          <EditShelf book={book} userId={userId} handleClose={handleClose} />
        )}
        {modalFor == 'Remove' && (
          <RemoveBook
            bookId={book.ID}
            _id={book._id}
            userId={userId}
            handleClose={handleClose}
          />
        )}
      </ChildModal>
      <div className="w-[400px] p-4 fit-content">
        <div className=" h-[37%]">
          <div className="flex h-full">
            <div className="h-full p-1 w-[40%]">
              <React.Suspense
                fallback={
                  <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
                }
              >
                <ImageComponent src={book.imageUrl.secure_url} />
              </React.Suspense>
            </div>
            <div className="ms-2 w-[60%] ">
              <div className="text-xl font-semibold">{book.bookName}</div>
              <div className="text-md ">{book.author}</div>
              <div className="text-md ">
                <span className="font-bold">ID:</span>
                {book.ID}
              </div>
              <div className="text-md ">{book.addedOn}</div>
            </div>
          </div>
        </div>
        <div className="h-[23%] mb-2 text-gray-400 text-sm font-semibold mt-3">
          <div className="flex">
            <div className=" flex justify-between w-[85px]">
              <span>Status</span>
              <span>:</span>
            </div>
            <span className="text-[#512da8] ms-2 font-semibold">
              {book.status}
            </span>
          </div>
          <div className="flex">
            <div className="flex justify-between w-[85px]">
              <span>Location</span>
              <span>:</span>
            </div>
            <span className="ms-2 flex items-top font-semibold">
              <FontAwesomeIcon
                className="text-red-500 mx-1 "
                icon={faLocationDot}
              />
              <div className="text-wrap w-[250px]">
                {book.location?.address}
              </div>
            </span>
          </div>
          <div className="flex">
            <div className=" flex justify-between w-[85px]">
              <span>Limit</span>
              <span>:</span>
            </div>
            <span className="  ms-2 font-semibold">{book.limit} Day</span>
          </div>
        </div>
        <div
          style={{ scrollbarWidth: 'none' }}
          className="mb-5 h-16 max-h-16 overflow-auto  font-medium text-[#000000]"
        >
          <p className="text-wrap w-50">{book.description}</p>
        </div>
        <div className="  w-full  flex gap-3 justify-center font-medium text-[#000000]">
          {isOwned ? (
            <>
              {' '}
              <button
                onClick={() => {
                  confirmEdit()
                }}
                className="border  bg-[#512da8] font-semibold text-[#ffffff] w-28 text-xs py-2 rounded-lg uppercase"
              >
                Edit
              </button>
              <button
                onClick={confirmRemove}
                className="border border-[#512da8] text-[#512da8] text-xs font-semibold   w-28 text-sm py-1 rounded-lg uppercase"
              >
                remove
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                handleGetTheBook(user, book._id, userId)
              }}
              className="border  bg-[#512da8] w-40 flex justify-center items-center font-semibold text-[#ffffff] w-28 text-xs py-2 rounded-lg uppercase"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-white-900"></div>
              ) : (
                'request book'
              )}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
