import IAdminRepository from "../../usecases/interface/IAdminRepository";
import adminModel from "../databases/adminModel";
import Admin from "../../entity/adminEntity";
import bcrypt from "bcryptjs";
import { Request } from "express";

import User from "../../entity/userEntity";
import userModel from "../databases/userModel";

class AdminRepository implements IAdminRepository {
  async findByEmail(email: string): Promise<Admin | null> {
    return adminModel.findOne({ email });
  }

  async loginAdmin(password: string, hash: string): Promise<boolean> {
    try {
      return bcrypt.compare(password, hash);
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async fetchUsers(
    req: Request
  ): Promise<{ users: User[]; totalPages: number } | null> {
    try {
      const { fetch, page } = req.query as { fetch: string; page: string };
      const limit = 2;
      const skip = (Number(page) - 1) * limit;
      let users;
      let totalCount;
      let totalPages;
      switch (fetch) {
        case "all":
          users = (await userModel
            .find()
            .select("-password")
            .limit(limit)
            .skip(skip)) as User[];
          totalCount = await userModel.countDocuments();
          totalPages = Math.floor(totalCount / limit);
          return { users, totalPages };
          break;
        case "Blocked":
          users = (await userModel
            .find({ isBlocked: true })
            .select("-password")
            .limit(limit)
            .skip(skip)) as User[];
          totalCount = await userModel.countDocuments({ isBlocked: true });
          totalPages = Math.floor(totalCount / limit);
          return { users, totalPages };
          break;
        case "Blocked":
          users = (await userModel
            .find({ isDeleted: true })
            .select("-password")
            .limit(limit)
            .skip(skip)) as User[];
          totalCount = await userModel.countDocuments({ isDeleted: true });
          totalPages = Math.ceil(totalCount / limit);
          return { users, totalPages };
          break;
      }
      return null;
    } catch (error) {
      console.log(error);
      return { users: [], totalPages: 0 };
    }
  }

  async blockUser(req: Request): Promise<boolean> {
    try {
      const { userId, action } = req.body;
      console.log(action);

      if (action === "Block") {
        const blocked = await userModel.findByIdAndUpdate(
          userId,
          { $set: { isBlocked: true } },
          { new: true }
        );
        return true;
      } else if (action === "Unblock") {
        console.log("hei");

        const unblocked = await userModel.findByIdAndUpdate(
          userId,
          { $set: { isBlocked: false } },
          { new: true }
        );
        return true;
      }
      return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

export default AdminRepository;
