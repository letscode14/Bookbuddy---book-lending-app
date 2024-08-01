import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selecUser } from '../../../../store/slice/userAuth'
import {
  decrementOtpCounter,
  resetOtpCounter,
  saveChangePassOtpTokenAfterLogin,
  saveChangePassOtpTokenAfterLoginOut,
  saveChangePassTokenAfterLogin,
  selectState,
} from '../../../../store/slice/authSlice'
import {
  getOtPforChangePass,
  resendOtPforChangePass,
  submitOldPassword,
  submitOtpForChangePass,
} from '../../../../Service/Apiservice/UserApi'
import ChangePassForm from './ChangePassForm'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleExclamation,
  faEye,
  faEyeSlash,
  faLock,
} from '@fortawesome/free-solid-svg-icons'
import { validatePassword } from '../../../../../helpers/ValidationHelpers/ValidationHelper'
import { showErrorToast } from '../../../../utils/toast'

export default function ChangePass({ onClose }) {
  const [loading, setLoading] = useState(false)
  const [isResendLoading, setRLoading] = useState(false)
  const { user, userDetails } = useSelector(selecUser)
  const [changeWithOtp, setChangeWithOtp] = useState(false)

  const [intervalId, setIntervalId] = useState()

  //otp
  const [otp, setOtp] = useState('')

  const otpCounter = useSelector((state) => state.otpAuth.otpCounter)

  const { isChangePassOtpAfterLogin } = useSelector(selectState)
  const { isChangePassAfterLogin } = useSelector(selectState)

  const [otpError, setOtpError] = useState(null)
  const dispatch = useDispatch()

  //old pass state
  const [password, setPassword] = useState({ password: '' })
  const [error, setError] = useState(0)
  const [passView, setPassView] = useState(false)
  const [passwordError, setPassError] = useState('')

  const changePasswithOtp = async () => {
    try {
      setLoading(true)
      const response = await getOtPforChangePass(userDetails.email, user)
      if (response.status == false) {
        showErrorToast(response.message)
        setLoading(false)
      } else {
        dispatch(saveChangePassOtpTokenAfterLogin(response))
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (otpCounter > 0 && isChangePassOtpAfterLogin) {
      const interval = setInterval(() => {
        dispatch(decrementOtpCounter())
      }, 1000)

      setIntervalId(interval)

      return () => clearInterval(interval)
    }
  }, [dispatch, otpCounter, isChangePassOtpAfterLogin])

  useEffect(() => {
    clearInterval()
    dispatch(resetOtpCounter())
  }, [isChangePassOtpAfterLogin])

  const handleResend = async () => {
    try {
      setRLoading(true)
      const response = await resendOtPforChangePass(user)

      if (response) {
        dispatch(resetOtpCounter())
        setOtpError(null)
        dispatch(saveChangePassOtpTokenAfterLogin(response))
        setRLoading(false)
      } else {
        setRLoading(false)
        dispatch(saveChangePassOtpTokenAfterLoginOut())
        setOtpError('Error in resend otp try again')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleOtpSubmit = async () => {
    setLoading(true)
    if (otp.trim() == '') {
      setOtpError('Please provide an otp')
      return
    }
    if (otp.trim < 0) {
      setOtpError('Please provide an valid otp')
      return
    }

    if (typeof otp.trim() == Number) {
      setOtpError('otp should be number')
      return
    }

    const response = await submitOtpForChangePass(otp)
    if (response.status) {
      setLoading(false)

      setOtpError('')
      dispatch(saveChangePassOtpTokenAfterLoginOut())
      dispatch(saveChangePassTokenAfterLogin(response.token))
    } else {
      setOtpError(response.message)
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (Object.entries(password).length == 0 || password.password == '') {
      setError(3)
      setTimeout(() => {
        setError(0)
      }, 1500)

      return
    }
    const pass = validatePassword(password.password)

    if (pass !== true) {
      setError(1)
      setPassError(pass)
      setTimeout(() => {
        setError(0)
      }, 1500)
      return
    }
    setRLoading(true)
    const response = await submitOldPassword(password.password, user)
    if (response.status) {
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        dispatch(saveChangePassTokenAfterLogin(response.token))
      }, 1200)

      setRLoading(false)
    } else {
      setError(1)
      setPassError(response)
      setTimeout(() => {
        setError(0)
      }, 1500)
      setRLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
  }
  return (
    <div className="fit-content gap-y-3 min-w-[300px] min-h-[300px] flex flex-col  justify-center px-6 py-8 ">
      {loading ? (
        <>
          <div className="flex w-full justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#512da8]"></div>
          </div>
        </>
      ) : (
        <>
          {isChangePassOtpAfterLogin ? (
            <>
              <div className="w-full p-5 text-center">
                <div className="text-start text-lg font-semibold = mb-2">
                  <label htmlFor="">submit otp</label>
                </div>
                <div>
                  <div className="text-start  flex justify-between text-xs">
                    <div
                      className={`  text-xs text-red-500 transition-opacity duration-500 `}
                    >
                      {otpError}
                    </div>
                  </div>
                  <input
                    onChange={(e) => setOtp(e.target.value)}
                    type="number"
                    className="border py-1 w-full rounded-lg "
                  />
                </div>
                <div className="my-2">00 : {otpCounter}</div>
                {otpCounter == 0 ? (
                  <button
                    onClick={() => {
                      if (!isResendLoading) handleResend()
                    }}
                    className="border text-[#512da8] font-semibold  bg-[#ffffff] border-[#512da8]  rounded-lg py-1 px-5 text-sm uppercase"
                  >
                    {isResendLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-white-900"></div>
                    ) : (
                      'resend'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (!isResendLoading) handleOtpSubmit()
                    }}
                    className="border text-[#ffffff] font-semibold  bg-[#512da8]  rounded-lg py-1 px-5 text-sm uppercase"
                  >
                    {isResendLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-white-900"></div>
                    ) : (
                      'Submit'
                    )}
                  </button>
                )}
              </div>
            </>
          ) : isChangePassAfterLogin ? (
            <>
              <ChangePassForm onClose={handleClose} />
            </>
          ) : changeWithOtp ? (
            <>
              <form className="w-full">
                <h1 className="text-2xl font-bold mb-2">Old password</h1>

                <div className="w-[300px]">
                  <div
                    className={` pt-1 text-xs text-red-500 transition-opacity duration-500 ${
                      error == 3 ? '' : 'opacity-0'
                    }`}
                  >
                    Fill all the fields
                  </div>
                  <div className=" relative">
                    <input
                      onChange={(e) =>
                        setPassword({
                          ...password,
                          password: e.target.value.trim(),
                        })
                      }
                      type={passView ? 'text' : 'password'}
                      placeholder="New password"
                      className="border text-sm w-full py-2 px-3 rounded-lg"
                    ></input>
                    {passView ? (
                      <FontAwesomeIcon
                        onClick={() => setPassView(false)}
                        icon={faEye}
                        className="size-4 text-[#828282] absolute top-3 right-3"
                      />
                    ) : (
                      <FontAwesomeIcon
                        onClick={() => setPassView(true)}
                        icon={faEyeSlash}
                        className="size-4 text-[#828282] absolute top-3 right-3"
                      />
                    )}
                  </div>
                  <div className=" text-sm flex w-full justify-between ">
                    <div
                      className={` py-1 text-xs text-red-500 transition-opacity duration-500 ${
                        error == 1 ? '' : 'opacity-0'
                      }`}
                    >
                      {passwordError}
                    </div>
                  </div>
                </div>
                <div className="flex justify-center mt-2">
                  <button
                    onClick={(e) => {
                      if (!isResendLoading) {
                        handleSubmit(e)
                      }
                    }}
                    className="bg-[#512da8] flex justify-center text-sm min-w-32 py-2 font-semibold px-4 rounded-lg text-[#ffffff]"
                  >
                    {isResendLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-white-900"></div>
                    ) : (
                      'Confirm'
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              {userDetails?.isGoogleSignUp ? (
                <>
                  <div className="cursor-pointer px-4 tracking-wide font-semibold bg-[#ede9f7] text-center fit-content py-3 border shadow-md rounded-lg">
                    <div>
                      <FontAwesomeIcon icon={faLock} className="text-3xl" />
                    </div>
                    <div className="flex items-center mt-2">
                      <FontAwesomeIcon
                        icon={faCircleExclamation}
                        className="text-red-500 me-2"
                      />
                      <p className="font-medium">
                        You are google signup user you cant do this action
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {' '}
                  <div
                    onClick={() => changePasswithOtp()}
                    className="w-full cursor-pointer tracking-wide bg-[#512da8] font-semibold text-[#ffffff] flex justify-center items-center h-12 border shadow-lg rounded-lg"
                  >
                    Change with otp
                  </div>
                  <div
                    onClick={() => setChangeWithOtp(true)}
                    className="cursor-pointer tracking-wide font-semibold bg-[#ede9f7] flex justify-center items-center h-12 border shadow-md rounded-lg"
                  >
                    Change with old password
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
