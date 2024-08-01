import express from 'express'
import User from '../../entity/userEntity'
import AdminRepository from '../repository/adminReposito0ry'
import AdminController from '../../controller/adminController'
import AdminUseCase from '../../usecases/adminUseCases'
import JwtTokenService from '../services/JwtToken'
import { authMiddleware } from '../middleware/authMiddleware'
import { adminAuthMiddleware } from '../middleware/adminAuth'
import { fileParser } from '../middleware/formidable'
import Cloudinary from '../services/Cloudinary'
import SendEmail from '../services/SendEmail'
import PaymentService from '../services/PaymentService'

const adminRouter = express.Router()

const jwtToken = new JwtTokenService()
const repository = new AdminRepository()
const cloudinary = new Cloudinary()
const sendEmail = new SendEmail()
const paymentService = new PaymentService()
const adminUseCase = new AdminUseCase(
  repository,
  jwtToken,
  cloudinary,
  sendEmail,
  paymentService
)

const controller = new AdminController(adminUseCase)

//login admin
adminRouter.post('/login', (req, res, next) => {
  controller.loginAdmin(req, res, next)
})

adminRouter.get('/logout', (req, res, next) => {
  controller.logoutAdmin(req, res, next)
})

adminRouter.get('/user/list', adminAuthMiddleware, (req, res, next) => {
  controller.getAllusers(req, res, next)
})

adminRouter.patch('/user/block', adminAuthMiddleware, (req, res, next) => {
  controller.blockUser(req, res, next)
})

adminRouter.get('/post', adminAuthMiddleware, (req, res, next) => {
  controller.getAllPost(req, res, next)
})

adminRouter.get('/post/reports', adminAuthMiddleware, (req, res, next) => {
  controller.getPostReports(req, res, next)
})

adminRouter.patch('/remove/report', adminAuthMiddleware, (req, res, next) => {
  controller.removeReport(req, res, next)
})

//badge
adminRouter.post(
  '/create-badge',
  adminAuthMiddleware,
  fileParser,

  (req, res, next) => {
    controller.addBadge(req, res, next)
  }
)
adminRouter.get('/single-badge', (req, res, next) => {
  controller.getSingleBadge(req, res, next)
})
adminRouter.patch('/edit-badge', adminAuthMiddleware, (req, res, next) => {
  controller.editBadge(req, res, next)
})
//

adminRouter.get('/badge', adminAuthMiddleware, (req, res, next) => {
  controller.getBadge(req, res, next)
})

adminRouter.get('/get/lended', (req, res, next) => {
  controller.getLendedTransactions(req, res, next)
})

adminRouter.get('/get/borrowed', (req, res, next) => {
  controller.getBorrowedTransactions(req, res, next)
})

//userpage functionaliity
adminRouter.get('/get/single-user', (req, res, next) => {
  controller.getSingleUser(req, res, next)
})

adminRouter.get('/get/user/reported-post', (req, res, next) => {
  controller.getReportedPost(req, res, next)
})

adminRouter.get('/get/user/account/reports', (req, res, next) => {})

adminRouter.get('/get/user/transactions/reports', (req, res, next) => {})

//dashboards

/* user statistics */
adminRouter.get('/get/user/statistics', (req, res, next) => {
  controller.getUserStatistics(req, res, next)
})

adminRouter.get('/get/user/period/statistics', (req, res, next) => {
  controller.getPeriodUserStatistics(req, res, next)
})

adminRouter.get('/get/top/lendscore/users', (req, res, next) => {
  controller.getHighLendScoreUser(req, res, next)
})

adminRouter.get('/get/post/statistics', (req, res, next) => {
  controller.getPostStatistics(req, res, next)
})

adminRouter.get('/get/post/period/statistics', (req, res, next) => {
  controller.getPeriodPostStatistics(req, res, next)
})

adminRouter.get('/get/post/boosted/post', (req, res, next) => {
  controller.getHighBoostedPost(req, res, next)
})

adminRouter.get('/get/post', adminAuthMiddleware, (req, res, next) => {
  controller.getPost(req, res, next)
})

adminRouter.patch('/remove/post', adminAuthMiddleware, (req, res, next) => {
  controller.removePost(req, res, next)
})

//transaction statistics
adminRouter.get('/transaction/statistics', (req, res, next) => {
  controller.getTransactionStatistics(req, res, next)
})

adminRouter.get('/period/transaction/statistics', (req, res, next) => {
  controller.getPeriodTransactionStatistics(req, res, next)
})

adminRouter.get('/period/request/statistics', (req, res, next) => {
  controller.getPeriodRequestStatistics(req, res, next)
})

adminRouter.post('/make-refund', (req, res, next) => {
  controller.makeRefund(req, res, next)
})
export default adminRouter
