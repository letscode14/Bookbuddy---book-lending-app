import Post from '../../entity/postEntity'
import User from '../../entity/userEntity'
import { Request } from 'express'
import { IComment, IPost, IReply } from '../../framework/databases/postModel'
import { IBookShelf, IShelf } from '../../entity/bookShelfEntity'
import { ILendscrore } from '../../entity/badgeEntity'

interface IUserRepository {
  findByEmail(email: string): Promise<User | null>
  findUserById(id: string): Promise<User | null>
  checkUsernameValid(username: string): Promise<User | null>
  createUser(user: User): Promise<User | null | unknown>
  googleSignup(user: User): Promise<User | null>
  loginUser(hashPass: string, password: string): Promise<boolean>

  addPost(
    id: string,
    description: string,
    images: [{ secure_url: string; publicId: string }],
    req: Request
  ): Promise<Post | unknown>
  getPost(id: string): Promise<[] | null>
  getUser(id: string, req: Request): Promise<{} | null>

  getSuggestion(req: Request): Promise<User[] | null>
  followUser(req: Request): Promise<boolean>
  unFollowUser(req: Request): Promise<boolean>
  fetchPostData(
    req: Request,
    id: string
  ): Promise<{ post: []; hasMore: boolean } | null>
  likePost(req: Request): Promise<boolean>
  unlikePost(req: Request): Promise<boolean>
  updateUserDetails(req: Request, cloudRes: {}): Promise<boolean | null>
  getPostDetails(req: Request): Promise<Post | null>
  addComment(req: Request): Promise<IComment | null>
  addReply(req: Request): Promise<IReply | null>
  getF(req: Request): Promise<User | null>
  postReport(req: Request): Promise<boolean | null>
  getBookshelf(userId: string): Promise<IBookShelf | null>
  getOneBook(bookId: string, userId: string): Promise<IShelf | null>
  editBook(req: Request): Promise<boolean>
  removeBook(req: Request): Promise<boolean>
  checkIsSubscribed(userId: string): Promise<boolean | null>
  makeUserSubscribed(
    userId: string
  ): Promise<{ badge: string; lendScore: ILendscrore } | null>
}

export default IUserRepository
