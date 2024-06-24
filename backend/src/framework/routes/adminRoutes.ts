import express from "express";
import User from "../../entity/userEntity";
import AdminRepository from "../repository/adminReposito0ry";
import AdminController from "../../controller/adminController";
import AdminUseCase from "../../usecases/adminUseCases";
import JwtTokenService from "../services/JwtToken";
import { authMiddleware } from "../middleware/authMiddleware";
import { adminAuthMiddleware } from "../middleware/adminAuth";

const adminRouter = express.Router();

const jwtToken = new JwtTokenService();
const repository = new AdminRepository();
const adminUseCase = new AdminUseCase(repository, jwtToken);

const controller = new AdminController(adminUseCase);

//login admin
adminRouter.post("/login", (req, res, next) => {
  controller.loginAdmin(req, res, next);
});

adminRouter.get("/logout", (req, res, next) => {
  controller.logoutAdmin(req, res, next);
});

adminRouter.get("/user/list", adminAuthMiddleware, (req, res, next) => {
  controller.getAllusers(req, res, next);
});

adminRouter.patch("/user/block", adminAuthMiddleware, (req, res, next) => {
  controller.blockUser(req, res, next);
});

export default adminRouter;
