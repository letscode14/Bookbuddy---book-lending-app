import Post from "../../entity/postEntity";
import User from "../../entity/userEntity";
import { Request } from "express";
import { IComment, IPost } from "../../framework/databases/postModel";

interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  checkUsernameValid(username: string): Promise<User | null>;
  createUser(user: User): Promise<User | null | unknown>;
  googleSignup(user: User): Promise<User | null>;
  loginUser(hashPass: string, password: string): Promise<boolean>;

  addPost(id: string, description: string, images: []): Promise<Post | unknown>;
  getPost(id: string): Promise<[] | null>;
  getUser(id: string): Promise<{} | null>;

  getSuggestion(req: Request): Promise<User[] | null>;
  followUser(req: Request): Promise<boolean>;
  unFollowUser(req: Request): Promise<boolean>;
  fetchPostData(id: string): Promise<[] | null>;
  likePost(req: Request): Promise<boolean>;
  unlikePost(req: Request): Promise<boolean>;
  updateUserDetails(req: Request, cloudRes: {}): Promise<boolean | null>;
  getPostDetails(req: Request): Promise<Post | null>;
  addComment(req: Request): Promise<IComment | null>;
}

export default IUserRepository;
