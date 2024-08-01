import User from '../entity/userEntity'
import { Response, Request, response } from 'express'
import IUserRepository from './interface/IUserRepository'
import SendEmail from '../framework/services/SendEmail'
import JwtTokenService from '../framework/services/JwtToken'
import Cloudinary from '../framework/services/Cloudinary'
import PaymentService from '../framework/services/PaymentService'
import { redis } from '../framework/config/redis'

interface ResponseType {
  _id?: string
  result?: User | {}
  status?: boolean
  statusCode: number
  message?: string
  activationToken?: string
  accessToken?: string
  refreshToken?: string
  authToken?: string
}

class UserUseCase {
  private iUserRepository: IUserRepository
  private sendEmail: SendEmail
  private JwtToken: JwtTokenService
  private Cloudinary: Cloudinary
  private Payments: PaymentService

  constructor(
    iuserRepository: IUserRepository,
    sendEmail: SendEmail,
    jwtToken: JwtTokenService,
    cloudinary: Cloudinary,
    PaymentService: PaymentService
  ) {
    this.iUserRepository = iuserRepository
    this.sendEmail = sendEmail
    this.JwtToken = jwtToken
    this.Cloudinary = cloudinary
    this.Payments = PaymentService
  }

  async registrationUser(user: User): Promise<ResponseType> {
    try {
      const email = user.email
      const isEmailExists = await this.iUserRepository.findByEmail(email)

      if (isEmailExists) {
        return {
          status: false,
          message: 'Account already exists',
          statusCode: 409,
        }
      }

      const subject = 'Please provide this code for your registration'
      const code = Math.floor(100000 + Math.random() * 9000).toString()
      const sendEmail = await this.sendEmail.sendEmail({
        email,
        subject,
        code,
      })
      const token = await this.JwtToken.SignUpActivationToken(user, code)
      if (sendEmail) {
        return {
          status: true,
          statusCode: 200,
          message: 'Otp has send to your email ',
          activationToken: token,
        }
      }

      return {
        status: true,
        statusCode: 200,
      }
    } catch (error) {
      console.log(error)
      return {
        status: false,
        statusCode: 500,
        message: 'Internal server Error',
      }
    }
  }

  async checkUsername(username: string): Promise<ResponseType> {
    try {
      const isValid = await this.iUserRepository.checkUsernameValid(username)
      if (isValid) {
        return {
          statusCode: 422,
          message: 'Username is not valid',
        }
      }

      return {
        statusCode: 200,
        message: 'Username is valid',
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server Error',
      }
    }
  }
  async activateUser(token: string, otp: string): Promise<ResponseType> {
    try {
      const data = await this.JwtToken.verifyOtpToken(token, otp)
      if ('user' in data) {
        const result = (await this.iUserRepository.createUser(data.user)) as {
          email: string
          _id: string
          role: string
        }

        if (!result) {
          return {
            statusCode: 500,
            message: 'error in creating the user',
          }
        } else {
          const { _id, role } = result
          const accessToken = await this.JwtToken.SignInAccessToken({
            id: _id,
            role: role,
          })
          const refreshToken = await this.JwtToken.SignInRefreshToken({
            id: _id,
            role: role,
          })

          return {
            statusCode: 200,
            message: 'User registered SuccessFully',
            ...result,
            accessToken,
            refreshToken,
          }
        }
      } else {
        return {
          statusCode: 401,
          ...data,
        }
      }
    } catch (error) {
      console.log(error)
      return {
        status: false,
        statusCode: 500,
        message: 'Internal server Error',
      }
    }
  }
  async resendOtp(token: string): Promise<ResponseType> {
    try {
      const otp = 'resend'
      const result = await this.JwtToken.verifyOtpToken(token, otp)

      if ('user' in result) {
        const code = Math.floor(100000 + Math.random() * 9000).toString()
        const email = result.user.email
        const subject = 'Please provide the new code for the registration'

        const sendEmail = await this.sendEmail.sendEmail({
          email,
          subject,
          code,
        })
        const user = result.user

        const token = await this.JwtToken.SignUpActivationToken(user, code)
        if (sendEmail) {
          return {
            statusCode: 200,
            message: 'Otp has resend to the email',
            activationToken: token,
          }
        }
      }
      return {
        statusCode: 401,
        ...result,
      }
    } catch (error) {
      return {
        status: false,
        statusCode: 500,
        message: 'Internal server Error',
      }
    }
  }

