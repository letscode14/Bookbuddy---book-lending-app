import jwt, { JwtPayload, Secret, TokenExpiredError } from 'jsonwebtoken'
import IJwtToken from '../../usecases/interface/IJwtToken'
import User from '../../entity/userEntity'
import { Request } from 'express'

interface Response {
  statusCode: number
  message: string
  id?: string | JwtPayload
}
interface DecodedToken {
  user: string
  iat: number
  exp: number
}

class JwtTokenService implements IJwtToken {
  async SignInAccessToken(user: {}): Promise<string> {
    try {
      const token = jwt.sign(
        { ...user },
        process.env.ACCESS_TOKEN_SECRET as Secret,
        {
          expiresIn: '30min',
        }
      )

      if (token) return token
      return ''
    } catch (error) {
      console.log(error)

      return ''
    }
  }

  async SignInRefreshToken(user: {}): Promise<string> {
    const token = jwt.sign(
      { ...user },
      process.env.REFRESH_TOKEN_SECRET as Secret,
      {
        expiresIn: '30d',
      }
    )
    if (token) return token
    return ''
  }

  async SignUpActivationToken(user: User, code: string): Promise<string> {
    const token = jwt.sign(
      { user, code },
      process.env.ACTIVATION_TOKEN_SECRET as Secret,
      {
        expiresIn: '2m',
      }
    )
    return token
  }

  async verifyOtpToken(
    activationToken: string,
    otp: string
  ): Promise<
    | { user: User; code: string; email: string }
    | { status: boolean; message: string }
  > {
    try {
      const payload = jwt.verify(
        activationToken,
        process.env.ACTIVATION_TOKEN_SECRET as Secret
      ) as { user: User; code: string; email: string }
      console.log('otp totken payload', payload)

      if (otp == 'resend') {
        return payload
      }

      if (payload.code == otp) {
        return payload
      } else {
        return { status: false, message: 'Otp Does not match' }
      }
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return { status: false, message: 'Token expired try to again' }
      }
      return { status: false, message: 'Jwt error' }
    }
  }
  async SignInAdminAccessToken(admin: string): Promise<string> {
    try {
      const token = jwt.sign(
        { admin },
        process.env.ADMIN_ACCESS_SECRET as Secret,
        {
          expiresIn: '30min',
        }
      )
      return token
    } catch (error) {
      console.log(error)

      return ''
    }
  }
  async SignInAdminRefreshToken(admin: string): Promise<string> {
    try {
      const token = jwt.sign(
        { admin },
        process.env.ADMIN_REFRESH_SECRET as Secret,
        { expiresIn: '30d' }
      )
      return token
    } catch (error) {
      console.log(error)

      return ''
    }
  }

  //token after login to generate new pass word

  async signChangePassTokenOtp(
    user: string,
    code: string,
    email: string
  ): Promise<string | null> {
    try {
      const token = jwt.sign(
        { user, code, email },
        process.env.ACTIVATION_TOKEN_SECRET as Secret,
        {
          expiresIn: '2m',
        }
      )
      if (token) return token
      else return null
    } catch (error) {
      console.log(error)
      return ''
    }
  }

  async signChangePassToken(user: string): Promise<string | null> {
    try {
      const token = jwt.sign(
        { user },
        process.env.ACTIVATION_TOKEN_SECRET as Secret,
        {
          expiresIn: '5m',
        }
      )
      if (token) return token
      else return null
    } catch (error) {
      console.log(error)
      return ''
    }
  }

  async verifyChangePassToken(
    activationToken: string
  ): Promise<JwtPayload | { status: boolean; message: string }> {
    try {
      const payload = jwt.verify(
        activationToken,
        process.env.ACTIVATION_TOKEN_SECRET as Secret
      ) as { user: User; code: string; email: string }

      if (payload) {
        return payload
      }
      return {
        status: false,
        message: 'unexpected error',
      }
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return { status: false, message: 'Token expired try to again' }
      }
      return { status: false, message: 'Jwt error' }
    }
  }
}

export default JwtTokenService
