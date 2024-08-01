import {
  faCircleExclamation,
  faUpload,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import { showErrorToast, showSuccessToast } from '../../../utils/toast'
import { postReport } from '../../../Service/Apiservice/UserApi'

export default function Report({ reportData, onClose }) {
  const [error, setError] = useState(false)
  const [reportError, setReportError] = useState('')
  const [loading, setLoading] = useState(false)

  const [reason, setReason] = useState('')

  const [report, setReport] = useState({
    culprit: reportData.culprit,
    type: reportData.type,
    contentId: reportData.contentId,
    reportedBy: reportData.userId,
    reason: '',
    images: [],
    bookAmount: null,
  })

  const [filePreviews, setFilePreviews] = useState([])

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 3 || filePreviews.length > 3) {
      setReportError('Three images is allowed')
      setError(true)
      setTimeout(() => {
        setReportError('')
        setError(false)
      }, 1500)
      return
    }
    setReport((prev) => ({ ...prev, images: [...files] }))
    setFilePreviews(files.map((file) => URL.createObjectURL(file)))
  }

  const handleReport = async () => {
    try {
      console.log(report)

      if (loading) {
        return
      }
      if (
        reportData.type == 'Lended' &&
        report?.images.length < 1 &&
        report.reason == 'Book damage'
      ) {
        setReportError('image wants to be uploaded')
        setError(true)
        setTimeout(() => {
          setError(false)
          setReportError('')
        }, 1500)
        setLoading(false)
        return
      }

      if (
        reason == 'Book damage' ||
        reason == 'book not returned' ||
        reason == 'wrong book served'
      ) {
        if (!report.bookAmount) {
          setError(true)
          setReportError('Provide the price of the book')
          return
        }
        if (Number(report.bookAmount) > 1000) {
          setError(true)
          setReportError('Price should be below 1000')
          return
        }
        if (Number(report.bookAmount) == 0 || Number(report.bookAmount) < 1) {
          setError(true)
          setReportError('Enter a valid price')
          return
        }
      }

      if (report.reason.trim() == '') {
        setError(true)
        setLoading(false)
        return
      }
      if (
        report.reason.length < 18 &&
        reportData.type !== 'Lended' &&
        reportData.type !== 'Borrowed'
      ) {
        setError(true)
        setReportError('reason is too short')
        setLoading(false)

        return
      }
      setLoading(true)
      const response = await postReport(report)
      if (response === true) {
        showSuccessToast(`Reported  ${report.type} sucessfully`)
        setLoading(false)
        onClose()
      } else {
        showErrorToast(response)
        setLoading(true)
        onClose()
      }
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className=" w-full py-5 px-6 fit-content">
      <div className="sm:col-span-3">
        <label
          htmlFor="last-name"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Email
        </label>
        <div className="mt-2">
          <input
            readOnly={true}
            type="text"
            value={reportData.email}
            name="last-name"
            id="last-name"
            autoComplete="family-name"
            className="block ps-2 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>
      <div className="sm:col-span-3">
        <label
          htmlFor="last-name"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          username
        </label>
        <div className="mt-2">
          <input
            readOnly={true}
            value={reportData.userName}
            type="text"
            name="last-name"
            id="last-name"
            autoComplete="family-name"
            className="block ps-2 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>
      {reportData.type == 'Lended' ? (
        <>
          <div className="mt-2">
            <label className="text-sm ">Reason:</label>
            <select
              style={{ border: '0.5px solid #7d7b7b', borderRadius: '8px' }}
              className="py-2.5 text-sm text-gray-400  focus:text-black w-full"
              value={reason}
              onChange={(e) => {
                setError(false)
                if (e.target.value == 'other' || e.target.value == 'abuse') {
                  setReport((prev) => ({ ...prev, bookAmount: '' }))
                }
                setReason(e.target.value)
                setReport((prev) => {
                  if (e.target.value == 'other') return { ...prev, reason: '' }
                  else return { ...prev, reason: e.target.value }
                })
                console.log(report)
              }}
            >
              <>
                <option value="">Select reason</option>
                <option value="Book damage">Book Damage</option>
                <option value="book not returned">book not returned</option>
                <option value="wrong book served">Wrong Book Served</option>
                <option value="abuse">Abuse</option>
                <option value="other">others</option>
              </>
            </select>
          </div>
          {reason == 'Book damage' ||
          reason == 'book not returned' ||
          reason == 'wrong book served' ? (
            <div className="sm:col-span-3">
              <label
                htmlFor="last-name"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Kindly provide the book price/amount in Rs
              </label>
              <div className="mt-2">
                <input
                  onChange={(e) =>
                    setReport((prev) => ({
                      ...prev,
                      bookAmount: e.target.value,
                    }))
                  }
                  value={report.bookAmount}
                  type="number"
                  name="last-name"
                  id="last-name"
                  autoComplete="family-name"
                  className="block ps-2 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          ) : (
            ''
          )}
          {reason === 'Book damage' && (
            <div className="mt-3 mb-1   w-full">
              <label htmlFor="" className="text-sm">
                kindly upload images of the damage
              </label>
              <label className="flex  items-center w-full px-4 py-6 bg-white text-blue-500 rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue-500 hover:text-white">
                {filePreviews.length > 0 ? (
                  filePreviews.map((f, i) => (
                    <div key={i} className="w-24 relative me-2">
                      <img src={f} alt="" className=" w-full" />
                      <FontAwesomeIcon
                        onClick={() => {
                          const updatePreview = filePreviews.filter(
                            (f, index) => i !== index
                          )
                          setFilePreviews(updatePreview)
                        }}
                        className=" absolute top-[-2px] right-0 text-red-400"
                        icon={faXmark}
                      />
                    </div>
                  ))
                ) : (
                  <div className="w-full text-center ">
                    <FontAwesomeIcon className="h-6" icon={faUpload} />
                  </div>
                )}

                <span className="mt-2 text-base leading-normal"></span>
                <input
                  disabled={filePreviews.length > 0}
                  onChange={handleFileChange}
                  type="file"
                  className="hidden"
                  multiple
                />
              </label>
            </div>
          )}
          {reason === 'other' && (
            <div className="col-span-full">
              <label
                htmlFor="about"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Provide your reason
              </label>
              <div className="mt-2">
                <textarea
                  onChange={(e) => {
                    setReportError('')
                    setError(false)
                    setReport((prev) => ({ ...prev, reason: e.target.value }))
                  }}
                  id="about"
                  name="about"
                  rows={3}
                  className="ps-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="col-span-full">
          <label
            htmlFor="about"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Provide your reason
          </label>
          <div className="mt-2">
            <textarea
              onChange={(e) => {
                setReportError('')
                setError(false)
                setReport((prev) => ({ ...prev, reason: e.target.value }))
              }}
              id="about"
              name="about"
              rows={3}
              className="ps-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
      )}

      <div
        className={` ${
          error ? '' : 'opacity-0 '
        } text-xs text-red-400 transition duration-400`}
      >
        {reportError ? reportError : 'field is required'}
      </div>
      <div className="my-1 text-gray-500">
        <FontAwesomeIcon className="text-red-300" icon={faCircleExclamation} />
        <span className="text-xs ms-2 ">
          Your report will be submitted anonymously, and the user will not be
          notified
        </span>
      </div>
      <div className="mt-3 flex justify-center">
        <button
          onClick={handleReport}
          className="font-semibold flex justify-center items-center text-[#ffffff] rounded-lg min-w-32 min-h-9  bg-[#512da8] uppercase text-sm py-1 "
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-white-900"></div>
          ) : (
            'report'
          )}
        </button>
      </div>
    </div>
  )
}
