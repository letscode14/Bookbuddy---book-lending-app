import React, { useState } from 'react'
import './Subscribe.css'
import damageImage from '/images/damage.jpg'
import lateImage from '/images/5358621.jpg'
import abuseImage from '/images/3991699.jpg'
import meetImage from '/images/meet.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ChildModal from '../../Modal/ChildModal'
import {
  faCheck,
  faCircleCheck,
  faCircleExclamation,
  faIndianRupee,
  faTriangleExclamation,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { createOrder, verifyPayment } from '../../../Service/Apiservice/UserApi'
const ImageComponent = React.lazy(() => import('../../ImageComponent/Image'))
export default function Subscribe({ close, user }) {
  const [loading, setLoading] = useState(false)
  const [isChildModel, setModal] = useState(false)
  const [modalFor, setModalFor] = useState('')
  const loadRazorpayScript = () => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
  }
  const handlePayment = async (amount, user) => {
    loadRazorpayScript()
    try {
      setLoading(true)
      const response = await createOrder(amount, user)
      if (response) {
        setLoading(false)
      }
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
          verify(response)
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

  const verify = async (response) => {
    try {
      const verificationResponse = await verifyPayment(
        response.razorpay_order_id,
        response.razorpay_payment_id,
        response.razorpay_signature,
        user
      )

      if (verificationResponse.status === 200) {
        setModal(true)
        setModalFor('success')
        setTimeout(() => {
          setModal(false)
          setModalFor('')
          close()
        }, 2500)
      } else if (verificationResponse.status == 400) {
        setModal(true)
        setModalFor('failure')
        setTimeout(() => {
          setModal(false)
          setModalFor('')
          close()
        }, 3000)
      }
    } catch (error) {
      alert('Payment verification error', error)
    }
  }
  const handleChildClose = () => {
    setModal(false)
    close()
  }
  return (
    <div
      style={{ scrollbarWidth: 'thin' }}
      className="p-4 flex  w-full xs:block sm:block md:flex  max-h-[500px] max-w-[800px] overflow-auto"
    >
      <ChildModal onClose={handleChildClose} isOpen={isChildModel}>
        {modalFor == 'success' && (
          <div className="w-[500px] flex flex-col justify-center items-center h-[350px] p-3">
            <div className="pulse-container ">
              <div className="wave"></div>
              <div className="wave"></div>
              <div className="pulse flex items-center justify-center">
                <FontAwesomeIcon
                  className="text-3xl font-semibold text-[#ffffff]"
                  icon={faCheck}
                />
              </div>
            </div>
            <div className="text-xl font-medium mt-2">Payment sucessfull</div>
            <p className="text-center mt-2">
              <h1 className="font-semibold">Thank You for the Subscription!</h1>
              Enjoy the benefits and explore our services to the fullest. We re
              excited to have you on board!
            </p>
          </div>
        )}
        {modalFor == 'failure' && (
          <div className="w-[500px] flex flex-col justify-center items-center h-[350px] p-3">
            <div className="pulse-container">
              <div className="wave-failed"></div>
              <div className="wave-failed"></div>
              <div className="pulse-failed flex items-center justify-center">
                <FontAwesomeIcon
                  className="text-3xl font-semibold text-[#ffffff]"
                  icon={faXmark}
                />
              </div>
            </div>
            <div className="text-xl font-medium mt-2">Payment failed</div>
            <p className="text-center mt-2">
              <h1 className="font-semibold">Sorry for the inconvienience!</h1>
              Please try after some times
            </p>
          </div>
        )}
      </ChildModal>
      <div className=" p-6 w-full ">
        <div className="flex items-center justify-center">
          <div className="w-full text-lg">Book damages</div>
          <div className="w-full shadow-lg   rounded-lg overflow-hidden">
            <React.Suspense
              fallback={
                <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
              }
            >
              <ImageComponent src={damageImage} />
            </React.Suspense>
          </div>
        </div>
        <div className="flex items-center my-2 justify-center">
          <div className="w-full shadow-lg me-3  rounded-lg overflow-hidden">
            <React.Suspense
              fallback={
                <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
              }
            >
              <ImageComponent src={lateImage} />
            </React.Suspense>
          </div>

          <div className="w-full text-lg">Not ready to give back</div>
        </div>
        <div className="flex  items-center justify-center">
          <div className="w-full text-lg">Abuse in Meeting</div>
          <div className="w-full  rounded-lg overflow-hidden shadow-lg h-32">
            <React.Suspense
              fallback={
                <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
              }
            >
              <ImageComponent src={abuseImage} />
            </React.Suspense>
          </div>
        </div>
      </div>

      <div className=" w-full p-2">
        <div className="border flex items-center justify-between  h-[25%] bg-[#512da8] rounded-xl flex">
          <div className="ms-3 font-semibold text-lg text-wrap text-[#ffffff]">
            Subscribe to lend and borrow
          </div>
          <div className="h-full">
            <React.Suspense
              fallback={
                <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-[#512da8]"></div>
              }
            >
              <ImageComponent src={meetImage} />
            </React.Suspense>
          </div>
        </div>
        <div className="mt-1 p-1 border   subscribe-details  h-[75%]  rounded-xl ">
          <div className="flex items-baseline w-full justify-center">
            <FontAwesomeIcon className="text-lg" icon={faIndianRupee} />
            <div className="text-[40px] font-bold ms-1">1000</div>
          </div>
          <div className="overflow-y-auto subscription-info h-56">
            <div className="flex px-3">
              <FontAwesomeIcon
                className="text-red-500 text-lg me-2"
                icon={faTriangleExclamation}
              />
              <p className="text-wrap text-sm">
                To borrow and lend books, a security deposit is required. This
                deposit will be maintained in your account and is subject to
                deductions based on specific actions of yours against the terms
                and condition This deposit ensures the quality and availability
                of our books for all members. Please take care of the books to
                avoid any deductions from your security deposit.
              </p>
            </div>
            <div className="flex px-3 mt-1">
              <FontAwesomeIcon
                className="text-[#512da8] text-lg me-2"
                icon={faCircleExclamation}
              />
              <p className="text-wrap text-sm">
                Upon completing your paymet, you will be assigned a{' '}
                <span className="font-semibold">LendScore of 10</span> to
                kickstart your lending journey .Starting with a{' '}
                <span className="font-semibold">Silver Badge,</span>
                and your account will be verified{' '}
                <FontAwesomeIcon
                  className="text-lg text-[#512da8]"
                  icon={faCircleCheck}
                />
                your badge will change as you achieve higher LendScores and meet
                specific milestones in your lending journey.
              </p>
            </div>
          </div>

          <div className="flex justify-center mt-3">
            <button
              onClick={() => handlePayment(1000, user)}
              className="uppercase py-2 flex justify-center items-center rounded-lg w-40 bg-[#512da8] text-xs font-semibold text-[#ffffff]"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4  border-t-2 border-b-2 border-white-900"></div>
              ) : (
                'subscribe'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
