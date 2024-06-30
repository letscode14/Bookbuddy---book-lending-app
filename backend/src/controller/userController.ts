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
      console.log(user);

      if (user.activationToken) {
        res.cookie("activationToken", user.activationToken, {
          httpOnly: true,
          secure: true,
        });
      }
      return res.status(user?.statusCode).json({ ...user });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async checkUsername(req: Request, res: Response, next: NextFunction) {
    try {
      const { username } = req.body;
      const result = await this.userCase.checkUsername(username);
      res.status(result.statusCode).json({ ...result });
    } catch (error) {
      console.log(error);
      next();
    }
  }
  async activateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { otp } = req.body;

      const token = req.cookies.activationToken;
      const user = await this.userCase.activateUser(token, otp);
      res.cookie("refreshToken", user.refreshToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 10000,
      });
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
      console.log(user);

      res.status(user?.statusCode).json({ message: user.message, ...user });
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
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 10000,
      });
      res.status(result.statusCode).json({ ...result });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.body;
      const result = await this.userCase.loginUser(user);

      if (result.refreshToken) {
        res.cookie("refreshToken", result.refreshToken, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 10000,
        });
      }
      res.status(result.statusCode).json({ ...result });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async protected(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({ message: "" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async loginWithOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.body;
      console.log(user);

      const result = await this.userCase.loginWithOtp(user);
      res.cookie("activationToken", result.accessToken, {
        httpOnly: true,
        secure: true,
      });
      res.status(result.statusCode).json({ ...result });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async submitLoginOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, otp } = req.body;

      const result = await this.userCase.submitOtp(token, otp);
      if (result.statusCode == 200) {
        res.cookie("refreshToken", result.refreshToken, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 10000,
        });
      }
      res.status(result.statusCode).json({ ...result });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async logoutUser(req: Request, res: Response, next: NextFunction) {
    try {
      console.log("logout");

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.status(200).json({ message: "User LogOut success fully" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  //create post

  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userCase.createPost(req);
      res.status(result.statusCode).json({ ...result });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async getPost(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userCase.getPost(req.params.id);
      res.status(result.statusCode).json({ ...result });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userCase.getUser(req.params.id);
      res.status(user.statusCode).json({ ...user });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async getSuggestion(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userCase.suggestUsers(req);
      res.status(user.statusCode).json({ users: user.result });
    } catch (error) {
      console.log(error);
      next();
    }
  }

  async getPostContent(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (error) {
      console.log(error);
      next();
    }
  }

  async followUser(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.userCase.followUser(req);
      res.status(response.statusCode).json({ response });
    } catch (error) {
      console.log(error);
      next();
    }
  }
  async unFollowUser(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.userCase.unFollowUser(req);
      res.status(response.statusCode).json({ response });
    } catch (error) {
      console.log(error);
      next();
    }
  }

  async getPostData(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const response = await this.userCase.getPostData(id);
      res.status(response.statusCode).json({ ...response });
    } catch (error) {
      console.log(error);
    }
  }

  async likePost(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.userCase.likePost(req);
      res.status(response.statusCode).json({ ...response });
    } catch (error) {
      console.log(error);
    }
  }

  async UnLikePost(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.userCase.UnLikePost(req);
      console.log(response);

      res.status(response.statusCode).json({ ...response });
    } catch (error) {
      console.log(error);
    }
  }

  async verifyEditEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userCase.verifyEditEmail(req);
      if (result.activationToken) {
        res.cookie("activationToken", result.activationToken, {
          httpOnly: true,
          secure: true,
        });
      }
      res.status(result.statusCode).json({ ...result });
    } catch (error) {
      console.log(error);
    }
  }

  async verifyEmailEditOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.activationToken;
      const result = await this.userCase.verifyEmailEditOtp(
        token,
        req.body.code
      );
      res.status(result.statusCode).json({ ...result });
    } catch (error) {
      console.log(error);
    }
  }

  async editUserDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userCase.editUserDetails(req);
      res.status(result.statusCode).json({ ...result });
    } catch (error) {
      console.log(error);
    }
  }

  async getPostDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userCase.getPostDetails(req);
      res.status(200).json({ ...result });
    } catch (error) {
      console.log(error);
    }
  }

  async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userCase.addComment(req);
      res.status(result.statusCode).json({ ...result });
    } catch (error) {
      console.log(error);
    }
  }
  async addReply(req: Request, res: Response, next: NextFunction) {
    try {
      const reponse = await this.userCase.addReply(req);
      res.status(response.statusCode).json({ ...reponse });
    } catch (error) {
      console.log(error);
    }
  }
}

export default UserController;
