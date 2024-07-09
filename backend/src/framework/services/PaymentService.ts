import Razorpay from 'razorpay'
import crypto from 'crypto'
import shortid from 'shortid'

import razorpayInstance from '../config/razorpayConfig'
import User from '../../entity/userEntity'

class PaymentService {
  private razorpayInstance: Razorpay

  constructor() {
    this.razorpayInstance = razorpayInstance
  }

  async createOrder(amount: number, user: User): Promise<any> {
    try {
      const options = {
        amount: 1000 * 100,
        currency: 'INR',
        receipt: `PY${shortid.generate()}`,
        notes: {
          email: user.email,
          contact: user.contact,
          name: user.name,
        },
      }
      const order = await this.razorpayInstance.orders.create(options)
      return order
    } catch (error) {
      console.log(error)
    }
  }

  async verifyPaymentSignature(
    order_id: string,
    payment_id: string,
    signature: string
  ): Promise<boolean> {
    const hmac = crypto.createHmac(
      'sha256',
      process.env.RAZORPAY_SECRET as string
    )
    hmac.update(`${order_id}|${payment_id}`)
    const generatedSignature = hmac.digest('hex')
    return generatedSignature === signature
  }
}

export default PaymentService
