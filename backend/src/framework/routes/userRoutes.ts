import express from "express";
import UserController from "../../controller/userController";
import UserUseCase from "../../usecases/userUsecase";
import UserRepository from "../repository/userRepository";
import SendEmail from "../services/SendEmail";
import JwtTokenService from "../services/JwtToken";

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

export default userRouter;
