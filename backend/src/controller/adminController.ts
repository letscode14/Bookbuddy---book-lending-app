import { Request, Response, NextFunction } from "express";
import AdminUseCase from "../usecases/adminUseCases";
class AdminController {
  private adminCase: AdminUseCase;

  constructor(adminCase: AdminUseCase) {
    this.adminCase = adminCase;
  }

  async loginAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body.adminDetails;

      const result = await this.adminCase.loginAdmin(email, password);
      if (result.accessToken) {
        res.cookie("adminAccessToken", result.accessToken, {
          maxAge: 10000,
        });
        res.cookie("adminRefreshToken", result.refreshToken, {
          maxAge: 30 * 24 * 60 * 60 * 10000,
          httpOnly: true,
        });
      }
      res.status(result.statusCode).json({ ...result });
    } catch (error) {
      console.log(error);
    }
  }

  async logoutAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("adminAccessToken");
      res.clearCookie("adminRefreshToken");
      res.status(200).json({ message: "Admin logged Out success Fully" });
    } catch (error) {
      console.log(error);
    }
  }

  async getAllusers(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.adminCase.getAllUsers(req);

      res
        .status(res.statusCode)
        .json({ user: user.result, totalPage: user.totalPage });
    } catch (error) {
      console.log(error);
    }
  }

  async blockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.adminCase.blockUser(req);
      res.status(result.statusCode).json({ ...result });
    } catch (error) {
      console.log(error);
    }
  }
}

export default AdminController;
