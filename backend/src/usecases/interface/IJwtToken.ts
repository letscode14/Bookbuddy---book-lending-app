import User from "../../entity/userEntity";

interface IJwtToken {
  SignInAccessToken(user: string): Promise<string>;
  SignInRefreshToken(user: string): Promise<string>;
  SignUpActivationToken(user: User, code: string): Promise<string>;
  verifyOtpToken(
    accessToken: string,
    otp: string
  ): Promise<
    { user: User; code: string } | { status: boolean; message: string }
  >;
  
}

export default IJwtToken;
