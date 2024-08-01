import { Request, Response, NextFunction } from 'express'
import AdminUseCase from '../usecases/adminUseCases'
class AdminController {
  private adminCase: AdminUseCase

  constructor(adminCase: AdminUseCase) {
    this.adminCase = adminCase
  }

  async loginAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body.adminDetails

      const result = await this.adminCase.loginAdmin(email, password)
      if (result.accessToken) {
        res.cookie('adminAccessToken', result.accessToken, {
          maxAge: 10000,
        })
        res.cookie('adminRefreshToken', result.refreshToken, {
          maxAge: 30 * 24 * 60 * 60 * 10000,
          httpOnly: true,
        })
      }
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async logoutAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('adminAccessToken')
      res.clearCookie('adminRefreshToken')
      res.status(200).json({ message: 'Admin logged Out success Fully' })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async getAllusers(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.adminCase.getAllUsers(req)

      res
        .status(res.statusCode)
        .json({ user: user.result, totalPage: user.totalPage })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async blockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.adminCase.blockUser(req)
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async getAllPost(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.adminCase.getAllPost(req)
      res.status(response.statusCode).json({ ...response })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
  async getPostReports(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.adminCase.getPostReports(req)
      res.status(response.statusCode).json({ ...response })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async removeReport(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.adminCase.removeReport(req)
      res.status(response.statusCode).json({ ...response })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
  //badge
  async addBadge(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.adminCase.addBadge(req)
      res.status(response.statusCode).json({ ...response })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async getSingleBadge(req: Request, res: Response, next: NextFunction) {
    try {
      const badgeId = req.query.badgeId as string
      const response = await this.adminCase.getSingleBadge(badgeId)
      res.status(response.statusCode).json({ ...response })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async editBadge(req: Request, res: Response, next: NextFunction) {
    const response = await this.adminCase.editBadge(req)
    res.status(response.statusCode).json({ ...response })
    try {
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
  async getBadge(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.adminCase.getBadge()
      res.status(response.statusCode).json({ ...response })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async getLendedTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.adminCase.getLendedTransactions(req)
      res.status(response.statusCode).json({ ...response })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
  async getBorrowedTransactions(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const response = await this.adminCase.getBorrowedTransactions(req)
      res.status(response.statusCode).json({ ...response })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
  async getSingleUser(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.adminCase.getSingleUser(req)
      res.status(response.statusCode).json({ ...response })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async getReportedPost(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.adminCase.getReportedPost(req)
      res.status(response.statusCode).json({ ...response })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async getUserStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.adminCase.getUserStatistics()
      res.status(response.statusCode).json({ ...response })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async getPeriodUserStatistics(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const response = await this.adminCase.getPeriodUserStatistics(req)
      res.status(response.statusCode).json({ ...response })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async getHighLendScoreUser(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.adminCase.getHighLendscoreUsers(req)
      res.status(response.statusCode).json({ ...response })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
  async getPostStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.adminCase.getPostStatistics()
      res.status(response.statusCode).json({ ...response })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async getPeriodPostStatistics(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const response = await this.adminCase.getPeriodPostStatistics(req)
      res.status(response.statusCode).json({ ...response })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async getHighBoostedPost(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.adminCase.getHighBoostedPost(req)
      res.status(response.statusCode).json({ ...response })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async getPost(req: Request, res: Response, next: NextFunction) {
    try {
      const postId = req.query.postId as string
      const response = await this.adminCase.getPost(postId)
      res.status(response.statusCode).json({ ...response })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async removePost(req: Request, res: Response, next: NextFunction) {
    try {
      const postId = req.body.postId

      const result = await this.adminCase.banPost(postId)
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  //transaction statistics
  async getTransactionStatistics(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const response = await this.adminCase.getTransactionStatistics()
      res.status(response.statusCode).json({ ...response })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async getPeriodTransactionStatistics(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const response = await this.adminCase.getPeriodTransactionStatistics(req)
      res.status(response.statusCode).json({ ...response })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
  async getPeriodRequestStatistics(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const response = await this.adminCase.getPeriodRequestStatistics(req)
      res.status(response.statusCode).json({ ...response })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async makeRefund(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.adminCase.makeRefund(req)
      res.status(response.statusCode).json({ ...response })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}

export default AdminController
