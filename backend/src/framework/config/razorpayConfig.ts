import Razorpay from 'razorpay'
require('dotenv').config()

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEYID as string,
  key_secret: process.env.RAZORPAY_SECRET as string,
})
export default razorpayInstance
