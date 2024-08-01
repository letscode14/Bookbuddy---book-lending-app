import { useState } from 'react'
import { validateEmail } from '../../../../../helpers/ValidationHelpers/ValidationHelper'
import { changePassEmailVerify } from '../../../../Service/Apiservice/UserApi'
import { saveChangePassOtp } from '../../../../store/slice/authSlice'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'

export default function ForgotPassform() {
  const [user, setEmail] = useState({})
  const navigate = useNavigate()
  const [error, setError] = useState(0)
  const [customError, setCustom] = useState(null)
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)

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
    setLoading(true)
    const response = await changePassEmailVerify(user.email)

    if (response.status == true) {
      dispatch(saveChangePassOtp(response.token))
      navigate('/submit-otp')
      setLoading(false)
    } else {
      setLoading(false)
      setCustom(response)
      setTimeout(() => {
        setCustom('')
      }, 2500)
    }
  }

  return (
    <form className="w-full">
      <h1 className="text-3xl font-bold mb-2">Verify email</h1>

      <div className="w-full">
        <div className="flex justify-between">
          <div
            className={`pb-1 text-xs text-red-500 transition-opacity duration-500 ${
              error == 2 ? '' : 'opacity-0'
            }`}
          >
            Fill the field
          </div>
          <div
            className={`pb-1 text-xs text-red-500 transition-opacity duration-500 `}
          >
            {customError}
          </div>
        </div>

        <input
          onChange={(e) => setEmail({ email: e.target.value.trim() })}
          placeholder="Email"
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
        onClick={(e) => {
          if (!loading) handleSubmit(e)
        }}
        className="flex justify-center uppercase items-center sign-in-button"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-white-900"></div>
        ) : (
          'verify'
        )}
      </button>
    </form>
  )
}
