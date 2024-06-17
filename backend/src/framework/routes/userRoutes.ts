import express from "express";
import UserController from "../../controller/userController";
import UserUseCase from "../../usecases/userUsecase";
import UserRepository from "../repository/userRepository";
import SendEmail from "../services/SendEmail";
import JwtTokenService from "../services/JwtToken";
import { authMiddleware } from "../middleware/authMiddleware";

const userRouter = express.Router();
const repository = new UserRepository();
const sendEmail = new SendEmail();
const JwtToken = new JwtTokenService();
const userUseCase = new UserUseCase(repository, sendEmail, JwtToken);

const controller = new UserController(userUseCase);

userRouter.post("/registration", (req, res, next) => {
  controller.registerUser(req, res, next);
});

userRouter.post("/create-user", (req, res, next) => {
  controller.activateUser(req, res, next);
});

//resend otp
userRouter.get("/resendotp", (req, res, next) => {
  controller.resendOtp(req, res, next);
});

//googleAuth
userRouter.post("/google/auth", (req, res, next) => {
  controller.googleAuth(req, res, next);
});

//login user

userRouter.post("/login", (req, res, next) => {
  controller.loginUser(req, res, next);
});

//refresh token

userRouter.post("/refresh-token", (req, res, next) => {
  controller.refreshToken(req, res, next);
});

//test Route

userRouter.get("/protected", authMiddleware, (req, res, next) => {
  controller.protected(req, res, next);
});

userRouter.post("/logout", authMiddleware, (req, res, next) => {
  controller.logoutUser(req, res, next);
});

export default userRouter;
