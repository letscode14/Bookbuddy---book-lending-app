import { Request, Response, NextFunction, response } from "express";
import UserUseCase from "../usecases/userUsecase";

class UserController {
  private userCase: UserUseCase;

  constructor(userCase: UserUseCase) {
    this.userCase = userCase;
  }

  async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userData = req.body;
      const user = await this.userCase.registrationUser(userData);
      if (user.activationToken) {
        res.cookie("activationToken", user.activationToken, {
          httpOnly: true,
          secure: true,
        });
      }
      return res.status(user?.statusCode).json({ user });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async activateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { otp } = req.body;
      const token = req.cookies.activationToken;
      const user = await this.userCase.activateUser(token, otp);
      let message;
      if (user?.message) {
        message = user.message;
      }

      res.status(user?.statusCode).json({ message, ...user });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.activationToken as string;

      const user = await this.userCase.resendOtp(token);
      if (user.activationToken) {
        res.cookie("activationToken", user.activationToken, {
          httpOnly: true,
          secure: true,
        });
      }
      res.status(user?.statusCode).json({ message: user.message });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async googleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.body;
      console.log(user);

      const result = await this.userCase.googleAuth(user);
      if (result.authToken) {
        res.cookie("authToken", result.authToken, { httpOnly: true });
      }

      res
        .status(result.statusCode)
        .json({ message: result.message, ...result });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.body;
      const result = await this.userCase.loginUser(user);

      console.log(result);
    } catch (error) {
      console.log(error);
    }
  }
}

export default UserController;
