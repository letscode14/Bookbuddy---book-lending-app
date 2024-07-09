import IJwtToken from './interface/IJwtToken'
import JwtTokenService from '../framework/services/JwtToken'
import IAdminRepository from './interface/IAdminRepository'
import Admin from '../entity/adminEntity'
import Cloudinary from '../framework/services/Cloudinary'
import { Request } from 'express'
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

  constructor(
    iAdminRepository: IAdminRepository,
    JwtToken: JwtTokenService,
    cloudinary: Cloudinary
  ) {
    this.JwtToken = JwtToken
    this.iAdminRepository = iAdminRepository
    this.Cloudinary = cloudinary
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
}

export default AdminUseCase
