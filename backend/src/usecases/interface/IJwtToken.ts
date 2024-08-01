import User from '../../entity/userEntity'

interface IJwtToken {
  SignInAccessToken(user: {}): Promise<string>
  SignInRefreshToken(user: {}): Promise<string>
  SignUpActivationToken(user: User, code: string): Promise<string>

  SignInAdminRefreshToken(admin: string): Promise<string>
  SignInAdminAccessToken(admin: string): Promise<string>
  signChangePassTokenOtp(
    userId: string,
    code: string,
    email: string
  ): Promise<string | null>
}

export default IJwtToken
