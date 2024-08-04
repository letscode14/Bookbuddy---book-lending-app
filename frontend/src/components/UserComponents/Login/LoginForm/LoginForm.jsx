import otpLogo from '/images/email.png'
import './LoginForm.css'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

//font awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronCircleRight,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons'

//validation functions
import {
  validateEmail,
  validatePassword,
} from '../../../../../helpers/ValidationHelpers/ValidationHelper'
import OAuth from '../../../Oauth/OAuth'
//

//store
import { useSelector, useDispatch } from 'react-redux'
import { selectError } from '../../../../store/slice/errorSlice'
import {
  selectLoading,
  startLoading,
  stopLoading,
} from '../../../../store/slice/loadinSlice'
import { login } from '../../../../Service/Apiservice/UserApi'
import { saveUser } from '../../../../store/slice/userAuth'
import { showSuccessToast } from '../../../../utils/toast'

export default function LoginForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [fieldError, setFieldError] = useState({ email: '', password: '' })
  const [userDetails, setUserDetails] = useState({ email: '', password: '' })
  const [error, setError] = useState([])
  const [passwordError, setPassError] = useState('')
  const [passView, setPassView] = useState(false)
  const { customError } = useSelector(selectError)
  const { isLoading } = useSelector(selectLoading)
  useEffect(() => {
    document.title = 'Login'
  }, [])

  const handleSubmit = async (e) => {
    function resetError() {
      setTimeout(() => {
        setError([])

        setTimeout(() => {
          setFieldError({ email: '', password: '' })
          setPassError('')
        }, 300)
      }, 1700)
    }
    e.preventDefault()
    if (!userDetails.email && !userDetails.password) {
      setFieldError({
        ...fieldError,
        password: 'password is required ',
        email: 'email is required',
      })
      setError([1, 2])
      resetError()
      return
    }

    if (!userDetails.email) {
      setFieldError({ ...fieldError, email: 'Email is required' })
      setError([1])
      resetError()
      return
    }

    if (!userDetails.password) {
      setFieldError({ ...fieldError, password: 'Password is required' })
      setError([2])
      resetError()
      return
    }

    if (!validateEmail(userDetails.email)) {
      setError([1])
      resetError()
      return
    }
    const pass = validatePassword(userDetails.password)

    if (pass !== true) {
      setPassError(pass)
      setError([2])
      resetError()
      return
    }

    dispatch(startLoading())
    const response = await login(userDetails)
    if (response.status) {
      dispatch(stopLoading())
      dispatch(
        saveUser({ user: response.user, accessToken: response.accessToken })
      )

      navigate('/user/home')
      showSuccessToast('Logged in')
    }
  }

  return (
    <form className="w-full  px-[40px] xs:px-7">
      <h1 className="text-3xl font-bold mb-2 xs:text-xl">Sign In</h1>

      <div className="w-full ">
        <div className="flex justify-between">
          <div
            className={` pt-1 text-xs text-red-500 transition-opacity duration-200 `}
          >
            {customError}
          </div>
          <div className="opacity-0 text-xs">sdv</div>
        </div>

        <input
          onChange={(e) =>
            setUserDetails({ ...userDetails, email: e.target.value.trim() })
          }
          placeholder="Email"
        ></input>

        <div
          className={`pb-1 text-xs text-red-500 transition-opacity duration-500 ${
            error.includes(1) ? '' : 'opacity-0'
          }`}
        >
          {fieldError.email ? fieldError.email : 'Enter a valid email'}
        </div>
      </div>
      <div className="w-full relative">
        <input
          type={passView ? 'text' : 'password'}
          onChange={(e) =>
            setUserDetails({ ...userDetails, password: e.target.value.trim() })
          }
          placeholder="Password"
        />
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
            error.includes(2) ? '' : 'opacity-0'
          }`}
        >
          {fieldError.password
            ? fieldError.password
            : passwordError
              ? passwordError
              : ''}
        </div>
        <div
          onClick={() => {
            navigate('/verify-email')
          }}
          className={`cursor-pointer ${error == 2 ? 'hidden' : ''}`}
        >
          Forget your password?
        </div>
      </div>

      <button
        disabled={isLoading}
        onClick={handleSubmit}
        className="signup-button   flex justify-center items-center"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#]"></div>
        ) : (
          'SIGN in'
        )}
      </button>
      <div className="w-full text-center py-1">
        <span>--------- OR ---------</span>
      </div>
      <div className="flex">
        <OAuth />
        <div
          onClick={() => navigate('/register-email')}
          className="cursor-pointer hover:scale-110 google-auth-button  flex items-center justify-center duration-300"
        >
          <img className="google-auth-icon " src={otpLogo} alt="" />
        </div>
      </div>
      <div className="mt-3 sm:hidden flex items-center">
        <span className="me-2">Dont have a account?</span>
        <FontAwesomeIcon
          onClick={() => navigate('/signup')}
          className="sm:hidden xs:text-xl xs:text-[#512da8]"
          icon={faChevronCircleRight}
        />
      </div>
    </form>
  )
}
