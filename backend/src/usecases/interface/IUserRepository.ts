import Post from '../../entity/postEntity'
import User from '../../entity/userEntity'
import { Request } from 'express'
import { IComment, IPost, IReply } from '../../framework/databases/postModel'
import {
  IBookShelf,
  IBorrowed,
  ILended,
  IShelf,
} from '../../entity/bookShelfEntity'
import { ILendscrore } from '../../entity/badgeEntity'
import IChat from '../../entity/chatEntity'
import IMessage from '../../entity/messageEntity'
import IStory, { IStories } from '../../entity/storyEntity'
import { INotification } from '../../entity/notificationEntity'

interface IUserRepository {
  findByEmail(email: string): Promise<User | null>
  findUserById(id: string): Promise<User | null>
  findByEmailAndUserId(id: string, email: string): Promise<User | null>
  checkUsernameValid(username: string): Promise<User | null>
  createUser(user: User): Promise<{} | null>
  googleSignup(user: {
    email: string
    userName: string
    name: string
    profileUrl: string
  }): Promise<User | null>
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
  likePost(req: Request): Promise<{} | null>
  unlikePost(req: Request): Promise<boolean>
  updateUserDetails(req: Request, cloudRes: {}): Promise<boolean | null>
  getPostDetails(req: Request): Promise<Post | null>
  addComment(req: Request): Promise<IComment | null>
  addReply(req: Request): Promise<IReply | null>
  getF(req: Request): Promise<User | null>
  postReport(
    req: Request,
    images: [{ secure_url: string; publicId: string }] | []
  ): Promise<boolean | null>
  getBookshelf(userId: string): Promise<IBookShelf | null>
  getOneBook(bookId: string, userId: string): Promise<IShelf | null>
  editBook(req: Request): Promise<boolean>
  removeBook(req: Request): Promise<boolean>
  checkIsSubscribed(userId: string): Promise<boolean | null>
  makeUserSubscribed(
    userId: string,
    paymentId: string
  ): Promise<{ badge: string; lendScore: ILendscrore } | null>
  getChat(senderId: string, userId: string): Promise<IChat | null>
  getAllChat(req: Request): Promise<{ chats: IChat[]; messageMap: {} } | null>
  createMessage(
    req: Request
  ): Promise<{ message: IMessage; isNewChat: boolean } | null>
  getAllMessages(
    chatId: string,
    pageNo: string
  ): Promise<{ messages: IMessage[]; hasMore: boolean; messageMap: {} } | null>
  createNotification(
    userId: string,
    message: string,
    type: string,
    actionBy: string,
    contentId: string
  ): Promise<INotification | null>

  makeMsgRead(messageId: string): Promise<boolean>
  makeRequest(req: Request): Promise<
    | { status: boolean; message: string }
    | {
        status: boolean
        book: IShelf | null
        requestedUser: {
          userName: string
          profileUrl: string
          requestId: string
          chatId: string
        }
      }
  >
  declineRequest(req: Request): Promise<IMessage | null>
  addStory(
    userId: string,
    imageUrls: { secure_url: string; public_id: string }
  ): Promise<{} | null>
  removeStory(userId: string, id: string): Promise<boolean>
  getStories(
    req: Request
  ): Promise<{ stories: IStory[]; hasMore: boolean } | null>
  makeStoryViewed(storyId: string, userId: string): Promise<boolean>
  makeRequestExpirey(requestId: string): Promise<boolean>
  acceptRequest(
    req: Request
  ): Promise<{ message: IMessage | string; status: boolean }>
  getLendedBooks(
    userId: string,
    pageNo: number
  ): Promise<{ hasMore: boolean; lended: ILended[] } | null>
  getBorrowedBooks(
    userId: string,
    pageNo: number
  ): Promise<{ hasMore: boolean; borrowed: IBorrowed[] } | null>
  updateRemainingDays(
    borrowId: string,
    lendedId: string
  ): Promise<{ status: string; message: IMessage | string }>
  getNotifications(
    userId: string,
    pageNo: number,
    unRead: boolean
  ): Promise<{ hasMore: boolean; notifications: INotification[] } | null>
  giveBookBack(req: Request): Promise<IMessage | null>
  collectBook(req: Request): Promise<IMessage | null>
  searchUsers(
    query: string,
    pageNo: number,
    user: string
  ): Promise<{ users: User[]; hasMore: boolean } | null>
  exploreBooks(
    userId: string
  ): Promise<{ books: IShelf[]; hasMore: boolean } | null>
  checkOldPassword(password: string, userId: string): Promise<User | null>
  changePassWord(password: string, email: string): Promise<User | null>
  getDeposit(req: Request): Promise<{
    cautionDeposit: number
    recentDeduction: [{ amount: number; note: string; date: string }] | []
  }>
  updateCautionDeposit(userId: string, amount: number): Promise<boolean>
}

export default IUserRepository
