import { useState } from 'react'
import { editBookshelf } from '../../../../../Service/Apiservice/UserApi'
import { showSuccessToast } from '../../../../../utils/toast'
import ContentModal from '../../../../Modal/ContentModal'
import Maps from '../../../Maps/Maps'

export default function EditShelf({ book, userId, handleClose }) {
  const [error, setError] = useState([])
  const [isLoading, setLoading] = useState(false)
  const [bookData, setBookData] = useState({
    bookName: book.bookName,
    author: book.author,
    description: book.description,
    location: {
      address: book.location?.address,
      lat: book.location?.lat,
      lng: book.location?.lng,
    },
    limit: book.limit.toString(),
    ID: book.ID,
    userId: userId,
    _id: book._id,
  })

  const resetError = () => {
    setTimeout(() => {
      setError([])
    }, 2000)
  }

  const handleSubmit = async () => {
    try {
      if (isLoading) {
        return
      }
      setLoading(true)
      const errorIndices = []
      const key = Object.keys(bookData)
      key.forEach((key, index) => {
        if (key !== 'location') {
          if (bookData[key].trim() === '') {
            errorIndices.push(index + 1)
          }
        }
      })

      if (errorIndices.length > 0) {
        setError(errorIndices)
        resetError()
        setLoading(false)

        return
      }
      const response = await editBookshelf(bookData)
      if (response) {
        setLoading(false)
        handleClose()
        showSuccessToast('Bookshelf edited successfully')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const [isContentOpen, setContentOpen] = useState(false)
  const handleContentClose = () => {
    setContentOpen(false)
  }

  const getLocation = (address, lat, lng) => {
    if (address == 'No address found') {
      setBookData((prev) => ({
        ...prev,
        location: bookData.location,
      }))
      return
    }
    setBookData((prev) => ({
      ...prev,
      location: { address: address, lat: lat, lng: lng },
    }))
  }
  return (
    <div className="w-[600px] h-[420px] pt-6 px-6 xs:w-full">
      <ContentModal
        isContentModalOpen={isContentOpen}
        onContentClose={handleContentClose}
      >
        <div className="w-[1400px] h-[800px] xs:w-[340px]  xs:h-[550px]">
          <Maps type={'select'} getLocation={getLocation} />
        </div>
      </ContentModal>
      <div className="sm:col-span-3 mb-1 w-full">
        <label
          htmlFor="first-name"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          BookID
        </label>
        <div>
          <input
            readOnly
            value={book.ID}
            type="text"
            name="first-name"
            id="first-name"
            autoComplete="given-name"
            className="block w-full ps-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>
      <div className="flex mt-1 gap-2">
        <div className="sm:col-span-3 w-full">
          <label
            htmlFor="first-name"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Bookname
          </label>
          <div>
            <input
              value={bookData.bookName}
              onChange={(e) =>
                setBookData((prev) => ({ ...prev, bookName: e.target.value }))
              }
              type="text"
              name="first-name"
              id="first-name"
              autoComplete="given-name"
              className="ps-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
          <div
            className={`  text-xs text-red-500 transition-opacity duration-500 ${
              error.includes(1) ? ' ' : 'opacity-0'
            }`}
          >
            field is required
          </div>
        </div>

        <div className="sm:col-span-3 w-full">
          <label
            htmlFor="first-name"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Author
          </label>
          <div>
            <input
              onChange={(e) =>
                setBookData((prev) => ({ ...prev, author: e.target.value }))
              }
              value={bookData.author}
              type="text"
              name="first-name"
              id="first-name"
              autoComplete="given-name"
              className="ps-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
          <div
            className={`  text-xs text-red-500 transition-opacity duration-500 ${
              error.includes(2) ? ' ' : 'opacity-0'
            }`}
          >
            field is required
          </div>
        </div>
      </div>
      <div className="col-span-full">
        <label
          htmlFor="about"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Description
        </label>
        <div>
          <textarea
            value={bookData.description}
            onChange={(e) =>
              setBookData((prev) => ({ ...prev, description: e.target.value }))
            }
            id="about"
            name="about"
            rows={3}
            className="ps-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder=" Write a few sentences about Book."
          />
        </div>
        <div
          className={`  text-xs text-red-500 transition-opacity duration-500 ${
            error.includes(3) ? ' ' : 'opacity-0'
          }`}
        >
          field is required
        </div>
      </div>
      <div className="flex gap-2">
        <div className="sm:col-span-3 w-full">
          <label
            htmlFor="first-name"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Location
          </label>
          <div>
            <input
              readOnly={true}
              value={bookData.location?.address}
              onClick={() => setContentOpen(true)}
              type="text"
              name="first-name"
              id="first-name"
              autoComplete="given-name"
              className="ps-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
          <div
            className={`  text-xs text-red-500 transition-opacity duration-500 ${
              error.includes(4) ? ' ' : 'opacity-0'
            }`}
          >
            field is required
          </div>
        </div>
        <div className="bookshelf-adds  ">
          <label
            htmlFor="first-name"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Time limit
          </label>

          <select
            value={bookData.limit}
            onChange={(e) =>
              setBookData((prev) => ({
                ...prev,
                limit: e.target.value.toString(),
              }))
            }
            className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
          >
            <option value="">Select the period limit to lend </option>
            <option value="1" className="text-black">
              1 day
            </option>
            <option value="7" className="text-black">
              7 days
            </option>
            <option value="15" className="text-black">
              15 days
            </option>
            <option value="30" className="text-black">
              30 days
            </option>
          </select>
          <div
            className={`pb-1  text-xs text-red-500 transition-opacity duration-500 ${
              error.includes(5) ? '' : 'opacity-0'
            }`}
          >
            field is required
          </div>
        </div>
      </div>
      <div className="w-full mt-2  flex justify-center ">
        <button
          onClick={handleSubmit}
          className="bg-[#512da8] flex justify-center min-w-40 text-[#ffffff] uppercase pty-2 font-semibold py-2 px-3 rounded-lg text-xs "
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-white-900"></div>
          ) : (
            'save changes'
          )}
        </button>
      </div>
    </div>
  )
}
