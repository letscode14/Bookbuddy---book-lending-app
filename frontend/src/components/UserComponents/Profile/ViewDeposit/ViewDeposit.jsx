import React, { useEffect, useState } from 'react'
import {
  createAddFundsOrder,
  getDeposit,
  verifyAddfundsPayment,
} from '../../../../Service/Apiservice/UserApi'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleExclamation,
  faIndianRupee,
} from '@fortawesome/free-solid-svg-icons'
import { useSelector } from 'react-redux'
import { selecUser } from '../../../../store/slice/userAuth'
import { showErrorToast, showSuccessToast } from '../../../../utils/toast'

export default function ViewDeposit({ user }) {
  const [deposit, setDeposit] = useState('')
  const [deductions, setDeductions] = useState([])
  const [isLoading, setloading] = useState(true)
  const [isAddFundsLoading, setALoading] = useState(false)
  const { userDetails } = useSelector(selecUser)
  const [fetch, setFetch] = useState(false)

  useEffect(() => {
    const fetchDeposit = async () => {
      const response = await getDeposit(user)
      if (response) {
        setDeposit(response.cautionDeposit)
        setDeductions(response.recentDeduction)
        setloading(false)
      } else {
        setloading(false)
      }
    }
    fetchDeposit()
  }, [fetch])
  const loadRazorpayScript = () => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
  }
  const makeRefunds = async (userId) => {
    loadRazorpayScript()
    setALoading(true)
    try {
      const response = await createAddFundsOrder(userId, userDetails.email)
      if (response) {
        setALoading(false)
      } else {
        showErrorToast('payment error')
        setALoading(false)
        return
      }
      const amount = response.amount
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: response.amount,
        currency: response.currency,
        name: 'BookBuddy',
        description: 'Caution deposit',
        image:
          'https://asset.cloudinary.com/dcoy7olo9/256c070690b6fa46830b48cacfebaf0c',
        order_id: response.id,
        handler: async (response) => {
          console.log(response)
          verify(response, amount)
        },
        prefill: {
          name: response.notes.name,
          email: response.notes.email,
          contact: response.notes.contact,
        },
        theme: {
          color: '#512da8',
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.log(error)
    }
  }

  const verify = async (response, amount) => {
    try {
      const verificationResponse = await verifyAddfundsPayment(
        response.razorpay_order_id,
        response.razorpay_payment_id,
        response.razorpay_signature,
        user,
        amount
      )

      if (verificationResponse.status === 200) {
        showSuccessToast('Payment is successfull')
        setFetch(true)
      } else if (verificationResponse.status == 400) {
        showErrorToast('Payment was not successfull try again!')
      }
    } catch (error) {
      alert('Payment verification error', error)
    }
  }

  return (
    <>
      <div className="w-[600px] flex flex-col max-h-[600px] h-[600px] xs:w-full lg:px-10 md:p-6 sm:p-6 xs:p-6">
        <div className="h-[38%] border  p-3">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
            </div>
          ) : (
            <div
              className={`text-4xl font-semibold ${deposit < 100 ? 'text-red-500' : 'text-[#512da8]'} `}
            >
              <div className="text-lg font-medium mb-1 text-[#000000]">
                Deposit amount
              </div>
              <div>
                <FontAwesomeIcon icon={faIndianRupee} /> {deposit}
              </div>
              {deposit < 100 ? (
                <>
                  <div className="text-[#000000] font-medium py-[3px] text-xs inline-block px-3 rounded-lg mt-2  bg-[#ede9f7]">
                    <FontAwesomeIcon
                      icon={faCircleExclamation}
                      className="me-2 text-red-500"
                    />
                    Your caution deposit is below ₹100. Please add funds to
                    continue borrowing and lending books.
                  </div>
                  <div className="">
                    <button
                      onClick={() => makeRefunds(user)}
                      className="border flex justify-center mt-3 border-[#512da8] text-[#512da8] text-xs font-semibold   w-28 text-sm py-1 rounded-lg uppercase"
                    >
                      {isAddFundsLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#512da8]"></div>
                      ) : (
                        ' Add funds'
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-[#000000] font-medium py-[3px] text-xs inline-block px-3 rounded-lg mt-2  bg-[#ede9f7]">
                  <FontAwesomeIcon
                    icon={faCircleExclamation}
                    className="me-2 text-[#512da8]"
                  />
                  In our app, we require users to maintain a caution deposit,
                  which is refundable if they comply with our terms and
                  conditions. If a user incurs charges due to actions like book
                  damage, their deposit is deducted accordingly. When the
                  deposit falls below ₹100, users need to add funds
                </div>
              )}
            </div>
          )}
        </div>
        <div className="grow  overflow-y-auto border px-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
            </div>
          ) : deductions.length > 0 ? (
            deductions.map((d) => (
              <>
                <div className="px-3 py-1">
                  <div className="text-xl font-semibold text-red-400">
                    - {d?.amount}
                  </div>
                  <div className="text-base xs:text-sm">{d?.note}</div>
                  <div className="text-gray-400 font-semibold">
                    {new Date(d.date).toDateString()}
                  </div>
                </div>
                <div className="border my-2"></div>
              </>
            ))
          ) : (
            <div className="text-center mt-2 ">No deductions</div>
          )}
        </div>
      </div>
    </>
  )
}
