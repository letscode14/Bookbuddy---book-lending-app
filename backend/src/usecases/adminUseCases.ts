import IJwtToken from './interface/IJwtToken'
import JwtTokenService from '../framework/services/JwtToken'
import IAdminRepository from './interface/IAdminRepository'
import Admin from '../entity/adminEntity'
import Cloudinary from '../framework/services/Cloudinary'
import { Request, response } from 'express'
import SendEmail from '../framework/services/SendEmail'
import { IPost } from '../framework/databases/postModel'
import IRequest from '../entity/requestEntity'
import PaymentService from '../framework/services/PaymentService'
interface ResponseType {
  _id?: string
  result?: Admin | {}
  status?: boolean
  statusCode: number
  message?: string
  refreshToken?: string
  accessToken?: string
  totalPage?: number
}
class AdminUseCase {
  private iAdminRepository: IAdminRepository
  private JwtToken: JwtTokenService
  private Cloudinary: Cloudinary
  private sendEmail: SendEmail
  private paymentService: PaymentService

  constructor(
    iAdminRepository: IAdminRepository,
    JwtToken: JwtTokenService,

    cloudinary: Cloudinary,
    sendEmail: SendEmail,
    paymentService: PaymentService
  ) {
    this.JwtToken = JwtToken
    this.iAdminRepository = iAdminRepository
    this.Cloudinary = cloudinary
    this.sendEmail = sendEmail
    this.paymentService = paymentService
  }

