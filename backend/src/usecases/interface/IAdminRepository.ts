import Admin from "../../entity/adminEntity";
import { Request } from "express";
import User from "../../entity/userEntity";
import Post from "../../entity/postEntity";
import { IReport } from "../../framework/databases/reportsModel";

interface IAdminRepository {
  findByEmail(email: string): Promise<Admin | null>;
  loginAdmin(password: string, hash: string): Promise<boolean>;
  fetchUsers(
    req: Request
  ): Promise<{ users: User[]; totalPages: number } | null>;
  blockUser(req: Request): Promise<boolean>;
  getAllPost(req: Request): Promise<{ post: Post[]; totalPage: number } | null>;
  getPostReports(req: Request): Promise<IReport[] | null>;
  removeReport(Req: Request): Promise<boolean>;
}

export default IAdminRepository;