  async googleAuth(user: {
    email: string
    userName: string
    name: string
    profileUrl: string
  }): Promise<ResponseType> {
    try {
      const email = user.email

      const emailExists = await this.iUserRepository.findByEmail(email)

      if (emailExists) {
        if (emailExists.isBlocked) {
          return {
            statusCode: 401,
            status: false,
            message: 'User Blocked contect admin',
          }
        }
        redis.set(`user:${emailExists._id}`, JSON.stringify(emailExists))

        const accessToken = await this.JwtToken.SignInAccessToken({
          id: emailExists._id as string,
          role: emailExists.role as string,
        })
        const refreshToken = await this.JwtToken.SignInRefreshToken({
          id: emailExists._id as string,
          role: emailExists.role as string,
        })

        const {
          _id,
          email,
          userName,
          isSubscribed,
          privacy,
          name,
          isGoogleSignUp,
          profile,
        } = emailExists as User
        return {
          statusCode: 200,
          message: 'User logged In',
          result: {
            _id,
            email,
            userName,
            isSubscribed,
            privacy,
            name,
            isGoogleSignUp,
            profile,
          },
          accessToken,
          refreshToken,
        }
      } else {
        const savedUser = (await this.iUserRepository.googleSignup(
          user
        )) as User
        redis.set(`user:${savedUser._id}`, JSON.stringify(savedUser))

        if (!savedUser) {
          return {
            statusCode: 500,
            status: false,
            message: 'Error in creating user',
          }
        }
        const {
          _id,
          email,
          userName,
          isSubscribed,
          privacy,
          name,
          isGoogleSignUp,
        } = savedUser
        const token = await this.JwtToken.SignInAccessToken({
          id: savedUser._id as string,
          role: savedUser.role as string,
        })
        const refreshToken = await this.JwtToken.SignInRefreshToken({
          id: savedUser._id as string,
          role: savedUser.role as string,
        })
        return {
          statusCode: 201,
          status: true,
          message: 'User registered Successfully',
          accessToken: token,
          refreshToken,
          result: {
            _id,
            email,
            userName,
            isSubscribed,
            privacy,
            name,
            isGoogleSignUp,
          },
        }
      }
    } catch (error) {
      console.log(error)
      return {
        status: false,
        statusCode: 500,
        message: 'Internal server Error',
      }
    }
  }
  async loginUser(user: User): Promise<ResponseType> {
    try {
      const { password, email } = user
      const emailExists = await this.iUserRepository.findByEmail(user.email)
      if (emailExists) {
        if (emailExists.isBlocked) {
          return {
            statusCode: 401,
            status: false,
            message: 'User Blocked contect admin',
          }
        }
        const isValid = await this.iUserRepository.loginUser(
          emailExists.password,
          password
        )
        if (isValid) {
          redis.set(`user:${emailExists._id}`, JSON.stringify(emailExists))
          const accessToken = await this.JwtToken.SignInAccessToken({
            id: emailExists._id,
            role: emailExists.role,
          })

          const refreshToken = await this.JwtToken.SignInRefreshToken({
            id: emailExists._id,
            role: emailExists.role,
          })
          return {
            statusCode: 200,
            accessToken,
            refreshToken,
            message: 'User logged success fully',
            _id: emailExists._id,
          }
        } else {
          return {
            statusCode: 401,
            message: 'Invalid Credentials',
          }
        }
      }
      return {
        statusCode: 401,
        message: 'User dont exist',
      }
    } catch (error) {
      console.log(error)

      return {
        statusCode: 500,
        status: false,
        message: 'Internal server error',
      }
    }
  }

  async loginWithOtp(user: User): Promise<ResponseType> {
    try {
      const email = user.email
      const emailExists = await this.iUserRepository.findByEmail(user.email)

      if (!emailExists) {
        return {
          statusCode: 401,
          message: 'Email provided is not registered',
        }
      }
      if (emailExists.isBlocked) {
        return {
          statusCode: 401,
          message: 'User Blocked contect admin',
        }
      }

      const subject = 'Please provide this code for your Login'
      const code = Math.floor(100000 + Math.random() * 9000).toString()
      const sendEmail = await this.sendEmail.sendEmail({
        email,
        subject,
        code,
      })

      const token = await this.JwtToken.SignUpActivationToken(user, code)
      if (!sendEmail) {
        return {
          statusCode: 500,
          message: 'Internal Server error',
        }
      }
      return {
        statusCode: 200,
        accessToken: token,
        message: 'Otp Has sent to the email',
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal Server error',
      }
    }
  }

