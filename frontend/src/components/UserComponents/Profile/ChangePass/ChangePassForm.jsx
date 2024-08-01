import { useState } from 'react'

//font awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { validatePassword } from '../../../../../helpers/ValidationHelpers/ValidationHelper'
import { submiNewPassword } from '../../../../Service/Apiservice/UserApi'
import { showSuccessToast } from '../../../../utils/toast'
export default function ChangePassForm({ onClose }) {
  const [password, setPassword] = useState({})
  const [error, setError] = useState(0)
  const [passView, setPassView] = useState(false)
  const [passwordError, setPassError] = useState('')
  const [isLoading, setLoading] = useState(false)

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
    setLoading(true)

    const response = await submiNewPassword(password.password)
    if (response == true) {
      setLoading(false)
      showSuccessToast('Passwword changes successfully')
      onClose()
    } else {
      setError(1)
      setPassError(response)
      setTimeout(() => {
        setError(0)
      }, 1500)
      setLoading(false)
    }
  }

  return (
    <form className="w-full">
      <h1 className="text-2xl font-bold mb-2">Change password</h1>

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
              setPassword({ ...password, password: e.target.value.trim() })
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

      <input
        type={passView ? 'text' : 'password'}
        onChange={(e) =>
          setPassword({ ...password, confimrPassword: e.target.value.trim() })
        }
        placeholder="Confirm password"
        className="border text-sm w-full py-2 px-3 rounded-lg"
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
      <div className="flex justify-center">
        <button
          onClick={(e) => {
            if (!isLoading) handleSubmit(e)
          }}
          className="flex justify-center bg-[#512da8] text-sm min-w-32 py-2 font-semibold px-4 rounded-lg text-[#ffffff]"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-white-900"></div>
          ) : (
            'Confirm'
          )}
        </button>
      </div>
    </form>
  )
}
