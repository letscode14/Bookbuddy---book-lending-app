import express from 'express'
import UserController from '../../controller/userController'
import UserUseCase from '../../usecases/userUsecase'
import UserRepository from '../repository/userRepository'
import SendEmail from '../services/SendEmail'
import JwtTokenService from '../services/JwtToken'
import { authMiddleware } from '../middleware/authMiddleware'
import Cloudinary from '../services/Cloudinary'
import { fileParser } from '../middleware/formidable'
import PaymentService from '../services/PaymentService'
import PaymentContoller from '../../controller/paymentController'
const cloudinary = new Cloudinary()

const userRouter = express.Router()
const repository = new UserRepository()
const sendEmail = new SendEmail()
const JwtToken = new JwtTokenService()
const paymentService = new PaymentService()
const userUseCase = new UserUseCase(
  repository,
  sendEmail,
  JwtToken,
  cloudinary,
  paymentService
)

const controller = new UserController(userUseCase)
const paymentController = new PaymentContoller(userUseCase)
userRouter.post('/registration', (req, res, next) => {
  controller.registerUser(req, res, next)
})

//route to check if the username is valid or not
userRouter.post('/check/user/name', (req, res, next) => {
  controller.checkUsername(req, res, next)
})

userRouter.post('/create-user', (req, res, next) => {
  controller.activateUser(req, res, next)
})

//resend otp
userRouter.get('/resendotp', (req, res, next) => {
  controller.resendOtp(req, res, next)
})

//googleAuth
userRouter.post('/google/auth', (req, res, next) => {
  controller.googleAuth(req, res, next)
})

//login user

userRouter.post('/login', (req, res, next) => {
  controller.loginUser(req, res, next)
})

//test Route

userRouter.get('/protected', authMiddleware, (req, res, next) => {
  controller.protected(req, res, next)
})

userRouter.post('/logout', authMiddleware, (req, res, next) => {
  controller.logoutUser(req, res, next)
})

userRouter.post('/login-otp', (req, res, next) => {
  controller.loginWithOtp(req, res, next)
})

userRouter.post('/otp/login', (req, res, next) => {
  controller.submitLoginOtp(req, res, next)
})

//create post route
userRouter.post(
  '/create/post/:id',
  authMiddleware,
  fileParser,
  (req, res, next) => {
    controller.createPost(req, res, next)
  }
)

userRouter.get('/post/:id', authMiddleware, (req, res, next) => {
  controller.getPost(req, res, next)
})

//get user

userRouter.get('/profile/:id', authMiddleware, (req, res, next) => {
  controller.getUser(req, res, next)
})

userRouter.get('/suggestions', authMiddleware, (req, res, next) => {
  controller.getSuggestion(req, res, next)
})

userRouter.get('/list/post/content', authMiddleware, (req, res, next) => {
  controller.getPostContent(req, res, next)
})

//follow usr
userRouter.post('/follow', authMiddleware, (req, res, next) => {
  controller.followUser(req, res, next)
})

//unfollow user
userRouter.post('/unfollow', authMiddleware, (req, res, next) => {
  controller.unFollowUser(req, res, next)
})

//list all the post
userRouter.get('/post/content/:id', authMiddleware, (req, res, next) => {
  controller.getPostData(req, res, next)
})

userRouter.patch('/post/like', authMiddleware, (req, res, next) => {
  controller.likePost(req, res, next)
})
userRouter.patch('/post/dislike', authMiddleware, (req, res, next) => {
  controller.UnLikePost(req, res, next)
})

userRouter.post('/edit/verify/email/:id', authMiddleware, (req, res, next) => {
  controller.verifyEditEmail(req, res, next)
})

userRouter.post(
  '/submit/verify/email/otp',
  authMiddleware,
  (req, res, next) => {
    controller.verifyEmailEditOtp(req, res, next)
  }
)
userRouter.post(
  '/edit/details',
  authMiddleware,
  fileParser,
  (req, res, next) => {
    controller.editUserDetails(req, res, next)
  }
)

userRouter.get('/get/post', authMiddleware, (req, res, next) => {
  controller.getPostDetails(req, res, next)
})

userRouter.patch('/add/comment', authMiddleware, (req, res, next) => {
  controller.addComment(req, res, next)
})

userRouter.patch('/add/reply', authMiddleware, (req, res, next) => {
  controller.addReply(req, res, next)
})

//fetch followers
userRouter.get('/friends/users', authMiddleware, (req, res, next) => {
  controller.getF(req, res, next)
})

userRouter.post('/report', authMiddleware, (req, res, next) => {
  controller.report(req, res, next)
})

userRouter.get('/bookshelf', authMiddleware, (req, res, next) => {
  controller.getBookshelf(req, res, next)
})

userRouter.get('/book', authMiddleware, (req, res, next) => {
  controller.viewBook(req, res, next)
})

userRouter.patch('/edit/bookshelf', authMiddleware, (req, res, next) => {
  controller.editBook(req, res, next)
})

userRouter.patch('/shelf/remove', authMiddleware, (req, res, next) => {
  controller.removeBook(req, res, next)
})

userRouter.get('/request-book', authMiddleware, (req, res, next) => {
  controller.getRequestBook(req, res, next)
})

userRouter.post('/pay-subscription', authMiddleware, (req, res, next) => {
  paymentController.createOrder(req, res, next)
})

userRouter.post('/payment-verification', authMiddleware, (req, res, next) => {
  paymentController.verifyPayment(req, res, next)
})

export default userRouter
