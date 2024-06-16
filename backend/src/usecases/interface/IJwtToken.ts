import User from "../../entity/userEntity";

interface IJwtToken {
  SignInJwt(user: User): Promise<String>;
  SignUpActivationToken(user: User, code: string): Promise<String>;
  verifyOtpToken(
    accessToken: string,
    otp: string
  ): Promise<
    { user: User; code: string } | { status: boolean; message: string }
  >;
}

export default IJwtToken;
