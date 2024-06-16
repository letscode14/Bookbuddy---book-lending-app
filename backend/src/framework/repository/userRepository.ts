import IUserRepository from "../../usecases/interface/IUserRepository";
import User from "../../entity/userEntity";
import userModel from "../databases/userModel";

class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return await userModel.findOne({}).select("+password");
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
}

export default UserRepository;
