import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "../routes/userRoutes";
import adminRouter from "../routes/adminRoutes";
const createServer = () => {
  try {
    const app: express.Application = express();

    //Cors middleware

    app.use(cors({ origin: process.env.ORIGIN, credentials: true }));
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    //Routes

    app.use("/user", userRouter);
    app.use("/admin", adminRouter);

    return app;
  } catch (error) {
    console.log(error);
  }
};

export default createServer;
