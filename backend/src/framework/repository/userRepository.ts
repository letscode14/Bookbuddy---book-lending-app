import IUserRepository from "../../usecases/interface/IUserRepository";
import User from "../../entity/userEntity";
import Post from "../../entity/postEntity";
import userModel from "../databases/userModel";
import bcrypt from "bcryptjs";
import postModel from "../databases/postModel";
import { ObjectId } from "mongodb";

class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return await userModel.findOne({ email }).select("+password");
  }
  async checkUsernameValid(username: string): Promise<User | null> {
    return await userModel.findOne({ userName: username });
  }

  async createUser(
    user: User
  ): Promise<{ email: string; _id: unknown; role: string } | null> {
    try {
      const { name, userName, password, email } = user;

      const savedUser = await userModel.create({
        name,
        email,
        password,
        userName,
      });
      if (savedUser) {
        const { email, _id, role } = savedUser;
        return { email, _id, role };
      }
      return null;
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
        isGoogleSignUp: true,
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

  async addPost(
    id: string,
    description: string,
    images: []
  ): Promise<Post | unknown> {
    try {
      const savedPost = await postModel.create({
        userId: new ObjectId(id),
        description,
        imageUrls: images,
      });
      if (savedPost) {
        return savedPost;
      }

      return null;
    } catch (error) {
      console.log(error);
    }
  }
  async getPost(id: string): Promise<[] | null> {
    try {
      const post = (await postModel.find({ userId: new ObjectId(id) })) as [];
      if (post) return post;
      else return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async getUser(id: string): Promise<{} | null> {
    try {
      const user = await userModel.findById(id).select("-password");
      if (user) {
        return user;
      }
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

export default UserRepository;
