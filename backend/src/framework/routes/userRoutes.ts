import express from "express";
import UserController from "../../controller/userController";
import UserUseCase from "../../usecases/userUsecase";
import UserRepository from "../repository/userRepository";
import SendEmail from "../services/SendEmail";
import JwtTokenService from "../services/JwtToken";
import { authMiddleware } from "../middleware/authMiddleware";
import Cloudinary from "../services/Cloudinary";
import { fileParser } from "../middleware/formidable";

const userRouter = express.Router();
const repository = new UserRepository();
const sendEmail = new SendEmail();
const JwtToken = new JwtTokenService();
const cloudinary = new Cloudinary();
const userUseCase = new UserUseCase(
  repository,
  sendEmail,
  JwtToken,
  cloudinary
);

const controller = new UserController(userUseCase);

userRouter.post("/registration", (req, res, next) => {
  controller.registerUser(req, res, next);
});

//route to check if the username is valid or not
userRouter.post("/check/user/name", (req, res, next) => {
  controller.checkUsername(req, res, next);
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

//test Route

userRouter.get("/protected", authMiddleware, (req, res, next) => {
  controller.protected(req, res, next);
});

userRouter.post("/logout", authMiddleware, (req, res, next) => {
  controller.logoutUser(req, res, next);
});

userRouter.post("/login-otp", (req, res, next) => {
  controller.loginWithOtp(req, res, next);
});

userRouter.post("/otp/login", (req, res, next) => {
  controller.submitLoginOtp(req, res, next);
});

//create post route
userRouter.post("/create/post/:id", fileParser, (req, res, next) => {
  controller.createPost(req, res, next);
});

userRouter.get("/post/:id", authMiddleware, (req, res, next) => {
  controller.getPost(req, res, next);
});

//get user

userRouter.get("/profile/:id", authMiddleware, (req, res, next) => {
  controller.getUser(req, res, next);
});
export default userRouter;
