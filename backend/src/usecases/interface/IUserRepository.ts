import { Document } from "mongoose";
import User from "../../entity/userEntity";

interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  createUser(user: User): Promise<User | null | unknown>;
}

export default IUserRepository;
