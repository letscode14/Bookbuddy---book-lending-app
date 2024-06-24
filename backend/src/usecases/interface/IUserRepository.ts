import Post from "../../entity/postEntity";
import User from "../../entity/userEntity";

interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  checkUsernameValid(username: string): Promise<User | null>;
  createUser(user: User): Promise<User | null | unknown>;
  googleSignup(user: User): Promise<User | null>;
  loginUser(hashPass: string, password: string): Promise<boolean>;

  addPost(id: string, description: string, images: []): Promise<Post | unknown>;
  getPost(id: string): Promise<[] | null>;
  getUser(id: string): Promise<{} | null>;

 
}

export default IUserRepository;
