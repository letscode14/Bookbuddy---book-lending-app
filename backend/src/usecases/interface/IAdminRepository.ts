import Admin from "../../entity/adminEntity";
import { Request } from "express";
import User from "../../entity/userEntity";

interface IAdminRepository {
  findByEmail(email: string): Promise<Admin | null>;
  loginAdmin(password: string, hash: string): Promise<boolean>;
  fetchUsers(
    req: Request
  ): Promise<{ users: User[]; totalPages: number } | null>;
  blockUser(req: Request): Promise<boolean>;
}

export default IAdminRepository;
