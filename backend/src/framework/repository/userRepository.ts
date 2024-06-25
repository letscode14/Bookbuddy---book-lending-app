import IUserRepository from "../../usecases/interface/IUserRepository";
import User from "../../entity/userEntity";
import Post from "../../entity/postEntity";
import userModel from "../databases/userModel";
import bcrypt from "bcryptjs";
import postModel from "../databases/postModel";
import { ObjectId } from "mongodb";
import { Request } from "express";

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

  async getSuggestion(req: Request): Promise<User[] | null> {
    try {
      const now = new Date();
      console.log(req.query.id);

      const startOfCurrentWeek = new Date(
        now.setDate(now.getDate() - now.getDay())
      );
      const id = req.query.id as string;
      const currentUser = (await userModel.findById(id)) as User;

      const currentWeekUsers = (await userModel
        .find({
          _id: { $ne: new ObjectId(id) },
          createdAt: { $gte: startOfCurrentWeek },
          "followers.userId": { $nin: [new ObjectId(id)] },
        })
        .select("-password") // Exclude password field
        .sort({ createdAt: -1 }) // Sort by createdAt descending
        .exec()) as User[];
      console.log(currentWeekUsers);

      if (currentWeekUsers) {
        return currentWeekUsers;
      }

      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async followUser(req: Request): Promise<boolean> {
    try {
      const { userId, target } = req.body;

      if (!userId || !target) {
        return false;
      }

      await userModel.findByIdAndUpdate(userId, {
        $addToSet: { following: { userId: new ObjectId(target) } },
      });

      await userModel.findByIdAndUpdate(target, {
        $addToSet: { followers: { userId: new ObjectId(userId) } },
      });

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async unFollowUser(req: Request): Promise<boolean> {
    const { userId, target } = req.body;
    if (!userId || !target) {
      return false;
    }

    console.log(req.body);

    try {
      await userModel.findByIdAndUpdate(userId, {
        $pull: { following: { userId: new ObjectId(target) } },
      });

      await userModel.findByIdAndUpdate(target, {
        $pull: { followers: { userId: new ObjectId(userId) } },
      });

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async fetchPostData(id: string): Promise<[] | null> {
    try {
      if (!id) {
        throw new Error("User ID is required");
      }
      const user = (await userModel
        .findById(id)
        .populate("followers.userId", "_id")
        .populate("following.userId", "_id")
        .exec()) as User;
      const followerIds = user.followers.map((follower) => follower.userId._id);
      const followingIds = user.following.map(
        (following) => following.userId._id
      );
      const userIds = [...new Set([...followerIds, ...followingIds, user._id])];
      const posts = await postModel
        .find({ userId: { $in: userIds } })
        .populate("userId", "userName email profileUrl")
        .sort({ createdAt: -1 })
        .exec();

      return posts.length > 0 ? (posts as []) : null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async likePost(req: Request): Promise<boolean> {
    try {
      const { postId, userId } = req.body;
      const result = await postModel.findByIdAndUpdate(
        postId,
        {
          $addToSet: { likes: userId },
        },
        { new: true }
      );
      if (result) {
        return true;
      }

      return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  async unlikePost(req: Request): Promise<boolean> {
    try {
      const { postId, userId } = req.body;
      console.log(req.body);

      const result = await postModel.findByIdAndUpdate(
        postId,
        {
          $pull: { likes: userId },
        },
        { new: true }
      );
      if (result) {
        return true;
      }
      return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

export default UserRepository;
