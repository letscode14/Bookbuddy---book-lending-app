import { Request, Response, NextFunction, response } from 'express'
import UserUseCase from '../usecases/userUsecase'

class UserController {
  private userCase: UserUseCase

  constructor(userCase: UserUseCase) {
    this.userCase = userCase
  }

  async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userData = req.body
      const user = await this.userCase.registrationUser(userData)

      if (user.activationToken) {
        res.cookie('activationToken', user.activationToken, {
          httpOnly: true,
          secure: true,
        })
      }
      return res.status(user?.statusCode).json({ ...user })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async checkUsername(req: Request, res: Response, next: NextFunction) {
    try {
      const { username } = req.body
      const result = await this.userCase.checkUsername(username)
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next()
    }
  }
  async activateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { otp } = req.body

      const token = req.cookies.activationToken
      const user = await this.userCase.activateUser(token, otp)
      res.cookie('refreshToken', user.refreshToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 10000,
      })
      let message
      if (user?.message) {
        message = user.message
      }

      res.status(user?.statusCode).json({ message, ...user })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.activationToken as string
      const type = req.body.type as string

      const user = await this.userCase.resendOtp(token)
      if (user.activationToken) {
        res.cookie('activationToken', user.activationToken, {
          httpOnly: true,
          secure: true,
        })
      }
      console.log(user)

      res.status(user?.statusCode).json({ message: user.message, ...user })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async googleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.body

      const result = await this.userCase.googleAuth(user)
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 10000,
      })
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.body
      const result = await this.userCase.loginUser(user)

      if (result.refreshToken) {
        res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 10000,
        })
      }
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async protected(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({ message: '' })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async loginWithOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.body

      const result = await this.userCase.loginWithOtp(user)
      res.cookie('activationToken', result.accessToken, {
        httpOnly: true,
        secure: true,
      })
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async submitLoginOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, otp } = req.body

      const result = await this.userCase.submitOtp(token, otp)
      if (result.statusCode == 200) {
        res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 10000,
        })
      }
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async logoutUser(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('logout')

      res.clearCookie('accessToken')
      res.clearCookie('refreshToken')
      res.status(200).json({ message: 'User LogOut success fully' })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  //create post

  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userCase.createPost(req)
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async getPost(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userCase.getPost(req.params.id)
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userCase.getUser(req.params.id, req)
      res.status(user.statusCode).json({ ...user })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async getSuggestion(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userCase.suggestUsers(req)
      res.status(user.statusCode).json({ users: user.result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async getPostContent(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async followUser(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.userCase.followUser(req)
      res.status(response.statusCode).json({ response })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
  async unFollowUser(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.userCase.unFollowUser(req)
      res.status(response.statusCode).json({ response })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async getPostData(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params

      const response = await this.userCase.getPostData(req, id)
      res.status(response.statusCode).json({ ...response })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async likePost(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.userCase.likePost(req)
      res.status(response.statusCode).json({ ...response })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async UnLikePost(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.userCase.UnLikePost(req)
      console.log(response)

      res.status(response.statusCode).json({ ...response })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async verifyEditEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userCase.verifyEditEmail(req)
      if (result.activationToken) {
        res.cookie('activationToken', result.activationToken, {
          httpOnly: true,
          secure: true,
        })
      }
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async verifyEmailEditOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.activationToken
      const result = await this.userCase.verifyEmailEditOtp(
        token,
        req.body.code
      )
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async editUserDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userCase.editUserDetails(req)
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async getPostDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userCase.getPostDetails(req)
      res.status(200).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userCase.addComment(req)
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
  async addReply(req: Request, res: Response, next: NextFunction) {
    try {
      const reponse = await this.userCase.addReply(req)
      res.status(response.statusCode).json({ ...reponse })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async getF(req: Request, res: Response, next: NextFunction) {
    try {
      const reponse = await this.userCase.getF(req)
      res.status(response.statusCode).json({ ...reponse })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async report(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userCase.postReport(req)
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async getBookshelf(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.query.userId as string
      const result = await this.userCase.getBookshelf(userId)

      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async viewBook(req: Request, res: Response, next: NextFunction) {
    try {
      const bookId = req.query.bookId as string
      const userId = req.query.userId as string

      const result = await this.userCase.viewBook(bookId, userId)

      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async editBook(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userCase.editBook(req)

      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
  async removeBook(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userCase.removeBook(req)

      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async getRequestBook(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userCase.getRequestBook(req)

      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async addStory(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userCase.addStory(req)
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async getStories(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userCase.getStories(req)
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async makeStoryViewed(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userCase.makeStoryViewed(req)
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async getLendedBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, pageNo } = req.query as { userId: string; pageNo: string }
      const result = await this.userCase.getLendedBooks(userId, Number(pageNo))
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async getBorrowedBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, pageNo } = req.query as { userId: string; pageNo: string }
      const result = await this.userCase.getBorrowedBooks(
        userId,
        Number(pageNo)
      )
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, pageNo, unRead } = req.query as {
        userId: string
        pageNo: string
        unRead: string
      }

      const u = Number(unRead)

      const result = await this.userCase.getNotifications(
        userId,
        Number(pageNo),
        Boolean(u)
      )
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async giveBackBook(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userCase.giveBackBook(req)
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async collectBook(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userCase.collectBook(req)
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
  //change pass before login
  async changePassEmailVerify(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body
      const result = await this.userCase.verifyChangePassEmail(email)
      if (result.activationToken) {
        res.cookie('changePassOtpTokenBeforeLogin', result.activationToken, {
          maxAge: 5 * 60 * 1000,
          httpOnly: true,
        })
      }

      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
  async resendOtpPassBeforeLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const token = req.cookies.changePassOtpTokenBeforeLogin as string
      const result = await this.userCase.resendChangePassOtpBeforeLogin(token)
      if (result.activationToken) {
        res.cookie('changePassOtpTokenBeforeLogin', result.activationToken, {
          maxAge: 5 * 60 * 1000,
          httpOnly: true,
        })
      }

      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async submitOtpChangePassBeforeLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const token = req.cookies.changePassOtpTokenBeforeLogin as string
      const otp = req.body.otp
      const result = await this.userCase.submitOtpBeforeLogin(token, otp)
      if (result.activationToken) {
        res.cookie('changePassTokenBeforeLogin', result.activationToken, {
          maxAge: 5 * 60 * 1000,
          httpOnly: true,
        })
      }

      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async submitNewPasswordBeforeLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const token = req.cookies.changePassTokenBeforeLogin
      const password = req.body.password
      const result = await this.userCase.submitNewPasswordBeforeLogin(
        password,
        token
      )
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  //
  async searchUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.search as string

      const pageNo = parseInt(req.query.pageNo as string)
      const user = req.query.user as string
      const result = await this.userCase.searchUsers(pageNo, query, user)
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async exploreNearByBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.userId as string
      const result = await this.userCase.exploreBooks(query)
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async getOtpForChangePassAfterLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.query.userId as string
      const email = req.query.email as string
      const result = await this.userCase.otpChangePassAfterLogin(userId, email)
      if (result.activationToken) {
        res.cookie('changePassOtpTokenAfterLogin', result.activationToken, {
          maxAge: 2 * 60 * 1000,
          httpOnly: true,
        })
      }
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async resendForChangePassAfterLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const userId = req.query.userId as string
    const changePassOtpCookie = req.cookies.changePassOtpTokenAfterLogin
    const result = await this.userCase.otpResendPassAfterLogin(
      changePassOtpCookie,
      userId
    )
    if (result.activationToken) {
      res.cookie('changePassOtpTokenAfterLogin', result.activationToken, {
        maxAge: 2 * 60 * 1000,
        httpOnly: true,
      })
    }
    res.status(result.statusCode).json({ ...result })

    try {
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async submitChangePassOtpAfterLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const changePassOtpCookie = req.cookies.changePassOtpTokenAfterLogin
      const otp = req.body.otp
      const result = await this.userCase.submitChangePassOtpAfterLogin(
        changePassOtpCookie,
        otp
      )
      if (result.activationToken) {
        res.cookie('changePassTokenAfterLogin', result.activationToken, {
          maxAge: 7 * 60 * 1000,
          httpOnly: true,
        })
      }
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async submitOldPassWord(req: Request, res: Response, next: NextFunction) {
    try {
      const password = req.body.password
      const userId = req.query.userId as string
      const result = await this.userCase.checkOldPassword(userId, password)
      if (result.activationToken) {
        res.cookie('changePassTokenAfterLogin', result.activationToken, {
          maxAge: 7 * 60 * 1000,
          httpOnly: true,
        })
      }
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async submitNewPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.changePassTokenAfterLogin
      const password = req.body.password
      const result = await this.userCase.submitNewPassword(token, password)
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  async getDeposit(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userCase.getDeposit(req)
      res.status(result.statusCode).json({ ...result })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}

export default UserController
