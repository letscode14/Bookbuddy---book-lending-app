import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import userRouter from '../routes/userRoutes'
import adminRouter from '../routes/adminRoutes'
import session from 'express-session'
import { EventEmitter } from 'events'
const createServer = () => {
  try {
    const app: express.Application = express()

    const corsOptions = {
      origin: process.env.ORIGIN || '*',
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders:
        'Origin,X-Requested-With,Content-Type,Accept,Authorization',
      optionsSuccessStatus: 200,
    }

    // Apply CORS middleware
    app.use(cors(corsOptions))
    app.use(cookieParser())
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use(
      session({
        secret: 'your_secret_key',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
      })
    )

    //event emitters limit
    EventEmitter.defaultMaxListeners = 20
    //Routes

    app.use('/user', userRouter)
    app.use('/admin', adminRouter)
    //error middle ware
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      console.error(err.stack)
      res.status(500).send('Internal server error!')
    })

    return app
  } catch (error) {
    console.log(error)
  }
}

export default createServer
