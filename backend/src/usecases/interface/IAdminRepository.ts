import Admin from '../../entity/adminEntity'
import { Request } from 'express'
import User from '../../entity/userEntity'
import Post from '../../entity/postEntity'
import { IReport } from '../../framework/databases/reportsModel'
import { IBadge } from '../../entity/badgeEntity'
import { IBorrowed, ILended, IShelf } from '../../entity/bookShelfEntity'
import { IUser } from '../../framework/databases/userModel'
import { IPost } from '../../framework/databases/postModel'

interface IAdminRepository {
  findByEmail(email: string): Promise<Admin | null>
  loginAdmin(password: string, hash: string): Promise<boolean>
  fetchUsers(
    req: Request
  ): Promise<{ users: User[]; totalPages: number } | null>
  blockUser(req: Request): Promise<boolean>
  getAllPost(req: Request): Promise<{ post: Post[]; totalPage: number } | null>
  getPostReports(
    req: Request
  ): Promise<{ reports: IReport[]; hasMore: boolean } | null>
  removeReport(Req: Request): Promise<boolean>
  findBadgeByName(badge: string): Promise<boolean>
  createBadge(
    req: Request,
    doc: { public_id: string; secure_url: string }
  ): Promise<boolean | IBadge>
  getSingleBadge(badgeId: string): Promise<IBadge | null>
  editBadge(req: Request): Promise<IBadge | null>
  getBadge(): Promise<null | IBadge[]>
  getLendedTransactions(req: Request): Promise<{
    hasMore: boolean
    lended: ILended[]
  } | null>
  getBorrowedTransactions(
    req: Request
  ): Promise<{ hasMore: boolean; borrowed: IBorrowed[] } | null>
  getSingleUser(req: Request): Promise<{
    user: User
    postLength: number
    books: number
  } | null>
  getReportedPost(
    req: Request
  ): Promise<{ post: Post[]; hasMore: boolean } | null>
  getUserStatistics(): Promise<{
    totalUsers: number
    blockedUsers: number
    verified: number
    newUsers: number
    reportedUser: number
  }>
  getPeriodUserStatistics(req: Request): Promise<{}>
  getHighLendscoreUser(
    req: Request
  ): Promise<{ users: User[]; hasMore: boolean } | null>
  getPostStatistics(): Promise<{
    totalPost: number
    removedPost: number
    reportedPost: number
    postAddedToBookshelf: number
  }>
  getPeriodPostStatistics(req: Request): Promise<{}>
  getHighBoostedPost(
    req: Request
  ): Promise<{ post: Post[]; hasMore: boolean } | null>
  getPost(postId: string): Promise<IPost | null>
  banPost(posId: string): Promise<IPost | null>
  getTransactionStatistics(): Promise<{
    totalTransactions: number
    completedTransactions: number
    reportedTransactions: number
  }>
  getPeriodTransactionStatistics(req: Request): Promise<{}>
  getPeriodRequestStatistics(req: Request): Promise<{}>
  getPaymentId(userId: string): Promise<User | null>
  getLendedSingleTransaction(lendId: string): Promise<ILended | null>
  getBook(bookId: string): Promise<IShelf | null>
  reduceCautionDeposit(
    userId: string,
    amount: number,
    note: string,
    lendId: string
  ): Promise<boolean>
}

export default IAdminRepository
