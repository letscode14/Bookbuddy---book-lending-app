import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import IJwtToken from "../../usecases/interface/IJwtToken";
import User from "../../entity/userEntity";

class JwtTokenService implements IJwtToken {
  async SignInJwt(user: User): Promise<String> {
    const token = jwt.sign(
      { user },
      process.env.ACCESS_TOKEN_SECRET as Secret,
      {
        expiresIn: "5m",
      }
    );
    return token;
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

      if (otp == "resend") {
        return payload;
      }

      if (payload.code == otp) {
        return payload;
      } else {
        return { status: false, message: "Otp Does not match" };
      }
    } catch (error) {
      console.log(error);
      return { status: false, message: "Token expired try to register" };
    }
  }
}

export default JwtTokenService;
