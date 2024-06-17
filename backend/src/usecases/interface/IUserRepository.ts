import { Document } from "mongoose";
import User from "../../entity/userEntity";

interface ResponseType {
  _id?: string;
  result?: User | {};
  status?: boolean;
  statusCode: number;
  message?: string;
  activationToken?: string;
  accessToken?: string;
  refreshToken?: string;
  authToken?: string;
}
interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  createUser(user: User): Promise<User | null | unknown>;
  googleSignup(user: User): Promise<User | null>;
  loginUser(hashPass: string, password: string): Promise<boolean>;
}

export default IUserRepository;
