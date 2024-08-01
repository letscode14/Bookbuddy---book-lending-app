import React, { useEffect, useState } from 'react'
import './Bookshelf.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot, faSadTear } from '@fortawesome/free-solid-svg-icons'
import {
  getBookshelf,
  viewOneBook,
} from '../../../../Service/Apiservice/UserApi'
import ContentModal from '../../../Modal/ContentModal'
import ViewBook from './ViewBookshelf/ViewBook'
import { useSelector } from 'react-redux'
import { selecUser } from '../../../../store/slice/userAuth'
const ImageComponent = React.lazy(() => import('../../../ImageComponent/Image'))

export default function Bookshelf({ userId }) {
  const { user } = useSelector(selecUser)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModelOpen, setModel] = useState(false)
  const [shelfOwned, setShelOwned] = useState('')
  const [bookData, setBookData] = useState({})

  useEffect(() => {
    const fetechBookshelf = async () => {
      const response = await getBookshelf(userId)
      if (response) {
        setData(response.shelf)
        setShelOwned(response.userId)
      }
      setLoading(false)
    }
    fetechBookshelf()
  }, [isModelOpen])

  const handleContentClose = () => {
    setModel(false)
  }

  const viewBookshelf = async (bookId, userId) => {
    const response = await viewOneBook(bookId, userId)
    console.log(response)
    if (response) {
      setBookData(response)
      setModel(true)
    }
  }

  return (
    <>
      <ContentModal
        isContentModalOpen={isModelOpen}
        onContentClose={handleContentClose}
      >
        <ViewBook
          book={bookData}
          isOwned={user == shelfOwned}
          userId={userId}
          handleContentClose={handleContentClose}
        />
      </ContentModal>
      {loading ? (
        <div className="mt-6 flex justify-center items-baseline  w-full">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-500"></div>
          <span className="ms-3 text-gray-500">loading... </span>
        </div>
      ) : (
        <div
          className=" mt-4 pb-10 grid grid-cols-4 gap-4  mx-20  
         xs:mx-0 xs:grid-cols-2 xs:gap-1 
         sm:mx-3 sm:grid-cols-3 
         lg:grid-cols-4 lg:mx-20"
        >
          {data.length > 0 ? (
            data.map((book, index) => (
              <div
                key={index}
                onClick={() => viewBookshelf(book._id, userId)}
                className="max-h-[200px] shadow border rounded-lg aspect-square"
              >
                <div className="w-full p-1 h-[60%] ">
                  <React.Suspense
                    fallback={
                      <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
                    }
                  >
                    <ImageComponent src={book.imageUrl.secure_url} />
                  </React.Suspense>
                </div>
                <div className="px-2 py-1">
                  <div className="text-base font-semibold xs:text-xs sm:text-sm">
                    {book.bookName}{' '}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    <div>
                      <span className="font-bold ">ID:</span> {book.ID}
                    </div>
                    <div className="font-bold text-[#512da8]">
                      {book.status}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              className="w-full absolute text-center 
           text-lg text-gray-400"
            >
              No books yet <FontAwesomeIcon icon={faSadTear} />
            </div>
          )}
        </div>
      )}
    </>
  )
}
