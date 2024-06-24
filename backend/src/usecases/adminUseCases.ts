import IJwtToken from "./interface/IJwtToken";
import JwtTokenService from "../framework/services/JwtToken";
import IAdminRepository from "./interface/IAdminRepository";
import Admin from "../entity/adminEntity";
import { Request } from "express";
interface ResponseType {
  _id?: string;
  result?: Admin | {};
  status?: boolean;
  statusCode: number;
  message?: string;
  refreshToken?: string;
  accessToken?: string;
  totalPage?: number;
}
class AdminUseCase {
  private iAdminRepository: IAdminRepository;
  private JwtToken: JwtTokenService;
  constructor(iAdminRepository: IAdminRepository, JwtToken: JwtTokenService) {
    this.JwtToken = JwtToken;
    this.iAdminRepository = iAdminRepository;
  }

  async loginAdmin(email: string, password: string): Promise<ResponseType> {
    try {
      const emailExists = (await this.iAdminRepository.findByEmail(
        email
      )) as Admin;

      if (!emailExists) {
        return {
          statusCode: 401,
          message: "Admin Not Found",
        };
      }

      const hash = emailExists.password;

      const pass = await this.iAdminRepository.loginAdmin(password, hash);
      if (!pass) {
        return {
          statusCode: 401,
          message: "Invalid Credentials",
        };
      }
      const accessToken = await this.JwtToken.SignInAccessToken({
        id: emailExists._id as string,
        role: emailExists.role as string,
      });

      const refreshToken = await this.JwtToken.SignInRefreshToken({
        id: emailExists._id as string,
        role: emailExists.role as string,
      });

      return {
        statusCode: 200,
        accessToken,
        refreshToken,
        message: "Admin logged Successfully",
        _id: emailExists._id,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: "Internal server error",
      };
    }
  }

  async getAllUsers(req: Request): Promise<ResponseType> {
    try {
      const result = await this.iAdminRepository.fetchUsers(req);

      if (result) {
        return {
          statusCode: 200,
          result: result.users,
          totalPage: result.totalPages,
        };
      }

      return {
        statusCode: 204,
        message: "NOt users ",
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: "internal server error",
      };
    }
  }

  async blockUser(req: Request): Promise<ResponseType> {
    try {
      const { action } = req.body;

      const result = await this.iAdminRepository.blockUser(req);
      if (result) {
        return {
          statusCode: 200,
          message:
            action == "Block"
              ? "User Blocked successfully"
              : "User Unblocked successfully",
        };
      }

      return {
        statusCode: 409,
        message: "unkown conflict",
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: "Internal Server error",
      };
    }
  }
}

export default AdminUseCase;
