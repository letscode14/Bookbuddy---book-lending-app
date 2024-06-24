import { NextFunction, Request, Response } from "express";
import jwt, { Secret, TokenExpiredError } from "jsonwebtoken";
import JwtTokenService from "../services/JwtToken";

const jwtToken = new JwtTokenService();

interface DecodedToken {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user: {};
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const bearerToken = authHeader && authHeader.split(" ")[1];
  console.log(bearerToken);

  if (!bearerToken) {
    return res.status(401).json({ message: "Token missing" });
  }
  try {
    const decoded = jwt.verify(
      bearerToken,
      process.env.ACCESS_TOKEN_SECRET as Secret
    ) as DecodedToken;
    console.log("before expire", decoded);

    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
          return res
            .status(401)
            .json({ message: "Refresh Token not Available" });
        }
        const decoded = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET as Secret
        ) as DecodedToken;

        const user = {
          role: decoded.role,
          id: decoded.id,
        };

        const newAccessToken = await jwtToken.SignInAccessToken(user);
        req.user = decoded;

        return res.status(401).json({
          accessToken: newAccessToken,
          message: "AccessToken Expired",
        });
      } catch (error) {
        console.log(error);

        if (error instanceof TokenExpiredError) {
          return res.status(401).json({ message: "RefreshToken Expired" });
        }
      }
    }
  }
};
