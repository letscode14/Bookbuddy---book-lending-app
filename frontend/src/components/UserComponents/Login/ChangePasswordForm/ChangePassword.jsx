import { useState } from 'react'

//font awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { validatePassword } from '../../../../../helpers/ValidationHelpers/ValidationHelper'
import { useDispatch, useSelector } from 'react-redux'
import { selectError } from '../../../../store/slice/errorSlice'
import { submitNewPasswordBeforeLogin } from '../../../../Service/Apiservice/UserApi'
import { showSuccessToast } from '../../../../utils/toast'
import { useNavigate } from 'react-router-dom'
import { saveChangePassToken } from '../../../../store/slice/authSlice'
export default function ChangePassword() {
  const [password, setPassword] = useState({})
  const [error, setError] = useState(0)
  const [passView, setPassView] = useState(false)
  const [passwordError, setPassError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { customError } = useSelector(selectError)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (
      Object.entries(password).length != 2 ||
      password.password == '' ||
      password.confimrPassword == ''
    ) {
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

    if (password.password !== password.confimrPassword) {
      setError(5)
      setTimeout(() => {
        setError(0)
      }, 1500)
      return
    }
    setIsLoading(true)
    const response = await submitNewPasswordBeforeLogin(password.password)
    if (response) {
      showSuccessToast('Password changes successfully')
      navigate('/login')
      dispatch(saveChangePassToken(null))
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }

  return (
    <form className="w-full">
      <h1 className="text-3xl font-bold mb-2">Change password</h1>

      <div className="w-full">
        <div className=" text-sm flex w-full justify-between ">
          <div
            className={` pt-1 text-xs text-red-500 transition-opacity duration-500 ${
              error == 3 ? '' : 'opacity-0'
            }`}
          >
            Fill all the fields
          </div>
          <div
            className={`pb-1 text-xs text-red-500 transition-opacity duration-500 ${
              customError ? '' : 'opacity-0'
            }`}
          >
            {customError}
          </div>
        </div>

        <div className="w-full relative">
          <input
            onChange={(e) =>
              setPassword({ ...password, password: e.target.value.trim() })
            }
            type={passView ? 'text' : 'password'}
            placeholder="New password"
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
          <div
            className={` py-1 text-xs text-red-500 transition-opacity duration-500 ${'opacity-0'}`}
          >
            ?
          </div>
        </div>
      </div>

      <input
        type={passView ? 'text' : 'password'}
        onChange={(e) =>
          setPassword({ ...password, confimrPassword: e.target.value.trim() })
        }
        placeholder="Confirm password"
      />
      <div className="w-full">
        <div
          className={` py-1 text-xs text-red-500 transition-opacity duration-500 ${
            error == 5 ? '' : 'opacity-0'
          }`}
        >
          Password doesnt match!
        </div>
      </div>

      <button
        onClick={(e) => {
          if (!isLoading) handleSubmit(e)
        }}
        className="flex justify-center items-center sign-in-button"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-white-900"></div>
        ) : (
          'CONFIRM'
        )}
      </button>
    </form>
  )
}