  async submitOtp(token: string, code: string): Promise<ResponseType> {
    try {
      const data = await this.JwtToken.verifyOtpToken(token, code)

      if ('user' in data) {
        const email = data.user.email
        const emailExists = (await this.iUserRepository.findByEmail(
          email
        )) as User
        if (emailExists) {
          redis.set(`user:${emailExists._id}`, JSON.stringify(emailExists))

          const refreshToken = await this.JwtToken.SignInRefreshToken({
            id: emailExists._id as string,
            role: emailExists.role as string,
          })

          const accessToken = await this.JwtToken.SignInAccessToken({
            id: emailExists._id as string,
            role: emailExists.role as string,
          })

          return {
            statusCode: 200,
            accessToken,
            refreshToken,
            _id: emailExists._id,
          }
        }
      }
      return {
        statusCode: 401,
        ...data,
      }
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }

  //create post
  async createPost(req: Request): Promise<ResponseType> {
    try {
      const { files } = req
      const { description } = req.body
      const { id } = req.params
      const file = files.images

      const cloudRes = await this.Cloudinary.cloudinaryUpload(file)

      if (Array.isArray(cloudRes)) {
        const imageUrlArray = cloudRes.map((document) => ({
          publicId: document.public_id,
          secure_url: document.secure_url,
        }))

        const post = await this.iUserRepository.addPost(
          id,
          description,
          imageUrlArray as [{ secure_url: string; publicId: string }],
          req
        )

        if (post) {
          return {
            statusCode: 201,
            message: 'Post added sucessfully',
          }
        }
        return {
          statusCode: 409,
          message: 'unexpected error occured',
        }
      } else {
        const imageUrlArray = [
          {
            publicId: cloudRes.public_id,
            secure_url: cloudRes.secure_url,
          },
        ]
        const post = await this.iUserRepository.addPost(
          id,
          description,
          imageUrlArray as [{ secure_url: string; publicId: string }],
          req
        )
        if (post) {
          return {
            statusCode: 201,
            message: 'Post added sucessfully',
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

  async getPost(userId: string): Promise<ResponseType> {
    try {
      const data = await this.iUserRepository.getPost(userId)
      if (data) {
        return {
          statusCode: 200,
          result: data,
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
  async getUser(userId: string, req: Request): Promise<ResponseType> {
    try {
      const user = await this.iUserRepository.getUser(userId, req)
      if (user) {
        return {
          statusCode: 200,
          result: user,
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
        message: 'Internak server error',
      }
    }
  }

  async suggestUsers(req: Request): Promise<ResponseType> {
    try {
      const user = await this.iUserRepository.getSuggestion(req)
      if (user) {
        return {
          statusCode: 200,
          result: user,
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
        message: 'Internak server error',
      }
    }
  }

  async followUser(req: Request): Promise<ResponseType> {
    try {
      const result = await this.iUserRepository.followUser(req)
      if (result) {
        return {
          statusCode: 200,
          message: 'Follower User success fully',
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
        message: 'Internal sever error',
      }
    }
  }
  async unFollowUser(req: Request): Promise<ResponseType> {
    try {
      const result = await this.iUserRepository.unFollowUser(req)
      if (result) {
        return {
          statusCode: 200,
          message: 'unfollowed User success fully',
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
        message: 'Internal sever error',
      }
    }
  }
  async getPostData(req: Request, id: string): Promise<ResponseType> {
    try {
      const response = await this.iUserRepository.fetchPostData(req, id)

      if (response) {
        return {
          statusCode: 200,
          message: 'post fetched sucessfully',
          result: response,
        }
      } else {
        return {
          statusCode: 204,
        }
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'internal server error',
      }
    }
  }

  async likePost(req: Request): Promise<ResponseType> {
    try {
      const result = await this.iUserRepository.likePost(req)
      if (result) {
        return { statusCode: 200, message: 'Liked the post', result: result }
      }

      return {
        statusCode: 409,
        message: 'unexpected error occured',
      }
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Internal  sever error',
      }
    }
  }

  async UnLikePost(req: Request): Promise<ResponseType> {
    try {
      const result = await this.iUserRepository.unlikePost(req)
      if (result) {
        return { statusCode: 200, message: 'uniLiked the post' }
      }
      return {
        statusCode: 409,
        message: 'unexpected error occured',
      }
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Internal  sever error',
      }
    }
  }

  async verifyEditEmail(req: Request): Promise<ResponseType> {
    try {
      const { email } = req.body

      const emailExist = await this.iUserRepository.findByEmail(email)
      if (emailExist) {
        return {
          statusCode: 409,
          message: 'This email aready exixt please try another one',
        }
      }

      const subject = 'Please provide this code for your verification'
      const code = Math.floor(100000 + Math.random() * 9000).toString()
      const sendEmail = await this.sendEmail.sendEmail({
        email,
        subject,
        code,
      })
      const token = await this.JwtToken.SignUpActivationToken(
        { email: email } as User,
        code
      )
      if (sendEmail) {
        return {
          status: true,
          statusCode: 200,
          message: 'Otp has send to your email ',
          activationToken: token,
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
        message: 'internal server error',
      }
    }
  }
  async verifyEmailEditOtp(token: string, otp: string): Promise<ResponseType> {
    try {
      const data = await this.JwtToken.verifyOtpToken(token, otp)
      if ('user' in data) {
        return {
          statusCode: 200,
          message: 'Email success fully verified',
        }
      }

      return {
        statusCode: 401,
        ...data,
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'internal server error',
      }
    }
  }
  async editUserDetails(req: Request): Promise<ResponseType> {
    try {
      const { files } = req
      const file = files.newProfile
      if (file) {
        const cloudRes = await this.Cloudinary.cloudinaryUpload(file)

        const result = await this.iUserRepository.updateUserDetails(
          req,
          cloudRes
        )
        if (result) {
          return {
            statusCode: 200,
            message: 'User details updated successfully',
          }
        }
        return {
          statusCode: 409,
          message: 'unexpected error occured',
        }
      } else {
        const result = await this.iUserRepository.updateUserDetails(req, {})
        if (result) {
          return {
            statusCode: 200,
            message: 'User details updated successfully',
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
  async getPostDetails(req: Request): Promise<ResponseType> {
    try {
      const post = await this.iUserRepository.getPostDetails(req)

      if (post) {
        return {
          statusCode: 200,
          result: post,
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

  async addComment(req: Request): Promise<ResponseType> {
    try {
      const comment = await this.iUserRepository.addComment(req)

      if (comment) {
        return {
          statusCode: 200,
          message: 'added the comment',
          result: comment,
        }
      } else {
        return {
          statusCode: 409,
          message: 'unexpected error occured',
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

  async addReply(req: Request): Promise<ResponseType> {
    try {
      const result = await this.iUserRepository.addReply(req)
      if (result) {
        return {
          statusCode: 200,
          result: result,
          message: 'comment added',
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

  async getF(req: Request): Promise<ResponseType> {
    try {
      const result = await this.iUserRepository.getF(req)
      if (result) {
        return {
          statusCode: 200,
          result: result,
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

  async postReport(req: Request): Promise<ResponseType> {
    try {
      const file = req.files['images[]']

      if (file !== undefined) {
        const cloudRes = await this.Cloudinary.cloudinaryUpload(file)
        if (Array.isArray(cloudRes)) {
          const imageUrlArray = cloudRes.map((document) => ({
            publicId: document.public_id,
            secure_url: document.secure_url,
          }))
          const response = await this.iUserRepository.postReport(
            req,
            imageUrlArray as [{ secure_url: string; publicId: string }]
          )
          if (response) {
            return {
              statusCode: 200,
              message: 'Reported successfully',
            }
          } else {
            return {
              statusCode: 409,
              message:
                'You have already reported on this wait until it get resolved',
            }
          }
        } else {
          const imageUrlArray = [
            {
              publicId: cloudRes.public_id,
              secure_url: cloudRes.secure_url,
            },
          ]
          const response = await this.iUserRepository.postReport(
            req,
            imageUrlArray as [{ secure_url: string; publicId: string }]
          )
          if (response) {
            return {
              statusCode: 200,
              message: 'Reported successfully',
            }
          } else {
            return {
              statusCode: 409,
              message:
                'You have already reported on this wait until it get resolved',
            }
          }
        }
      } else {
        const response = await this.iUserRepository.postReport(req, [])
        if (response) {
          return {
            statusCode: 200,
            message: 'Reported successfully',
          }
        } else {
          return {
            statusCode: 409,
            message:
              'You have already reported on this wait until it get resolved',
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
  async getBookshelf(userId: string): Promise<ResponseType> {
    try {
      const data = await this.iUserRepository.getBookshelf(userId)
      if (data) {
        return {
          statusCode: 200,
          result: data,
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

  async viewBook(bookId: string, userId: string): Promise<ResponseType> {
    try {
      const book = await this.iUserRepository.getOneBook(bookId, userId)

      if (book) {
        return {
          statusCode: 200,
          result: book,
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

  async editBook(req: Request): Promise<ResponseType> {
    try {
      const response = await this.iUserRepository.editBook(req)
      if (response) {
        return {
          statusCode: 200,
          message: 'Bookshelf edited successfully',
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

  async removeBook(req: Request): Promise<ResponseType> {
    try {
      const response = await this.iUserRepository.removeBook(req)
      if (response) {
        return {
          statusCode: 200,
          message: 'Removed success fully',
        }
      } else {
        return {
          statusCode: 409,
          message: 'unexpected error occured',
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

  async getRequestBook(req: Request): Promise<ResponseType> {
    try {
      const { userId, bookId, ownerId } = req.query

      const isSubscribed = await this.iUserRepository.checkIsSubscribed(
        userId as string
      )
      if (!isSubscribed) {
        return {
          statusCode: 403,
          message: 'Not subscribed',
        }
      }

      const result = await this.iUserRepository.makeRequest(req)
      if (!result.status) {
        return {
          statusCode: 400,
          result: result,
        }
      } else {
        return {
          statusCode: 200,
          result: result,
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

  async createOrder(amount: number, id: string): Promise<ResponseType> {
    try {
      const user = await this.iUserRepository.findUserById(id)

      if (user) {
        const result = await this.Payments.createOrder(amount, user)
        if (result) {
          return {
            statusCode: 200,
            result: result,
          }
        }
      } else {
        return {
          statusCode: 404,
          message: 'user creddentials not found',
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

  async verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string,
    userId: string
  ): Promise<ResponseType> {
    try {
      const isSuccess = await this.Payments.verifyPaymentSignature(
        orderId,
        paymentId,
        signature
      )

      if (isSuccess) {
        const result = (await this.iUserRepository.makeUserSubscribed(
          userId,
          paymentId
        )) as {}
        return {
          statusCode: 200,
          message: 'payment sucess',
          result: result,
        }
      } else {
        return {
          statusCode: 400,
          message: 'paymenr failed',
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
  async getChat(req: Request): Promise<ResponseType> {
    try {
      const { senderId, userId } = req.params
      if (senderId && userId) {
        const result = await this.iUserRepository.getChat(senderId, userId)
        if (result) {
          return {
            statusCode: 200,
            result: result,
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

  async getAllChat(req: Request): Promise<ResponseType> {
    try {
      const result = await this.iUserRepository.getAllChat(req)
      if (result) {
        return {
          statusCode: 200,
          result: result,
        }
      } else {
        return {
          statusCode: 204,
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
  async sendMessage(req: Request): Promise<ResponseType> {
    try {
      const result = await this.iUserRepository.createMessage(req)
      if (result) {
        return {
          statusCode: 200,
          result: result,
        }
      } else {
        return {
          statusCode: 204,
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

  async getAllMessages(chatId: string, pageNo: string): Promise<ResponseType> {
    try {
      const result = await this.iUserRepository.getAllMessages(chatId, pageNo)
      if (result) {
        return {
          statusCode: 200,
          result: result,
        }
      } else {
        return {
          statusCode: 204,
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

  async makeMsgRead(messageId: string): Promise<ResponseType> {
    try {
      const result = await this.iUserRepository.makeMsgRead(messageId)
      if (result) {
        return {
          statusCode: 200,
        }
      }
      return {
        statusCode: 204,
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }

  async declineRequest(req: Request): Promise<ResponseType> {
    try {
      const response = await this.iUserRepository.declineRequest(req)
      if (response) {
        return {
          statusCode: 200,
          result: response,
        }
      } else {
        return {
          statusCode: 204,
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

  async addStory(req: Request): Promise<ResponseType> {
    try {
      const { files } = req
      const file = files.images
      const { userId } = req.params
      const cloudRes = (await this.Cloudinary.cloudinaryUpload(file)) as {
        public_id: string
        secure_url: string
      }
      if (cloudRes) {
        const imageUrl = {
          public_id: cloudRes?.public_id,
          secure_url: cloudRes?.secure_url,
        }
        const response = await this.iUserRepository.addStory(userId, imageUrl)
        if (response) {
          return {
            statusCode: 201,
            result: response,
          }
        } else {
        }
      }
      return {
        statusCode: 204,
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }

  async getStories(req: Request): Promise<ResponseType> {
    try {
      const response = await this.iUserRepository.getStories(req)
      if (response) {
        return {
          statusCode: 200,
          result: response,
        }
      }

      return {
        statusCode: 204,
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }

  async makeStoryViewed(req: Request): Promise<ResponseType> {
    try {
      const storyId = req.body.storyId as string
      const userId = req.body.userId as string

      const result = await this.iUserRepository.makeStoryViewed(storyId, userId)
      if (result) {
        return { statusCode: 200 }
      }

      return {
        statusCode: 204,
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }

  async acceptRequest(req: Request): Promise<ResponseType> {
    try {
      const result = await this.iUserRepository.acceptRequest(req)
      if (result.status == true) {
        return {
          statusCode: 200,
          result: result,
        }
      } else {
        return {
          message: result.message.toString(),
          statusCode: 404,
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

  async getLendedBooks(userId: string, pageNo: number): Promise<ResponseType> {
    try {
      const result = await this.iUserRepository.getLendedBooks(userId, pageNo)
      if (result) {
        return {
          statusCode: 200,
          result: result,
        }
      }
      return {
        statusCode: 204,
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }
  async getBorrowedBooks(
    userId: string,
    pageNo: number
  ): Promise<ResponseType> {
    try {
      const result = await this.iUserRepository.getBorrowedBooks(userId, pageNo)
      if (result) {
        return {
          statusCode: 200,
          result: result,
        }
      }
      return {
        statusCode: 204,
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }
  async getNotifications(
    userId: string,
    pageNo: number,
    unRead: boolean
  ): Promise<ResponseType> {
    try {
      const result = await this.iUserRepository.getNotifications(
        userId,
        pageNo,
        unRead
      )
      if (result) {
        return {
          statusCode: 200,
          result: result,
        }
      }
      return {
        statusCode: 204,
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }

  async giveBackBook(req: Request): Promise<ResponseType> {
    try {
      const result = await this.iUserRepository.giveBookBack(req)
      if (result) {
        return {
          statusCode: 200,
          result: result,
        }
      }
      return {
        statusCode: 204,
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }

  async collectBook(req: Request): Promise<ResponseType> {
    try {
      const result = await this.iUserRepository.collectBook(req)
      if (result) {
        return {
          statusCode: 200,
          result: result,
        }
      } else {
        return {
          statusCode: 204,
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

  //change password before login

  async verifyChangePassEmail(email: string): Promise<ResponseType> {
    try {
      const emailExists = await this.iUserRepository.findByEmail(email)

      if (!emailExists) {
        return {
          statusCode: 401,
          message: 'Email does not exist',
        }
      }
      if (emailExists?.isGoogleSignUp) {
        return {
          statusCode: 401,
          message: "Google signup user, you cant't do this action",
        }
      }
      const subject = 'Please provide this code for your verification'
      const code = Math.floor(100000 + Math.random() * 9000).toString()
      const sendEmail = await this.sendEmail.sendEmail({
        email,
        subject,
        code,
      })
      const user = emailExists._id ? emailExists._id : ''
      const token = await this.JwtToken.signChangePassTokenOtp(
        user,
        code,
        email
      )

      if (sendEmail && token) {
        return {
          status: true,
          statusCode: 200,
          message: 'Otp has send to your email ',
          activationToken: token,
        }
      }

      return {
        statusCode: 409,
        message: 'Un expected error occured',
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }

  async resendChangePassOtpBeforeLogin(token: string): Promise<ResponseType> {
    try {
      if (token == 'undefined') {
        return {
          statusCode: 401,
          message: 'Token is expired',
        }
      }

      const otp = 'resend'
      const result = await this.JwtToken.verifyOtpToken(token, otp)

      if ('user' in result) {
        const code = Math.floor(100000 + Math.random() * 9000).toString()
        console.log(result)

        const email = result.email

        const subject = 'Please provide the new code for the registration'

        const sendEmail = await this.sendEmail.sendEmail({
          email,
          subject,
          code,
        })

        const token = await this.JwtToken.signChangePassTokenOtp(
          '',
          code,
          email
        )
        if (sendEmail && token) {
          return {
            statusCode: 200,
            message: 'Otp has resend to the email',
            activationToken: token,
          }
        }
      }
      return {
        statusCode: 401,
        ...result,
      }
    } catch (error) {
      return {
        status: false,
        statusCode: 500,
        message: 'Internal server Error',
      }
    }
  }
  async submitOtpBeforeLogin(
    token: string,
    code: string
  ): Promise<ResponseType> {
    try {
      const data = await this.JwtToken.verifyOtpToken(token, code)

      if ('user' in data) {
        const email = data.email

        const token = await this.JwtToken.signChangePassToken(email)
        if (token) {
          return { statusCode: 200, result: token, activationToken: token }
        }
      }
      return {
        statusCode: 401,
        ...data,
      }
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }

  async submitNewPasswordBeforeLogin(
    password: string,
    token: string
  ): Promise<ResponseType> {
    try {
      const isValid = await this.validatePassword(password)

      if (isValid !== true) {
        return {
          statusCode: 401,
          message: isValid as string,
        }
      }
      if (!token) {
        return {
          statusCode: 401,
          message: 'Token is missing',
        }
      }
      const user = await this.JwtToken.verifyChangePassToken(token)

      if ('user' in user) {
        const result = await this.iUserRepository.changePassWord(
          password,
          user.user
        )
        if (result) {
          return {
            statusCode: 200,
            message: 'password changed successfully',
          }
        }
      } else {
        return {
          statusCode: 401,
          message: user.message,
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
  //

  async searchUsers(
    pageNo: number,
    query: string,
    user: string
  ): Promise<ResponseType> {
    try {
      const response = await this.iUserRepository.searchUsers(
        query,
        pageNo,
        user
      )
      if (response) {
        return {
          statusCode: 200,
          result: response,
        }
      } else {
        return {
          statusCode: 204,
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
  async exploreBooks(userId: string): Promise<ResponseType> {
    try {
      const result = await this.iUserRepository.exploreBooks(userId)
      if (result) {
        return {
          statusCode: 200,
          result: result,
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

  async otpChangePassAfterLogin(
    userId: string,
    email: string
  ): Promise<ResponseType> {
    try {
      const user = await this.iUserRepository.findByEmailAndUserId(
        userId,
        email
      )

      if (user?.isGoogleSignUp) {
        return {
          statusCode: 400,
          message: 'this is a google signuped account',
        }
      }
      if (user) {
        const subject = 'Please provide this code for your change password'
        const code = Math.floor(100000 + Math.random() * 9000).toString()
        const sendEmail = await this.sendEmail.sendEmail({
          email,
          subject,
          code,
        })

        const token = await this.JwtToken.signChangePassTokenOtp(
          userId,
          code,
          user.email
        )

        if (token && sendEmail) {
          return {
            statusCode: 200,
            result: token,
            activationToken: token,
          }
        }
      }

      return {
        statusCode: 400,
        message: 'Cant generate otp',
      }
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }

  async otpResendPassAfterLogin(
    token: string,
    userId: string
  ): Promise<ResponseType> {
    try {
      const otp = 'resend'
      const result = await this.JwtToken.verifyOtpToken(token, otp)

      if ('user' in result) {
        const code = Math.floor(100000 + Math.random() * 9000).toString()

        const email = result.email

        const subject = 'Please provide the new code for the registration'

        const sendEmail = await this.sendEmail.sendEmail({
          email,
          subject,
          code,
        })

        const token = await this.JwtToken.signChangePassTokenOtp(
          userId,
          code,
          email
        )

        if (sendEmail && token) {
          return {
            statusCode: 200,
            message: 'Otp has resend to the email',
            activationToken: token,
          }
        }
      }
      return {
        statusCode: 401,
        ...result,
      }
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }

  async submitChangePassOtpAfterLogin(
    otpToken: string,
    otp: string
  ): Promise<ResponseType> {
    try {
      const result = await this.JwtToken.verifyOtpToken(otpToken, otp)
      if ('user' in result) {
        const email = result.email
        const user = result.user

        const token = await this.JwtToken.signChangePassToken(email)
        if (token) {
          return { statusCode: 200, result: token, activationToken: token }
        }
      } else {
        return {
          statusCode: 400,
          result: result,
        }
      }
      return {
        statusCode: 409,
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }

  async validatePassword(password: string): Promise<string | boolean> {
    const hasCapitalLetter = /[A-Z]/.test(password)
    const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasAlphabet = /[a-zA-Z]/.test(password)

    if (!hasCapitalLetter) {
      return 'Uppercase is missing'
    }
    if (!hasSpecialCharacter) {
      return 'Special charecter is missing [$%^&]'
    }
    if (!hasNumber) {
      return 'Number is missing'
    }

    if (!hasAlphabet) {
      return 'Alphabets is missing'
    }

    if (password.length < 8) {
      return 'Password must hav 8 character'
    }
    return true
  }

  async checkOldPassword(
    userId: string,
    password: string
  ): Promise<ResponseType> {
    console.log(password)

    try {
      const isValid = await this.validatePassword(password)
      if (isValid !== true) {
        return {
          statusCode: 400,
          message: isValid as string,
        }
      }
      const result = await this.iUserRepository.checkOldPassword(
        password,
        userId
      )

      if (result) {
        const email = result.email
        if (result.isGoogleSignUp) {
          return {
            statusCode: 400,
            message: 'You can do this action',
          }
        }

        const token = await this.JwtToken.signChangePassToken(email)
        if (token) {
          return { statusCode: 200, result: token, activationToken: token }
        }
      } else {
        return {
          statusCode: 400,
          message: 'Password does not match',
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

  async submitNewPassword(
    token: string,
    password: string
  ): Promise<ResponseType> {
    try {
      if (!token) {
        return {
          statusCode: 400,
          message: 'Token is missing',
        }
      }
      const user = await this.JwtToken.verifyChangePassToken(token)

      if ('user' in user) {
        const result = await this.iUserRepository.changePassWord(
          password,
          user.user
        )
        if (result) {
          return {
            statusCode: 200,
            message: 'password changed successfully',
          }
        }
      } else {
        return {
          statusCode: 400,
          message: user.message,
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

  async getDeposit(req: Request): Promise<ResponseType> {
    try {
      const user = await this.iUserRepository.getDeposit(req)
      if (user) {
        return {
          statusCode: 200,
          result: user,
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

  async addOrderFunds(userId: string, email: string): Promise<ResponseType> {
    try {
      const user = await this.iUserRepository.findByEmailAndUserId(
        userId,
        email
      )
      if (!user?.isSubscribed) {
        return {
          statusCode: 400,
          message: 'user is not subscribed',
        }
      }
      const amount = 1000 - Number(user.cautionDeposit)

      if (user) {
        const result = await this.Payments.createAddFundsOrder(amount, user)
        if (result) {
          return {
            statusCode: 200,
            result: { ...result, amount },
          }
        }
      } else {
        return {
          statusCode: 400,
          message: 'User credentials not found',
        }
      }
      return {
        statusCode: 409,
        message: 'usnexpected error occured',
      }
    } catch (error) {
      console.log(error)
      console.log(error)
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }
  async verifyaddFundsPayment(
    orderId: string,
    paymentId: string,
    signature: string,
    userId: string,
    amount: number
  ): Promise<ResponseType> {
    try {
      const isSuccess = await this.Payments.verifyPaymentSignature(
        orderId,
        paymentId,
        signature
      )
      if (isSuccess) {
        const user = await this.iUserRepository.updateCautionDeposit(
          userId,
          amount
        )
        if (user) {
          return {
            statusCode: 200,
            message: 'user caution deposit updated',
          }
        } else {
          return {
            statusCode: 400,
          }
        }
      } else {
        return {
          statusCode: 400,
          message: 'Payment is unsuccess',
        }
      }
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Internal server error',
      }
    }
  }
}

export default UserUseCase
