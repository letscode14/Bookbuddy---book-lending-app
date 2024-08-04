import { useEffect, useState } from 'react'

import { validateEmail } from '../../../../../helpers/ValidationHelpers/ValidationHelper'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectError } from '../../../../store/slice/errorSlice'
import {
  selectLoading,
  startLoading,
  stopLoading,
} from '../../../../store/slice/loadinSlice'
import { setOtpToken } from '../../../../store/slice/otpLoginAuth'
import { loginWithOtp } from '../../../../Service/Apiservice/UserApi'
export default function LoginOtpForm() {
  const [user, setEmail] = useState({})
  const [error, setError] = useState(0)
  const navigate = useNavigate()
  const { customError } = useSelector(selectError)
  const { isLoading } = useSelector(selectLoading)
  const dispatch = useDispatch()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (Object.entries(user).length == 0 || user.email == '') {
      setError(2)
      setTimeout(() => {
        setError(0)
      }, 1500)
      return
    }
    if (!validateEmail(user.email)) {
      setError(1)
      setTimeout(() => {
        setError(0)
      }, 1500)
      return
    }
    dispatch(startLoading())
    const response = await loginWithOtp(user)
    if (response) {
      dispatch(setOtpToken(response))
      dispatch(stopLoading())
      navigate('/submit-otp')
    }
  }
  useEffect(() => {
    document.title = 'Register email'
  })

  return (
    <form className="w-full px-[40px] xs:px-7">
      <h1 className="text-3xl font-bold mb-2">Register email</h1>

      <div className="w-full">
        <div className="flex justify-between">
          <div
            className={`pb-1 text-xs text-red-500 transition-opacity duration-500 ${
              error == 2 ? '' : 'opacity-0'
            }`}
          >
            Fill the field
          </div>
          <div className="pb-1 text-xs text-red-500 transition-opacity duration-500">
            {customError}
          </div>
        </div>

        <input
          onChange={(e) => setEmail({ email: e.target.value.trim() })}
          placeholder="Enter your registered email"
        ></input>

        <div
          className={` text-xs text-red-500 transition-opacity duration-500 ${
            error == 1 ? '' : 'opacity-0'
          }`}
        >
          Enter a valid email
        </div>
      </div>

      <button
        disabled={isLoading}
        onClick={handleSubmit}
        className="signup-button flex justify-center items-center"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-white-900"></div>
        ) : (
          'SUBMIT'
        )}
      </button>
    </form>
  )
}
