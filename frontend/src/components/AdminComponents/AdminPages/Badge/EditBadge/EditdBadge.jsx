import React, { useEffect } from 'react'
import { useState, useRef } from 'react'
import { showAdminToast, showErrorToast } from '../../../../../utils/toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import {
  editBadge,
  getSingleBadge,
} from '../../../../../Service/Apiservice/AdminApi'

export default function EditdBadge({ badgeId, handleModelClose }) {
  const badgeInput = useRef()
  const [error, setError] = useState([])
  const [loading, setLoading] = useState(false)
  const [oldBadge, setOldBadge] = useState(false)
  const [data, setData] = useState({
    badgeName: '',
    icon: '',
    minScore: '',
    borrowLimit: '',
  })

  useEffect(() => {
    const fetchBadge = async (badgeId) => {
      const response = await getSingleBadge(badgeId)
      if (response) {
        setData({
          badgeName: response.name,
          icon: response.iconUrl.secureUrl,
          minScore: response.minScore.toString(),
          borrowLimit: response.limit.toString(),
        })
        setOldBadge(response.name)
      } else {
        showErrorToast('error in fectching the data')
      }
    }
    fetchBadge(badgeId)
  }, [])

  const [custom, setCustom] = useState({
    minError: '',
    borrowError: '',
    badgeError: '',
  })

  const resetError = () => {
    setTimeout(() => {
      setError([])
    }, 1800)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errorIndices = []
    const keys = Object.keys(data)

    keys.forEach((key, index) => {
      if (key !== 'icon') {
        if (data[key].trim() == '') {
          errorIndices.push(index + 1)
        }
      }
    })

    if (errorIndices.length > 0) {
      setError(errorIndices)
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
    const isChanged = oldBadge !== data.badgeName
    const response = await editBadge(data, badgeId, isChanged)
    if (response.status == true) {
      setLoading(false)
      showAdminToast('Badge edited successfully')
      handleModelClose()
    } else {
      setCustom((prev) => ({
        ...prev,
        badgeError: response,
      }))
      setLoading(false)
    }
  }

  return (
    <div className="p-5  w-[400px]">
      <div className=" w-24 relative border rounded  h-28 ">
        <React.Suspense
          fallback={
            <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
          }
        >
          <img className="object-fit w-full h-full" src={data?.icon} alt="" />
        </React.Suspense>
      </div>
      <div className="sm:col-span-3 mt-2">
        <label
          htmlFor="badge-name"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Badge name
        </label>
        <div className="">
          <input
            value={data?.badgeName}
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
            value={data?.minScore}
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
            value={data?.borrowLimit}
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
            'edit'
          )}
        </button>
      </div>
    </div>
  )
}
