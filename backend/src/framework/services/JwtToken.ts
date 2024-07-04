import jwt, { JwtPayload, Secret, TokenExpiredError } from "jsonwebtoken";
import IJwtToken from "../../usecases/interface/IJwtToken";
import User from "../../entity/userEntity";
import { Request } from "express";

interface Response {
  statusCode: number;
  message: string;
  id?: string | JwtPayload;
}
interface DecodedToken {
  user: string;
  iat: number;
  exp: number;
}

class JwtTokenService implements IJwtToken {
  async SignInAccessToken(user: {}): Promise<string> {
    try {
      const token = jwt.sign(
        { ...user },
        process.env.ACCESS_TOKEN_SECRET as Secret,
        {
          expiresIn: "5s",
        }
      );

      if (token) return token;
      return "";
    } catch (error) {
      console.log(error);

      return "";
    }
  }

  async SignInRefreshToken(user: {}): Promise<string> {
    const token = jwt.sign(
      { ...user },
      process.env.REFRESH_TOKEN_SECRET as Secret,
      {
        expiresIn: "30d",
      }
    );
    if (token) return token;
    return "";
  }

  async SignUpActivationToken(user: User, code: string): Promise<string> {
    const token = jwt.sign(
      { user, code },
      process.env.ACTIVATION_TOKEN_SECRET as Secret,
      {
        expiresIn: "2m",
      }
    );
    return token;
  }

  async verifyOtpToken(
    activationToken: string,
    otp: string
  ): Promise<
    { user: User; code: string } | { status: boolean; message: string }
  > {
    try {
      const payload = jwt.verify(
        activationToken,
        process.env.ACTIVATION_TOKEN_SECRET as Secret
      ) as { user: User; code: string };
      console.log("otp totken payload", payload);

      if (otp == "resend") {
        return payload;
      }

      if (payload.code == otp) {
        return payload;
      } else {
        return { status: false, message: "Otp Does not match" };
      }
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return { status: false, message: "Token expired try to register" };
      }
      return { status: false, message: "Jwt error" };
    }
  }
  async SignInAdminAccessToken(admin: string): Promise<string> {
    try {
      const token = jwt.sign(
        { admin },
        process.env.ADMIN_ACCESS_SECRET as Secret,
        {
          expiresIn: "30s",
        }
      );
      return token;
    } catch (error) {
      console.log(error);

      return "";
    }
  }
  async SignInAdminRefreshToken(admin: string): Promise<string> {
    try {
      const token = jwt.sign(
        { admin },
        process.env.ADMIN_REFRESH_SECRET as Secret,
        { expiresIn: "30d" }
      );
      return token;
    } catch (error) {
      console.log(error);

      return "";
    }
  }
}

export default JwtTokenService;
