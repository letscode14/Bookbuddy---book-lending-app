import { NextFunction, Request, Response } from "express";
import jwt, { Secret, TokenExpiredError } from "jsonwebtoken";

interface DecodedToken {
  user: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const bearerToken = authHeader && authHeader.split(" ")[1];

  if (!bearerToken) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(
      bearerToken,
      process.env.ACCESS_TOKEN_SECRET as Secret
    ) as DecodedToken;

    const { user } = decoded;
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ message: "AccessToken Expired" });
    }
  }
};
