import IUserRepository from "../../usecases/interface/IUserRepository";
import User from "../../entity/userEntity";
import userModel from "../databases/userModel";
import bcrypt from "bcryptjs";

class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return await userModel.findOne({ email }).select("+password");
  }

  async createUser(user: User): Promise<User | null | unknown> {
    try {
      const { name, userName, password, email } = user;

      const savedUser = await userModel.create({
        name,
        email,
        password,
        userName,
      });
      if (savedUser) {
        const { email, _id } = savedUser;
        return { email, _id };
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async googleSignup(user: User): Promise<User | null> {
    try {
      const { name, userName, email, profileUrl } = user;
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);

      const savedUser = await userModel.create({
        name,
        userName,
        email,
        profileUrl,
        password: generatedPassword,
      });

      return savedUser.toObject() as User;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async loginUser(hashPass: string, password: string): Promise<boolean> {
    return bcrypt.compare(password, hashPass);
  }
}

export default UserRepository;