  async loginAdmin(email: string, password: string): Promise<ResponseType> {
    try {
      const emailExists = (await this.iAdminRepository.findByEmail(
        email
      )) as Admin

      if (!emailExists) {
        return {
          statusCode: 401,
          message: 'Admin Not Found',
        }
      }

      const hash = emailExists.password

      const pass = await this.iAdminRepository.loginAdmin(password, hash)
      if (!pass) {
        return {
          statusCode: 401,
          message: 'Invalid Credentials',
        }
      }
      const accessToken = await this.JwtToken.SignInAccessToken({
        id: emailExists._id as string,
        role: emailExists.role as string,
      })

      const refreshToken = await this.JwtToken.SignInRefreshToken({
        id: emailExists._id as string,
        role: emailExists.role as string,
      })

      return {
        statusCode: 200,
        accessToken,
        refreshToken,
        message: 'Admin logged Successfully',
        _id: emailExists._id,
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }

  async getAllUsers(req: Request): Promise<ResponseType> {
    try {
      const result = await this.iAdminRepository.fetchUsers(req)

      if (result) {
        return {
          statusCode: 200,
          result: result.users,
          totalPage: result.totalPages,
        }
      }

      return {
        statusCode: 204,
        message: 'NOt users ',
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'internal server error',
      }
    }
  }

  async blockUser(req: Request): Promise<ResponseType> {
    try {
      const { action } = req.body

      const result = await this.iAdminRepository.blockUser(req)
      if (result) {
        return {
          statusCode: 200,
          message:
            action == 'Block'
              ? 'User Blocked successfully'
              : 'User Unblocked successfully',
        }
      }

      return {
        statusCode: 409,
        message: 'unkown conflict',
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal Server error',
      }
    }
  }

  async getAllPost(req: Request): Promise<ResponseType> {
    try {
      const post = await this.iAdminRepository.getAllPost(req)

      if (post) {
        return {
          statusCode: 200,
          ...post,
        }
      }

      return {
        statusCode: 409,
        message: 'Unexpected error occured',
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }
  async getPostReports(req: Request): Promise<ResponseType> {
    try {
      const response = await this.iAdminRepository.getPostReports(req)
      if (response) {
        return {
          statusCode: 200,
          result: response,
        }
      }
      return {
        statusCode: 409,
        message: 'unexpected error occured',
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }
  async removeReport(req: Request): Promise<ResponseType> {
    try {
      const response = await this.iAdminRepository.removeReport(req)
      if (response) {
        return {
          statusCode: 200,
          message: 'report removed',
        }
      }
      return {
        statusCode: 409,
        message: 'unexpected error occured',
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }
  async addBadge(req: Request): Promise<ResponseType> {
    try {
      const { files } = req
      const file = files.icon
      const { badgeName } = req.body

      const isAvail = await this.iAdminRepository.findBadgeByName(badgeName)
      if (isAvail) {
        return {
          statusCode: 400,
          message: 'Badge already present',
        }
      }

      const cloudRes = (await this.Cloudinary.cloudinaryUpload(file)) as {
        public_id: string
        secure_url: string
      }

      if (cloudRes) {
        const doc = {
          public_id: cloudRes.public_id,
          secure_url: cloudRes.secure_url,
        }
        const badge = await this.iAdminRepository.createBadge(req, doc)
        if (badge) {
          return {
            statusCode: 200,
            message: 'New badge created success fully',
            result: badge,
          }
        } else {
          return {
            statusCode: 409,
            message: 'unexpected error occured',
          }
        }
      }
      return {
        statusCode: 409,
        message: 'unexpected error occured',
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }

  async getSingleBadge(badgeId: string): Promise<ResponseType> {
    const result = await this.iAdminRepository.getSingleBadge(badgeId)
    if (result) {
      return {
        statusCode: 200,
        result: result,
      }
    }
    try {
      return {
        statusCode: 400,
        message: 'unexpected error occured',
      }
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }
  async editBadge(req: Request): Promise<ResponseType> {
    try {
      const { badgeName } = req.body
      const { isChanged } = req.query

      const isAvail = await this.iAdminRepository.findBadgeByName(badgeName)

      if (isAvail == true && isChanged == 'true') {
        return {
          statusCode: 400,
          message: 'Badge name already exists',
        }
      }

      const result = await this.iAdminRepository.editBadge(req)

      if (result) {
        return {
          statusCode: 200,
          message: 'Badge edited successfully',
        }
      }
      return {
        statusCode: 400,
        message: 'unexpected error occured',
      }
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }

  async getBadge(): Promise<ResponseType> {
    try {
      const badges = await this.iAdminRepository.getBadge()
      if (badges) {
        return {
          statusCode: 200,
          message: 'fecthed',
          result: badges,
        }
      } else {
        return {
          statusCode: 204,
          message: 'not badges',
        }
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }
  async getLendedTransactions(req: Request): Promise<ResponseType> {
    try {
      const result = await this.iAdminRepository.getLendedTransactions(req)
      if (result) {
        return {
          statusCode: 200,
          message: 'fetched',
          result: result,
        }
      } else {
        return {
          statusCode: 204,
          message: 'not badges',
        }
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }
  async getBorrowedTransactions(req: Request): Promise<ResponseType> {
    try {
      const result = await this.iAdminRepository.getBorrowedTransactions(req)
      if (result) {
        return {
          statusCode: 200,
          message: 'fetched',
          result: result,
        }
      } else {
        return {
          statusCode: 204,
          message: 'not badges',
        }
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }

  async getSingleUser(req: Request): Promise<ResponseType> {
    try {
      const result = await this.iAdminRepository.getSingleUser(req)
      if (result) {
        return {
          statusCode: 200,
          message: 'fetched',
          result: result,
        }
      } else {
        return {
          statusCode: 204,
          message: 'no content',
        }
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }

  async getReportedPost(req: Request): Promise<ResponseType> {
    try {
      const result = await this.iAdminRepository.getReportedPost(req)
      if (result) {
        return {
          statusCode: 200,
          message: 'fetched',
          result: result,
        }
      } else {
        return {
          statusCode: 204,
          message: 'no content',
        }
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }
  async getUserStatistics(): Promise<ResponseType> {
    try {
      const result = await this.iAdminRepository.getUserStatistics()
      if (result) {
        return {
          statusCode: 200,
          result: result,
        }
      } else {
        return {
          statusCode: 204,
          message: 'no content',
        }
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }

  async getPeriodUserStatistics(req: Request): Promise<ResponseType> {
    try {
      const result = await this.iAdminRepository.getPeriodUserStatistics(req)

      if (result) {
        return {
          statusCode: 200,
          result: result,
        }
      } else {
        return {
          statusCode: 204,
          message: 'no content',
        }
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }

  async getHighLendscoreUsers(req: Request): Promise<ResponseType> {
    try {
      const result = await this.iAdminRepository.getHighLendscoreUser(req)
      if (result) {
        return {
          statusCode: 200,
          result: result,
        }
      } else {
        return {
          statusCode: 204,
          message: 'no content',
        }
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }
  async getPostStatistics(): Promise<ResponseType> {
    try {
      const result = await this.iAdminRepository.getPostStatistics()
      if (result) {
        return {
          statusCode: 200,
          result: result,
        }
      } else {
        return {
          statusCode: 204,
          message: 'no content',
        }
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }

  async getPeriodPostStatistics(req: Request): Promise<ResponseType> {
    try {
      const result = await this.iAdminRepository.getPeriodPostStatistics(req)

      if (result) {
        return {
          statusCode: 200,
          result: result,
        }
      } else {
        return {
          statusCode: 204,
          message: 'no content',
        }
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }

  async getHighBoostedPost(req: Request): Promise<ResponseType> {
    try {
      const result = await this.iAdminRepository.getHighBoostedPost(req)
      if (result) {
        return {
          statusCode: 200,
          result: result,
        }
      } else {
        return {
          statusCode: 204,
          message: 'no content',
        }
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }

  async getPost(postId: string): Promise<ResponseType> {
    try {
      const result = await this.iAdminRepository.getPost(postId)
      if (result) {
        return {
          statusCode: 200,
          result: result,
        }
      } else {
        return {
          statusCode: 204,
          message: 'no content',
        }
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }

  async banPost(postId: string): Promise<ResponseType> {
    try {
      const result = await this.iAdminRepository.banPost(postId)
      if (result) {
        const { email } = result.userId as { email: string }
        const code = result.ID
        const subject = `One of your post has deleted for violation of terms and conditions  click this link to know about the post ${result.imageUrls[0].secure_url} `
        this.sendEmail.sendEmail({ email, subject, code })
        return {
          statusCode: 200,
          result: result,
        }
      }
      return {
        statusCode: 409,
        message: 'un expected error occured',
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }

  //transactions statistics
  async getTransactionStatistics(): Promise<ResponseType> {
    try {
      const result = await this.iAdminRepository.getTransactionStatistics()
      if (result) {
        return {
          statusCode: 200,
          result: result,
        }
      } else {
        return {
          statusCode: 204,
          message: 'no content',
        }
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }

  async getPeriodTransactionStatistics(req: Request): Promise<ResponseType> {
    try {
      const result =
        await this.iAdminRepository.getPeriodTransactionStatistics(req)

      if (result) {
        return {
          statusCode: 200,
          result: result,
        }
      } else {
        return {
          statusCode: 204,
          message: 'no content',
        }
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }
  async getPeriodRequestStatistics(req: Request): Promise<ResponseType> {
    try {
      const result = await this.iAdminRepository.getPeriodRequestStatistics(req)

      if (result) {
        return {
          statusCode: 200,
          result: result,
        }
      } else {
        return {
          statusCode: 204,
          message: 'no content',
        }
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }

  async makeRefund(req: Request): Promise<ResponseType> {
    try {
      const { culpritId, beneficiaryId, lendId } = req.body
      let bookId

      const lendedTransaction =
        await this.iAdminRepository.getLendedSingleTransaction(lendId)
      const request = lendedTransaction?.requestId as IRequest
      bookId = request.book._id

      if (lendedTransaction?.hasMadeRefund) {
        return {
          statusCode: 400,
          message: 'This transaction has already made a refund',
        }
      }

      const user = await this.iAdminRepository.getPaymentId(beneficiaryId)
      const book = await this.iAdminRepository.getBook(bookId)

      if (book && user) {
        const price = book.price
        console.log(price, user?.paymentId)

        const response = await this.paymentService.createRefund(
          user?.paymentId,
          price,
          `Refund for the book ${book.ID}`,
          user?._id
        )
        if (response) {
          const email = user.email
          const subject = `Refund of rs${price} for book ${book.bookName} is initiated`
          await this.sendEmail.sendEmail({
            email,
            subject,
            code: `BookID: ${book.ID}`,
          })
          const reduce = await this.iAdminRepository.reduceCautionDeposit(
            culpritId,
            Number(price),
            `Deducted for dispute for book ${book.bookName}`,
            lendId
          )

          if (reduce) {
            return {
              statusCode: 200,
              message: 'Refund has initiated success fully',
            }
          }
        }
      }

      return {
        statusCode: 204,
      }
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }
}

export default AdminUseCase
