import React, { useRef, useState } from 'react'
import { showAdminToast, showErrorToast } from '../../../../../utils/toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { addBadge } from '../../../../../Service/Apiservice/AdminApi'

export default function BadgeForm({ handleModelClose }) {
  const badgeInput = useRef()
  const [error, setError] = useState([])
  const [icon, setIcon] = useState()
  const [loading, setLoading] = useState(false)
  const [custom, setCustom] = useState({
    minError: '',
    borrowError: '',
    badgeError: '',
  })

  const [data, setData] = useState({
    badgeName: '',
    icon: '',
    minScore: '',
    borrowLimit: '',
  })

  const resetError = () => {
    setTimeout(() => {
      setError([])
    }, 1800)
  }

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // Check file type for common image types
      const validImageTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/svg+xml',
      ]
      if (!validImageTypes.includes(selectedFile.type)) {
        showErrorToast('Select a valid image')
        return
      } else {
        setData((prev) => ({ ...prev, icon: selectedFile }))
        const reader = new FileReader()
        reader.onloadend = () => {
          setIcon(reader.result)
          e.target.value = null
        }
        reader.readAsDataURL(selectedFile)
        console.log(data)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errorIndices = []
    const keys = Object.keys(data)

    keys.forEach((key, index) => {
      if (key !== 'icon') {
        if (data[key].trim() === '') {
          errorIndices.push(index + 1)
        }
      }
    })

    if (errorIndices.length > 0) {
      setError(errorIndices)
      resetError()
      return
    }
    if (!icon) {
      setError([2])
      resetError()
      return
    }

    const alPhabetsRegex = /^[A-Za-z]+$/
    if (!alPhabetsRegex.test(data.badgeName)) {
      setCustom((prev) => ({
        ...prev,
        badgeError: 'Enter valid name',
      }))
      return
    }

    setCustom((prev) => ({
      ...prev,
      badgeError: '',
    }))
    if (!/^\d*$/.test(data.minScore) || Number(data.minScore) < 1) {
      setCustom((prev) => ({
        ...prev,
        minError: 'Only accepts positive numbers',
      }))
      return
    }
    setCustom((prev) => ({
      ...prev,
      minError: '',
    }))
    if (!/^\d*$/.test(data.borrowLimit) || data.borrowLimit < 1) {
      setCustom((prev) => ({
        ...prev,
        borrowError: 'Only accepts positive numbers',
      }))
      return
    }
    setCustom((prev) => ({
      ...prev,
      borrowError: '',
    }))
    setLoading(true)
    const response = await addBadge(data)
    if (response == true) {
      setLoading(false)
      showAdminToast('Badge created')
      handleModelClose(response)
    } else if (response.status == 400) {
      setCustom((prev) => ({
        ...prev,
        badgeError: 'Badge already present',
      }))
      setLoading(false)
    }
  }

  return (
    <div className="p-5  w-[400px]">
      <div className="sm:col-span-3 mt-2">
        <label
          htmlFor="badge-name"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Badge name
        </label>
        <div className="">
          <input
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                badgeName: e.target.value.toUpperCase(),
              }))
            }
            id="badge-name"
            name="first-name"
            type="text"
            autoComplete="given-name"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
          <div className="flex justify-between">
            <div
              className={`pb-1  text-xs text-red-500 transition-opacity duration-500 ${
                error.includes(1) ? ' ' : 'opacity-0'
              }`}
            >
              field is required
            </div>
            <div className="text-red-500 text-xs">{custom.badgeError}</div>
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-start  ">
        <div className="col-span-full">
          <label
            htmlFor="photo"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Choose icon
          </label>
          <div className=" gap-x-3">
            <input
              onChange={handleFileInput}
              type="file"
              className="hidden"
              ref={badgeInput}
            />
            <button
              onClick={() => badgeInput.current.click()}
              type="button"
              className="rounded-md  bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Change
            </button>
            <div
              className={`pb-1  text-xs text-red-500 transition-opacity duration-500 ${
                error.includes(2) ? ' ' : 'opacity-0'
              }`}
            >
              choose image
            </div>
          </div>
        </div>
        <div className=" ms-5">
          <div className="col-span-full">
            <label
              htmlFor="photo"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              preview
            </label>
            <div className=" w-24 relative border rounded  h-28 ">
              <React.Suspense
                fallback={
                  <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
                }
              >
                <img className="object-fit w-full h-full" src={icon} alt="" />
              </React.Suspense>

              <FontAwesomeIcon
                onClick={() => {
                  setData((prev) => ({ ...prev, icon: '' }))
                  setIcon('')
                }}
                className="absolute top-0 right-0 z-20 text-red-500 text-lg"
                icon={faXmark}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="sm:col-span-3 mt-2">
        <label
          htmlFor="badge-name"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Min score
        </label>
        <div className="">
          <input
            onChange={(e) =>
              setData((prev) => ({ ...prev, minScore: e.target.value }))
            }
            id="badge-name"
            name="first-name"
            type="Number"
            autoComplete="given-name"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
          <div className="flex justify-between items-center">
            <div
              className={`  text-xs text-red-500 transition-opacity duration-500 ${
                error.includes(3) ? ' ' : 'opacity-0'
              }`}
            >
              field is required
            </div>
            <div className="text-xs text-red-500 ">{custom.minError}</div>
          </div>
        </div>
      </div>
      <div className="sm:col-span-3 ">
        <label
          htmlFor="badge-name"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Borrow limit
        </label>
        <div className="">
          <input
            onChange={(e) =>
              setData((prev) => ({ ...prev, borrowLimit: e.target.value }))
            }
            id="badge-name"
            name="first-name"
            type="Number"
            autoComplete="given-name"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
          <div className="flex justify-between items-center">
            <div
              className={` text-xs text-red-500 transition-opacity duration-500 ${
                error.includes(4) ? ' ' : 'opacity-0'
              }`}
            >
              field is required
            </div>
            <div className="text-xs text-red-500 ">{custom.borrowError}</div>
          </div>
        </div>
      </div>
      <div className="flex mt-1 justify-center">
        <button
          onClick={loading ? null : handleSubmit}
          className="py-2  mt-2 flex justify-center rounded-lg w-32 bg-[#512da8] uppercase text-xs text-[#ffffff]"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-white-900"></div>
          ) : (
            'add'
          )}
        </button>
      </div>
    </div>
  )
}
