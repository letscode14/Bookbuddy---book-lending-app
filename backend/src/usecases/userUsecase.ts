import User from "../entity/userEntity";
import { Response, Request } from "express";
import IUserRepository from "./interface/IUserRepository";
import SendEmail from "../framework/services/SendEmail";
import JwtTokenService from "../framework/services/JwtToken";

interface ResponseType {
  _id?: string;
  result?: User | {};
  status?: boolean;
  statusCode: number;
  message?: string;
  activationToken?: string;
  accessToken?: string;
  refreshToken?: string;
}

class UserUseCase {
  private iUserRepository: IUserRepository;
  private sendEmail: SendEmail;
  private JwtToken: JwtTokenService;

  constructor(
    iuserRepository: IUserRepository,
    sendEmail: SendEmail,
    jwtToken: JwtTokenService
  ) {
    this.iUserRepository = iuserRepository;
    this.sendEmail = sendEmail;
    this.JwtToken = jwtToken;
  }

  async registrationUser(user: User): Promise<ResponseType> {
    try {
      const email = user.email;
      const isEmailExists = await this.iUserRepository.findByEmail(email);

      if (isEmailExists) {
        return {
          status: false,
          message: "User already exists",
          statusCode: 409,
        };
      }

      const subject = "Please provide this code for your registration";
      const code = Math.floor(100000 + Math.random() * 9000).toString();
      const sendEmail = await this.sendEmail.sendEmail({
        email,
        subject,
        code,
      });
      const token = await this.JwtToken.SignUpActivationToken(user, code);
      if (sendEmail) {
        return {
          status: true,
          statusCode: 200,
          message: "Otp has send to your email ",
          activationToken: token,
        };
      }

      return {
        status: true,
        statusCode: 200,
      };
    } catch (error) {
      console.log(error);
      return {
        status: false,
        statusCode: 500,
        message: "Internal server Error",
      };
    }
  }
  async activateUser(token: string, otp: string): Promise<ResponseType> {
    try {
      const data = await this.JwtToken.verifyOtpToken(token, otp);
      if ("user" in data) {
        const result = await this.iUserRepository.createUser(data.user);

        if (!result) {
          return {
            statusCode: 500,
            message: "error in creating the user",
          };
        } else {
          return {
            statusCode: 200,
            message: "User registered SuccessFully",
            ...result,
          };
        }
      } else {
        return {
          statusCode: 401,
          ...data,
        };
      }
    } catch (error) {
      console.log(error);
      return {
        status: false,
        statusCode: 500,
        message: "Internal server Error",
      };
    }
  }
  async resendOtp(token: string): Promise<ResponseType> {
    try {
      const otp = "resend";
      const result = await this.JwtToken.verifyOtpToken(token, otp);

      if ("user" in result) {
        const code = Math.floor(100000 + Math.random() * 9000).toString();
        const email = result.user.email;
        const subject = "Please provide the new code for the registration";

        const sendEmail = await this.sendEmail.sendEmail({
          email,
          subject,
          code,
        });
        const user = result.user;
        console.log(user);

        const token = await this.JwtToken.SignUpActivationToken(user, code);
        if (sendEmail) {
          return {
            statusCode: 200,
            message: "Otp has resend to the email",
            activationToken: token,
          };
        }
      }
      return {
        statusCode: 401,
        ...result,
      };
    } catch (error) {
      return {
        status: false,
        statusCode: 500,
        message: "Internal server Error",
      };
    }
  }
}

export default UserUseCase;
