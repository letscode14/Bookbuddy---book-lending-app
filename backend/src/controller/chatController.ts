import UserUseCase from '../usecases/userUsecase'
import { Request, Response, NextFunction } from 'express'

class ChatController {
  private userCase: UserUseCase
  constructor(userCase: UserUseCase) {
    this.userCase = userCase
  }

  async getChat(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userCase.getChat(req)
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
  async getAllchat(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userCase.getAllChat(req)
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userCase.sendMessage(req)
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async getAllMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const { chatId, pageNo } = req.query as { chatId: string; pageNo: string }
      const result = await this.userCase.getAllMessages(chatId, pageNo)
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async makeMsgRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { messageId } = req.params as { messageId: string }
      const result = await this.userCase.makeMsgRead(messageId)
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async declineRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userCase.declineRequest(req)
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async acceptRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userCase.acceptRequest(req)
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}
export default ChatController
