import { Request, Response, NextFunction } from 'express'
import UserUseCase from '../usecases/userUsecase'

class PaymentContoller {
  private userCase: UserUseCase
  constructor(userCase: UserUseCase) {
    this.userCase = userCase
  }

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { amount, id } = req.body

      const result = await this.userCase.createOrder(amount, id)
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, paymentId, signature, userId } = req.body

      const result = await this.userCase.verifyPayment(
        orderId,
        paymentId,
        signature,
        userId
      )
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
    }
  }

  async addFundsOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, email } = req.body
      const result = await this.userCase.addOrderFunds(userId, email)
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async verifyAddFundsPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, paymentId, signature, userId, amount } = req.body

      const result = await this.userCase.verifyaddFundsPayment(
        orderId,
        paymentId,
        signature,
        userId,
        Number(amount)
      )
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}

export default PaymentContoller
