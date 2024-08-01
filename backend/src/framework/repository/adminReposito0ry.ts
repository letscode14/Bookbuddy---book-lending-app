import IAdminRepository from '../../usecases/interface/IAdminRepository'
import adminModel from '../databases/adminModel'
import Admin from '../../entity/adminEntity'
import bcrypt from 'bcryptjs'
import { NextFunction, Request } from 'express'
import { redis } from '../config/redis'
import User from '../../entity/userEntity'
import userModel, { IUser } from '../databases/userModel'

import Post from '../../entity/postEntity'
import postModel, { IPost } from '../databases/postModel'
import reportModel, { IReport } from '../databases/reportsModel'
import mongoose, { Mongoose, PipelineStage } from 'mongoose'
import { ObjectId } from 'mongodb'
import BadgeModel from '../databases/badgeModel'
import { IBadge } from '../../entity/badgeEntity'
import { IBorrowed, ILended, IShelf } from '../../entity/bookShelfEntity'
import BookshelfModel from '../databases/bookShelfModel'
import moment, { months } from 'moment'
import RequestModel from '../databases/requestModel'
import { request } from 'http'
import deductionModel from '../databases/deductionModel'
interface StageCount {
  stage: string
  count: number
}

interface StageCounts {
  requested: number
  expired: number
  approved: number
  'transaction complete': number
}

class AdminRepository implements IAdminRepository {
  async findByEmail(email: string): Promise<Admin | null> {
    return adminModel.findOne({ email })
  }

  async loginAdmin(password: string, hash: string): Promise<boolean> {
    try {
      return bcrypt.compare(password, hash)
    } catch (error) {
      console.log(error)
      return false
    }
  }

  async fetchUsers(
    req: Request
  ): Promise<{ users: User[]; totalPages: number } | null> {
    try {
      const { fetch, page } = req.query as { fetch: string; page: string }
      const limit = 2
      const skip = (Number(page) - 1) * limit
      let users
      let totalCount
      let totalPages
      switch (fetch) {
        case 'all':
          users = (await userModel
            .find()
            .select('-password')
            .populate('lendscore', 'lendScore')
            .limit(limit)
            .skip(skip)) as User[]
          totalCount = await userModel.countDocuments()
          totalPages = Math.ceil(totalCount / limit)

          return { users, totalPages }

          break
        case 'Blocked':
          users = (await userModel
            .find({ isBlocked: true })
            .select('-password')
            .populate('lendscore', 'lendScore')
            .limit(limit)
            .skip(skip)) as User[]
          totalCount = await userModel.countDocuments({ isBlocked: true })
          totalPages = Math.floor(totalCount / limit)
          return { users, totalPages }
          break
        case 'Blocked':
          users = (await userModel
            .find({ isDeleted: true })
            .select('-password')
            .populate('lendscore', 'lendScore')
            .limit(limit)
            .skip(skip)) as User[]
          totalCount = await userModel.countDocuments({ isDeleted: true })
          totalPages = Math.ceil(totalCount / limit)
          return { users, totalPages }
          break
      }
      return null
    } catch (error) {
      console.log(error)
      return { users: [], totalPages: 0 }
    }
  }

  async blockUser(req: Request): Promise<boolean> {
    try {
      const { userId, action } = req.body

      if (action === 'Block') {
        const blocked = await userModel.findByIdAndUpdate(
          userId,
          { $set: { isBlocked: true } },
          { new: true }
        )

        await this.updateRedisBlockedUsers()
        return true
      } else if (action === 'Unblock') {
        const unblocked = await userModel.findByIdAndUpdate(
          userId,
          { $set: { isBlocked: false } },
          { new: true }
        )
        await this.updateRedisBlockedUsers()

        return true
      }
      return false
    } catch (error) {
      console.log(error)
      return false
    }
  }

  async updateRedisBlockedUsers() {
    try {
      const blockedUsers = await userModel
        .find({ isBlocked: true })
        .select('_id')
        .lean()

      await redis.set('blockedUsers', JSON.stringify(blockedUsers), 'EX', 3600)
    } catch (error) {
      console.error('Error updating Redis with blocked users:', error)
      throw new Error('Failed to update Redis with blocked users')
    }
  }

  async getAllPost(
    req: Request
  ): Promise<{ post: Post[]; totalPage: number } | null> {
    try {
      const { fetch, pageNo } = req.query

      const limit = 1
      const skip = (Number(pageNo) - 1) * limit
      let posts
      let totalPage
      let totalCount
      switch (fetch) {
        case 'all':
          let pipeline: mongoose.PipelineStage[] = [
            {
              $lookup: {
                from: 'reports',
                let: { postId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$targetId', '$$postId'],
                      },
                      status: { $in: ['Pending', 'Reviewed'] },
                      isRemoved: false,
                    },
                  },
                ],
                as: 'reports',
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                pipeline: [
                  {
                    $project: {
                      _id: 0,
                      userName: 1,
                    },
                  },
                ],
                as: 'user',
              },
            },
            {
              $unwind: '$user',
            },

            {
              $sort: { createdAt: -1 },
            },
          ]

          posts = await postModel.aggregate(pipeline).skip(skip).limit(limit)

          totalCount = await postModel.countDocuments()

          totalPage = Math.ceil(totalCount / limit)

          return { post: posts, totalPage }

        case 'Reported':
          let pipeline2: mongoose.PipelineStage[] = [
            {
              $lookup: {
                from: 'reports',
                let: { postId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$targetId', '$$postId'],
                      },
                      status: { $in: ['Pending', 'Reviewed'] },
                      isRemoved: false,
                    },
                  },
                ],
                as: 'reports',
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                pipeline: [
                  {
                    $project: {
                      _id: 0,
                      userName: 1,
                    },
                  },
                ],
                as: 'user',
              },
            },
            {
              $unwind: '$user',
            },
            {
              $match: {
                'reports.0': { $exists: true },
              },
            },
            {
              $sort: { createdAt: -1 },
            },
            {
              $facet: {
                metadata: [{ $count: 'totalCount' }],
                data: [{ $skip: skip }, { $limit: limit }],
              },
            },
          ]

          const result = await postModel.aggregate(pipeline2)
          posts = result[0].data
          totalCount =
            result[0].metadata.length > 0 ? result[0].metadata[0].totalCount : 0
          totalPage = Math.ceil(totalCount / limit)

          return { post: posts, totalPage }
        case 'Deleted':
          let pipeline3: mongoose.PipelineStage[] = [
            { $match: { isDeleted: true } },
            {
              $lookup: {
                from: 'reports',
                let: { postId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$targetId', '$$postId'],
                      },
                      status: { $in: ['Pending', 'Reviewed'] },
                      isRemoved: false,
                    },
                  },
                ],
                as: 'reports',
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                pipeline: [
                  {
                    $project: {
                      _id: 0,
                      userName: 1,
                    },
                  },
                ],
                as: 'user',
              },
            },
            {
              $unwind: '$user',
            },

            {
              $sort: { createdAt: -1 },
            },
          ]

          posts = await postModel.aggregate(pipeline3).skip(skip).limit(limit)

          totalCount = await postModel.countDocuments({ isDeleted: true })

          totalPage = Math.ceil(totalCount / limit)

          return { post: posts, totalPage }
        case 'Removed':
          let pipeline4: mongoose.PipelineStage[] = [
            { $match: { isRemoved: true } },
            {
              $lookup: {
                from: 'reports',
                let: { postId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$targetId', '$$postId'],
                      },
                      status: { $in: ['Pending', 'Reviewed'] },
                      isRemoved: false,
                    },
                  },
                ],
                as: 'reports',
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                pipeline: [
                  {
                    $project: {
                      _id: 0,
                      userName: 1,
                    },
                  },
                ],
                as: 'user',
              },
            },
            {
              $unwind: '$user',
            },

            {
              $sort: { createdAt: -1 },
            },
          ]

          posts = await postModel.aggregate(pipeline4).skip(skip).limit(limit)

          totalCount = await postModel.countDocuments({ isRemoved: true })

          totalPage = Math.ceil(totalCount / limit)

          return { post: posts, totalPage }
      }
      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }
  async getPostReports(
    req: Request
  ): Promise<{ reports: IReport[]; hasMore: boolean } | null> {
    try {
      const targetId = req.query.targetId as string
      const pageNo = req.query.pageNo as string

      const limit = 5
      const skip = (Number(pageNo) - 1) * limit

      const reports = await reportModel
        .find({
          targetId: new ObjectId(targetId),
          isRemoved: false,
        })
        .populate('reportedBy', 'userName email')
        .limit(limit)
        .skip(skip)
        .sort({ reportedOn: -1 })
      const totalCount = await reportModel.countDocuments({
        targetId: new ObjectId(targetId),
        isRemoved: false,
      })
      const totalPage = Math.ceil(totalCount / limit)

      if (reports) {
        return {
          reports: reports,
          hasMore: totalPage == Number(pageNo) ? false : true,
        }
      }

      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }
  async removeReport(req: Request): Promise<boolean> {
    try {
      const { rId } = req.body

      const removeReport = await reportModel.findByIdAndUpdate(
        rId,
        {
          $set: { isRemoved: true, status: 'Removed' },
        },
        { new: true }
      )

      if (removeReport) {
        if (removeReport.targetType == 'Borrowed') {
          await BookshelfModel.findOneAndUpdate(
            {
              'borrowed._id': new ObjectId(removeReport.targetId),
            },
            {
              $pull: {
                'borrowed.$.reportsMade': removeReport._id,
              },
            }
          )
          const result = await BookshelfModel.findOne(
            {
              'borrowed._id': new ObjectId(removeReport.targetId),
            },
            {
              'borrowed.$': 1,
            }
          )

          if (result && result.borrowed && result.borrowed.length > 0) {
            const borrowedItem = result.borrowed[0].from

            const user = await userModel.findOneAndUpdate(
              {
                _id: new ObjectId(borrowedItem.toString()),
              },
              { $pull: { reportCount: removeReport._id } },
              { new: true }
            )
            if (user) {
              return true
            }
          }
        }

        if (removeReport.targetType === 'Lended') {
          await BookshelfModel.findOneAndUpdate(
            {
              'lended._id': new ObjectId(removeReport.targetId),
            },
            {
              $pull: {
                'lended.$.reportsMade': removeReport._id,
              },
            }
          )
          const result = await BookshelfModel.findOne(
            {
              'lended._id': new ObjectId(removeReport.targetId),
            },
            {
              'lended.$': 1,
            }
          )
          if (result && result.lended && result.lended.length > 0) {
            const lendedItem = result.lended[0].lendedTo
            const user = await userModel.findOneAndUpdate(
              {
                _id: new ObjectId(lendedItem.toString()),
              },
              { $pull: { reportCount: removeReport._id } },
              { new: true }
            )
            if (user) {
              return true
            }
          }
        }

        if (removeReport?.targetType == 'Post') {
          await removeReport.populate('targetId', 'userId')
        }
        if (removeReport.targetType == 'Post') {
          const { userId } = removeReport.targetId as unknown as {
            userId: string
            _id: string
          }

          const user = await userModel.findOneAndUpdate(
            {
              _id: new ObjectId(userId),
            },
            { $pull: { reportCount: removeReport._id } },
            { new: true }
          )
          if (user) {
            return true
          }
        }
      }

      return false
    } catch (error) {
      console.log(error)
      return false
    }
  }

  async findBadgeByName(badge: string): Promise<boolean> {
    try {
      const isAvail = await BadgeModel.findOne({ name: badge })

      if (isAvail) return true
      else return false
    } catch (error) {
      console.log(error)
      return false
    }
  }

  async createBadge(
    req: Request,
    doc: { public_id: string; secure_url: string }
  ): Promise<boolean | IBadge> {
    try {
      const { badgeName, minScore, borrowLimit } = req.body

      const badge = await BadgeModel.create({
        name: badgeName,
        minScore: Number(minScore),
        iconUrl: {
          publicId: doc.public_id,
          secureUrl: doc.secure_url,
        },
        limit: Number(borrowLimit),
      })
      if (badge) {
        return badge
      }
      return false
    } catch (error) {
      console.log(error)
      return false
    }
  }

  //get
  async getSingleBadge(badgeId: string): Promise<IBadge | null> {
    try {
      const badge = await BadgeModel.findById(badgeId)
      if (badge) {
        return badge
      }
      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }
  async editBadge(req: Request): Promise<IBadge | null> {
    try {
      const badgeId = req.query.badgeId as string
      const { badgeName, minScore, borrowLimit } = req.body
      if (!badgeName || !minScore || !borrowLimit || !badgeId) return null
      const badge = await BadgeModel.findByIdAndUpdate(badgeId, {
        $set: {
          badgeName: badgeName,
          minScore: Number(minScore),
          limit: Number(borrowLimit),
        },
      })

      if (badge) {
        return badge
      } else {
        return null
      }
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async getBadge(): Promise<null | IBadge[]> {
    try {
      const badges = await BadgeModel.find()
      if (badges) {
        return badges
      }
      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async getLendedTransactions(
    req: Request
  ): Promise<{ hasMore: boolean; lended: ILended[] } | null> {
    const { pageNo, filter } = req.query as { pageNo: string; filter: 'all' }

    try {
      const limit = 10
      const startIndex = (Number(pageNo) - 1) * limit
      const totalDocuments = await BookshelfModel.aggregate([
        { $unwind: '$borrowed' },
        { $count: 'totalDocuments' },
      ])

      const totalCount =
        totalDocuments.length > 0 ? totalDocuments[0].totalDocuments : 0

      const result = await BookshelfModel.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        { $unwind: '$userDetails' },
        { $unwind: '$lended' },
        {
          $lookup: {
            from: 'requests',
            localField: 'lended.requestId',
            foreignField: '_id',
            as: 'lended.requestDetails',
          },
        },
        { $unwind: '$lended.requestDetails' },
        {
          $lookup: {
            from: 'users',
            localField: 'lended.lendedTo',
            foreignField: '_id',
            as: 'lended.lUser',
          },
        },
        { $unwind: '$lended.lUser' },
        {
          $addFields: {
            'lended.userName': '$userDetails.userName',
            'lended.profile': '$userDetails.profile',
            'lended.userId': '$userDetails._id',
          },
        },
        {
          $project: {
            _id: 0,
            lended: {
              _id: 1,
              userName: 1,
              profile: 1,
              userId: 1,
              'lUser.userName': 1,
              'lUser.profile': 1,
              'lUser._id': 1,
              requestId: 1,
              earnedScore: 1,
              isReturned: 1,
              remainingDays: 1,
              keepingTime: 1,
              requestDetails: 1,
              lendedOn: 1,
            },
          },
        },
        { $skip: startIndex },
        { $limit: limit },
        {
          $group: {
            _id: null,
            lended: { $push: '$lended' },
          },
        },
        {
          $project: {
            _id: 0,
            lended: 1,
          },
        },
      ])

      return {
        lended: result.length > 0 ? result[0].lended : [],
        hasMore: Math.ceil(totalCount / limit) == Number(pageNo) ? false : true,
      }
    } catch (error) {
      console.log(error)
      return null
    }
  }
  async getBorrowedTransactions(
    req: Request
  ): Promise<{ hasMore: boolean; borrowed: IBorrowed[] } | null> {
    const { pageNo, filter } = req.query as { pageNo: string; filter: 'all' }

    try {
      const limit = 10
      const startIndex = (Number(pageNo) - 1) * limit
      const totalDocuments = await BookshelfModel.aggregate([
        { $unwind: '$lended' },
        { $count: 'totalDocuments' },
      ])

      const totalCount =
        totalDocuments.length > 0 ? totalDocuments[0].totalDocuments : 0

      const result = await BookshelfModel.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        { $unwind: '$userDetails' },
        { $unwind: '$borrowed' },
        {
          $lookup: {
            from: 'requests',
            localField: 'borrowed.requestId',
            foreignField: '_id',
            as: 'borrowed.requestDetails',
          },
        },
        { $unwind: '$borrowed.requestDetails' },
        {
          $lookup: {
            from: 'users',
            localField: 'borrowed.from',
            foreignField: '_id',
            as: 'borrowed.lUser',
          },
        },
        { $unwind: '$borrowed.lUser' },
        {
          $addFields: {
            'borrowed.userName': '$userDetails.userName',
            'borrowed.profile': '$userDetails.profile',
            'borrowed.userId': '$userDetails._id',
          },
        },
        {
          $project: {
            _id: 0,
            borrowed: {
              _id: 1,
              userName: 1,
              profile: 1,
              userId: 1,
              'lUser.userName': 1,
              'lUser.profile': 1,
              'lUser._id': 1,
              requestId: 1,
              isReturned: 1,
              remainingDays: 1,
              keepingTime: 1,
              requestDetails: 1,
              borrowedOn: 1,
            },
          },
        },
        { $skip: startIndex },
        { $limit: limit },
        {
          $group: {
            _id: null,
            borrowed: { $push: '$borrowed' },
          },
        },
        {
          $project: {
            _id: 0,
            borrowed: 1,
          },
        },
      ])

      return {
        borrowed: result.length > 0 ? result[0].borrowed : [],
        hasMore: Math.ceil(totalCount / limit) == Number(pageNo) ? false : true,
      }
    } catch (error) {
      console.log(error)
      return null
    }
  }
  async getSingleUser(req: Request): Promise<{
    user: User
    postLength: number
    books: number
  } | null> {
    try {
      const userId = req.query.userId
      const user = (await userModel.aggregate([
        {
          $match: { _id: new ObjectId(userId?.toString()) },
        },
        {
          $lookup: {
            from: 'lendscores',
            let: { lendscoreId: '$lendscore' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$lendscoreId'] } } },
            ],
            as: 'lendscoreDetails',
          },
        },
        {
          $unwind: {
            path: '$lendscoreDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'badges',
            let: { badgeId: '$lendscoreDetails.badgeId' },
            pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$badgeId'] } } }],
            as: 'badgeDetails',
          },
        },
        {
          $unwind: {
            path: '$badgeDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            numFollowers: { $size: '$followers' },
            numFollowing: { $size: '$following' },
            numReports: { $size: '$reportCount' },
          },
        },
        {
          $project: {
            _id: 1,
            userName: 1,
            isSubscribed: 1,
            isBlocked: 1,
            privacy: 1,
            name: 1,
            profile: 1,
            numFollowers: 1,
            numFollowing: 1,
            numReports: 1,
            lendscoreDetails: 1,
            badgeDetails: 1,
          },
        },
      ])) as User[]

      const books = await BookshelfModel.aggregate([
        { $match: { userId: new ObjectId(userId?.toString()) } },
        {
          $addFields: {
            postLength: { $size: '$shelf' },
          },
        },
        {
          $project: {
            postLength: 1,
          },
        },
      ])
      const obj = {
        user: user[0] as User,
        postLength: await postModel.countDocuments({
          userId: new ObjectId(userId?.toString()),
        }),
        books: books[0]?.postLength || 0,
      }

      return obj
    } catch (error) {
      console.log(error)
      return null
    }
  }
  async getReportedPost(
    req: Request
  ): Promise<{ post: Post[]; hasMore: boolean } | null> {
    try {
      const { pageNo, userId } = req.query
      const limit = 1
      const skip = (Number(pageNo) - 1) * limit
      const reportedPost = await userModel.aggregate([
        {
          $match: { _id: new ObjectId(userId?.toString()) },
        },
        {
          $lookup: {
            from: 'reports',
            let: { reportIds: '$reportCount' },
            pipeline: [
              { $match: { $expr: { $in: ['$_id', '$$reportIds'] } } },
              {
                $match: {
                  targetType: 'Post',
                  isRemoved: false,
                  status: { $ne: 'Resolved' },
                },
              },
            ],
            as: 'reportDetails',
          },
        },
        {
          $unwind: {
            path: '$reportDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            targetId: '$reportDetails.targetId',
          },
        },
      ])

      const targetIds = reportedPost.map((report) => report.targetId)

      if (targetIds.length > 0) {
        const posts = await postModel
          .find(
            { _id: { $in: targetIds } },
            {
              imageUrls: 1,
              _id: 1,
              userId: 1,
              description: 1,
              isAddedToBookShelf: 1,
              ID: 1,
              reportCount: 1,
            }
          )

          .skip(skip)
          .limit(limit)

        const totalCount = await postModel.countDocuments({
          _id: { $in: targetIds },
        })
        const typedPosts: Post[] = posts as unknown as Post[]

        if (typedPosts.length > 0)
          return {
            post: typedPosts,
            hasMore:
              Math.ceil(totalCount / limit) == Number(pageNo) ? false : true,
          }
        else return null
      } else {
        return null
      }
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async getUserStatistics(): Promise<{
    totalUsers: number
    blockedUsers: number
    verified: number
    newUsers: number
    reportedUser: number
  }> {
    try {
      const userStats = await userModel.aggregate([
        {
          $facet: {
            totalUsers: [{ $count: 'count' }],
            verifiedUsers: [
              { $match: { isSubscribed: true, cautionDeposit: { $gt: 0 } } },
              { $count: 'count' },
            ],
            blockedUsers: [
              { $match: { isBlocked: true } },
              { $count: 'count' },
            ],
            newUsers: [
              {
                $match: {
                  createdAt: {
                    $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  },
                },
              },
              { $count: 'count' },
            ],
            reportedUsers: [
              {
                $match: {
                  $expr: { $gt: [{ $size: '$reportCount' }, 0] },
                },
              },
              { $count: 'count' },
            ],
          },
        },
      ])

      const formatCount = (arr: any) => (arr.length > 0 ? arr[0].count : 0)

      return {
        totalUsers: formatCount(userStats[0].totalUsers),
        verified: formatCount(userStats[0].verifiedUsers),
        blockedUsers: formatCount(userStats[0].blockedUsers),
        newUsers: formatCount(userStats[0].newUsers),
        reportedUser: formatCount(userStats[0].reportedUsers),
      }
    } catch (error) {
      console.log(error)
      return {
        totalUsers: 0,
        blockedUsers: 0,
        verified: 0,
        newUsers: 0,
        reportedUser: 0,
      }
    }
  }

  generateMonthsOfYear = () => {
    const start = moment().startOf('year')
    const months = []

    for (let i = 0; i < 12; i++) {
      const month = start.clone().add(i, 'months').format('MMMM YYYY')
      months.push({ month, count: 0 })
    }

    return months
  }
  getCurrentMonthRange = () => {
    const start = new Date()
    start.setDate(1)
    start.setHours(0, 0, 0, 0)

    const end = new Date()
    end.setMonth(end.getMonth() + 1)
    end.setDate(0)
    end.setHours(23, 59, 59, 999)

    return { start, end }
  }
  async getPeriodUserStatistics(req: Request): Promise<{}> {
    try {
      const query = req.query.filter
      if (query == 'days') {
        const { start, end } = this.getCurrentMonthRange()
        const usersPerDay = await userModel.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lte: end },
            },
          },
          {
            $project: {
              day: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
              },
            },
          },
          {
            $group: {
              _id: '$day',
              count: { $sum: 1 },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ])
        const result = []
        let currentDate = new Date(start)

        while (currentDate <= end) {
          const dateStr = currentDate.toISOString().split('T')[0]
          const existingDay = usersPerDay.find((day) => day._id === dateStr)

          result.push({
            date: dateStr,
            users: existingDay ? existingDay.count : 0,
          })

          currentDate.setDate(currentDate.getDate() + 1)
        }
        return result
      } else if (query == 'months') {
        let stats = []
        const allMonths = this.generateMonthsOfYear()
        const aggregatedData = await userModel.aggregate([
          {
            $match: {
              createdAt: {
                $gte: moment().startOf('year').toDate(),
                $lte: moment().endOf('year').toDate(),
              },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
              totalUsers: { $sum: 1 },
            },
          },
        ])

        stats = allMonths.map((month) => {
          const monthKey = moment(month.month, 'MMMM YYYY').format('YYYY-MM')
          const data = aggregatedData.find((d) => d._id === monthKey)
          return {
            month: month.month,
            users: data ? data.totalUsers : 0,
          }
        })
        return stats
      } else if (query == 'years') {
        const currentYear = new Date().getFullYear()
        const startYear = currentYear - 10
        const usersPerYear = await userModel.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(startYear, 0, 1),
                $lte: new Date(currentYear + 1, 0, 0),
              },
            },
          },
          {
            $project: {
              year: { $year: '$createdAt' },
            },
          },
          {
            $group: {
              _id: '$year',
              count: { $sum: 1 },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ])

        const result = []
        for (let year = startYear; year <= currentYear; year++) {
          const existingYear = usersPerYear.find((y) => y._id === year)

          result.push({
            year,
            users: existingYear ? existingYear.count : 0,
          })
        }
        return result
      }

      return {}
    } catch (error) {
      console.log(error)
      return {}
    }
  }

  async getHighLendscoreUser(
    req: Request
  ): Promise<{ users: User[]; hasMore: boolean } | null> {
    try {
      const pageNo = parseInt(req.query.pageNo as string)

      const limit = 1
      const topUsers = await userModel
        .aggregate([
          {
            $match: {
              lendscore: { $ne: null },
            },
          },
          {
            $lookup: {
              from: 'lendscores',
              localField: 'lendscore',
              foreignField: '_id',
              as: 'lendscoreDetails',
            },
          },
          {
            $unwind: {
              path: '$lendscoreDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'badges',
              localField: 'lendscoreDetails.badgeId',
              foreignField: '_id',
              as: 'badgeDetails',
            },
          },
          {
            $unwind: {
              path: '$badgeDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
          { $sort: { 'lendscoreDetails.badgeScore': -1 } },
          { $skip: (pageNo - 1) * limit },
          { $limit: limit },
          {
            $project: {
              userName: 1,
              name: 1,
              email: 1,
              profile: 1,
              lendscoreDetails: 1,
              badgeDetails: 1,
            },
          },
        ])
        .exec()
      const totalCount = await userModel.countDocuments({
        lendscore: { $ne: null },
      })
      if (topUsers) {
        return {
          users: topUsers,
          hasMore: Math.ceil(totalCount / limit) == pageNo ? false : true,
        }
      }

      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async getPostStatistics(): Promise<{
    totalPost: number
    removedPost: number
    reportedPost: number
    postAddedToBookshelf: number
  }> {
    try {
      const results = await postModel.aggregate([
        {
          $facet: {
            totalPost: [{ $count: 'count' }],
            removedPost: [{ $match: { isRemoved: true } }, { $count: 'count' }],
            reportedPost: [
              { $match: { reportCount: { $gt: { $size: 0 } } } },
              { $count: 'count' },
            ],
            postAddedToBookshelf: [
              { $match: { isAddedToBookShelf: { $ne: null } } },
              { $count: 'count' },
            ],
          },
        },
        {
          $project: {
            totalPost: { $arrayElemAt: ['$totalPost.count', 0] },
            removedPost: { $arrayElemAt: ['$removedPost.count', 0] },
            reportedPost: { $arrayElemAt: ['$reportedPost.count', 0] },
            postAddedToBookshelf: {
              $arrayElemAt: ['$postAddedToBookshelf.count', 0],
            },
          },
        },
      ])

      const stats = {
        totalPost: results[0]?.totalPost || 0,
        removedPost: results[0]?.removedPost || 0,
        reportedPost: results[0]?.reportedPost || 0,
        postAddedToBookshelf: results[0]?.postAddedToBookshelf || 0,
      }

      return stats
    } catch (error) {
      console.log(error)
      return {
        totalPost: 0,
        removedPost: 0,
        reportedPost: 0,
        postAddedToBookshelf: 0,
      }
    }
  }

  async getPeriodPostStatistics(req: Request): Promise<{}> {
    try {
      const filter = req.query.filter as string

      if (filter == 'days') {
        const { start, end } = this.getCurrentMonthRange()
        const postsPerDay = await postModel.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lte: end },
            },
          },
          {
            $project: {
              day: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
              },
            },
          },
          {
            $group: {
              _id: '$day',
              count: { $sum: 1 },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ])
        const result = []

        let currentDate = new Date(start)

        while (currentDate <= end) {
          const dateStr = currentDate.toISOString().split('T')[0]
          const existingDay = postsPerDay.find((day) => day._id === dateStr)

          result.push({
            date: dateStr,
            posts: existingDay ? existingDay.count : 0,
          })

          currentDate.setDate(currentDate.getDate() + 1)
        }
        return result
      } else if (filter == 'months') {
        let stats = []
        const allMonths = this.generateMonthsOfYear()
        const aggregatedData = await postModel.aggregate([
          {
            $match: {
              createdAt: {
                $gte: moment().startOf('year').toDate(),
                $lte: moment().endOf('year').toDate(),
              },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
              totalPosts: { $sum: 1 },
            },
          },
        ])

        stats = allMonths.map((month) => {
          const monthKey = moment(month.month, 'MMMM YYYY').format('YYYY-MM')
          const data = aggregatedData.find((d) => d._id === monthKey)
          return {
            month: month.month,
            posts: data ? data.totalPosts : 0,
          }
        })
        return stats
      } else if (filter == 'years') {
        const currentYear = new Date().getFullYear()
        const startYear = currentYear - 10
        const postsPerYear = await postModel.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(startYear, 0, 1),
                $lte: new Date(currentYear + 1, 0, 0),
              },
            },
          },
          {
            $project: {
              year: { $year: '$createdAt' },
            },
          },
          {
            $group: {
              _id: '$year',
              count: { $sum: 1 },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ])

        const result = []
        for (let year = startYear; year <= currentYear; year++) {
          const existingYear = postsPerYear.find((y) => y._id === year)

          result.push({
            year,
            posts: existingYear ? existingYear.count : 0,
          })
        }
        return result
      }

      return {}
    } catch (error) {
      console.log(error)
      return {}
    }
  }
  async getHighBoostedPost(
    req: Request
  ): Promise<{ post: Post[]; hasMore: boolean } | null> {
    try {
      const limit = 20

      const highBoostedPosts = await postModel.aggregate([
        {
          $match: {
            isRemoved: false,
            isDeleted: false,
          },
        },
        {
          $addFields: {
            totalEngagement: {
              $add: [{ $size: '$likes' }, { $size: '$comments' }],
            },
          },
        },
        {
          $sort: { totalEngagement: -1 },
        },
        {
          $limit: limit,
        },
        {
          $project: {
            imageUrls: 1,
            description: 1,
            isAddedToBookShelf: 1,
            totalEngagement: 1,
            likesCount: { $size: '$likes' },
            commentsCount: { $size: '$comments' },
            ID: 1,
          },
        },
      ])

      return { post: highBoostedPosts, hasMore: false }
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async getPost(postId: string): Promise<IPost | null> {
    try {
      const post = await postModel.findById(postId)
      if (post) {
        await post.populate('userId', 'userName profile name')
        await post.populate('comments.author', 'userName profile name')
        await post.populate('comments.replies.author', 'userName profile name')
        return post
      }
      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async banPost(posId: string): Promise<IPost | null> {
    try {
      console.log(posId)

      if (!posId) {
        return null
      }
      console.log(posId)

      const post = await postModel.findByIdAndUpdate(posId, {
        $set: { isRemoved: true },
      })
      if (post) {
        await post.populate('userId', 'email')
        return post
      }
      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }
  async getTransactionStatistics(): Promise<{
    totalTransactions: number
    completedTransactions: number
    reportedTransactions: number
  }> {
    try {
      const result = await BookshelfModel.aggregate([
        {
          $match: {
            $or: [
              { lended: { $exists: true, $not: { $size: 0 } } },
              { borrowed: { $exists: true, $not: { $size: 0 } } },
            ],
          },
        },
        { $unwind: { path: '$lended', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$borrowed', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: null,
            totalLended: {
              $sum: { $cond: [{ $ifNull: ['$lended._id', false] }, 1, 0] },
            },
            completedLended: {
              $sum: {
                $cond: [{ $ifNull: ['$lended.isReturned', false] }, 1, 0],
              },
            },
            reportedLended: {
              $sum: {
                $cond: [
                  {
                    $gt: [
                      { $size: { $ifNull: ['$lended.reportsMade', []] } },
                      0,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            totalBorrowed: {
              $sum: { $cond: [{ $ifNull: ['$borrowed._id', false] }, 1, 0] },
            },
            completedBorrowed: {
              $sum: {
                $cond: [{ $ifNull: ['$borrowed.isReturned', false] }, 1, 0],
              },
            },
            reportedBorrowed: {
              $sum: {
                $cond: [
                  {
                    $gt: [
                      { $size: { $ifNull: ['$borrowed.reportsMade', []] } },
                      0,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalTransactions: { $add: ['$totalLended', '$totalBorrowed'] },
            completedTransactions: {
              $add: ['$completedLended', '$completedBorrowed'],
            },
            reportedTransactions: {
              $add: ['$reportedLended', '$reportedBorrowed'],
            },
          },
        },
      ])

      return (
        result[0] || {
          totalTransactions: 0,
          completedTransactions: 0,
          reportedTransactions: 0,
        }
      )
    } catch (error) {
      console.log(error)
      return {
        totalTransactions: 0,
        completedTransactions: 0,
        reportedTransactions: 0,
      }
    }
  }

  async getPeriodTransactionStatistics(req: Request): Promise<{}> {
    const filter = req.query.filter as string

    function getCurrentYearRange() {
      const now = new Date()
      const start = new Date(Date.UTC(now.getFullYear(), 0, 1))
      const end = new Date(Date.UTC(now.getFullYear() + 1, 0, 1))
      end.setUTCHours(23, 59, 59, 999)
      return { start, end }
    }

    function getCurrentMonthRange() {
      const now = new Date()
      const start = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1))
      const end = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0))
      end.setUTCHours(23, 59, 59, 999)
      return { start, end }
    }

    if (filter === 'days') {
      const { start, end } = getCurrentMonthRange()
      const pipeline: PipelineStage[] = [
        { $unwind: '$lended' },
        {
          $match: {
            'lended.lendedOn': {
              $gte: new Date(start),
              $lt: new Date(end),
            },
          },
        },
        {
          $group: {
            _id: { $dayOfMonth: '$lended.lendedOn' },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $project: {
            _id: 1,
            day: '$_id',
            count: 1,
          },
        },
      ]

      const transactionsPerDay = await BookshelfModel.aggregate(pipeline)
      const result = []

      let currentDate = new Date(start)

      while (currentDate < end) {
        const dayOfMonth = currentDate.getDate()

        const existingDay = transactionsPerDay.find(
          (day) => day._id === dayOfMonth
        )

        result.push({
          date: currentDate.toISOString().split('T')[0],
          transactions: existingDay ? existingDay.count : 0,
        })

        currentDate.setDate(currentDate.getDate() + 1)
      }

      return { transactions: result }
    }

    if (filter === 'months') {
      const { start, end } = getCurrentYearRange()
      const pipeline: PipelineStage[] = [
        { $unwind: '$lended' },
        {
          $match: {
            'lended.lendedOn': {
              $gte: new Date(start),
              $lt: new Date(end),
            },
          },
        },
        {
          $group: {
            _id: { $month: '$lended.lendedOn' },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $project: {
            _id: 1,
            month: '$_id',
            count: 1,
          },
        },
      ]

      const transactionsPerMonth = await BookshelfModel.aggregate(pipeline)
      const result = []

      for (let month = 1; month <= 12; month++) {
        const existingMonth = transactionsPerMonth.find((m) => m._id === month)

        result.push({
          month: month,
          transactions: existingMonth ? existingMonth.count : 0,
        })
      }

      return { transactions: result }
    }

    if (filter === 'years') {
      const startYear = new Date().getFullYear() - 5
      const start = new Date(Date.UTC(startYear, 0, 1))
      const end = new Date(Date.UTC(new Date().getFullYear() + 1, 0, 1))
      end.setUTCHours(23, 59, 59, 999)

      const pipeline: PipelineStage[] = [
        { $unwind: '$lended' },
        {
          $match: {
            'lended.lendedOn': {
              $gte: new Date(start),
              $lt: new Date(end),
            },
          },
        },
        {
          $group: {
            _id: { $year: '$lended.lendedOn' },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $project: {
            _id: 1,
            year: '$_id',
            count: 1,
          },
        },
      ]

      const transactionsPerYear = await BookshelfModel.aggregate(pipeline)
      const result = []

      let currentYear = startYear
      while (currentYear <= new Date().getFullYear()) {
        const existingYear = transactionsPerYear.find(
          (y) => y._id === currentYear
        )

        result.push({
          year: currentYear,
          transactions: existingYear ? existingYear.count : 0,
        })

        currentYear++
      }

      return { transactions: result }
    }

    return {}
  }

  async getPeriodRequestStatistics(req: Request): Promise<{}> {
    try {
      function getCurrentYearRange() {
        const now = new Date()
        const start = new Date(Date.UTC(now.getFullYear(), 0, 1))
        const end = new Date(Date.UTC(now.getFullYear(), 11, 31))
        end.setUTCHours(23, 59, 59, 999)
        return { start, end }
      }
      function getPastTenYearsRange() {
        const now = new Date()
        const start = new Date(Date.UTC(now.getFullYear() - 10, 0, 1))
        const end = new Date(Date.UTC(now.getFullYear(), 11, 31))
        end.setUTCHours(23, 59, 59, 999)
        return { start, end }
      }
      function getCurrentMonthRange() {
        const now = new Date()
        const start = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1))
        const end = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0))
        end.setUTCHours(23, 59, 59, 999)
        return { start, end }
      }

      const filter = req.query.filter as string
      console.log(filter)

      let pipeline: PipelineStage[] = []
      let finalResults = []
      let result = []
      let currentDate

      if (filter == 'days') {
        const { start, end } = getCurrentMonthRange()

        pipeline = [
          { $match: { requestedOn: { $gte: start, $lt: end } } },
          {
            $group: {
              _id: {
                day: { $dayOfMonth: '$requestedOn' },
                stage: '$stage',
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { '_id.day': 1, '_id.stage': 1 } },
          {
            $group: {
              _id: '$_id.day',
              stages: {
                $push: {
                  stage: '$_id.stage',
                  count: '$count',
                },
              },
            },
          },
        ]

        const results = await RequestModel.aggregate(pipeline)

        finalResults = results.map((result) => {
          const stages: StageCounts = result.stages.reduce(
            (acc: StageCounts, { stage, count }: StageCount) => {
              acc[stage as keyof StageCounts] = count
              return acc
            },
            { requested: 0, expired: 0, approved: 0, transactionComplete: 0 }
          )

          return {
            day: result._id,
            stages,
          }
        })

        currentDate = new Date(start)
        while (currentDate < end) {
          const dayOfMonth = currentDate.getDate()

          const existingDay = finalResults.find((day) => day.day === dayOfMonth)
          result.push({
            date: currentDate.toISOString().split('T')[0],
            requested: existingDay ? existingDay.stages.requested || 0 : 0,
            expired: existingDay ? existingDay.stages.expired || 0 : 0,
            approved: existingDay ? existingDay.stages.approved || 0 : 0,
            transactionComplete: existingDay
              ? existingDay.stages['transaction complete'] || 0
              : 0,
          })

          currentDate.setDate(currentDate.getDate() + 1)
        }
      } else if (filter == 'months') {
        const { start, end } = getCurrentYearRange()

        pipeline = [
          { $match: { requestedOn: { $gte: start, $lt: end } } },
          {
            $group: {
              _id: {
                month: { $month: '$requestedOn' },
                stage: '$stage',
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { '_id.month': 1, '_id.stage': 1 } },
          {
            $group: {
              _id: '$_id.month',
              stages: {
                $push: {
                  stage: '$_id.stage',
                  count: '$count',
                },
              },
            },
          },
        ]

        const results = await RequestModel.aggregate(pipeline)

        finalResults = results.map((result) => {
          const stages: StageCounts = result.stages.reduce(
            (acc: StageCounts, { stage, count }: StageCount) => {
              acc[stage as keyof StageCounts] = count
              return acc
            },
            { requested: 0, expired: 0, approved: 0, transactionComplete: 0 }
          )

          return {
            month: result._id,
            stages,
          }
        })

        currentDate = new Date(start)
        while (currentDate <= end) {
          const monthOfYear = currentDate.getMonth() + 1

          const existingMonth = finalResults.find(
            (month) => month.month === monthOfYear
          )
          result.push({
            month: currentDate.toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            }),
            requested: existingMonth ? existingMonth.stages.requested || 0 : 0,
            expired: existingMonth ? existingMonth.stages.expired || 0 : 0,
            approved: existingMonth ? existingMonth.stages.approved || 0 : 0,
            transactionComplete: existingMonth
              ? existingMonth.stages['transaction complete'] || 0
              : 0,
          })

          currentDate.setMonth(currentDate.getMonth() + 1)
        }
      } else if (filter == 'years') {
        const { start, end } = getPastTenYearsRange()

        pipeline = [
          { $match: { requestedOn: { $gte: start, $lt: end } } },
          {
            $group: {
              _id: {
                year: { $year: '$requestedOn' },
                stage: '$stage',
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { '_id.year': 1, '_id.stage': 1 } },
          {
            $group: {
              _id: '$_id.year',
              stages: {
                $push: {
                  stage: '$_id.stage',
                  count: '$count',
                },
              },
            },
          },
        ]

        const results = await RequestModel.aggregate(pipeline)

        finalResults = results.map((result) => {
          const stages: StageCounts = result.stages.reduce(
            (acc: StageCounts, { stage, count }: StageCount) => {
              acc[stage as keyof StageCounts] = count
              return acc
            },
            { requested: 0, expired: 0, approved: 0, transactionComplete: 0 }
          )

          return {
            year: result._id,
            stages,
          }
        })

        currentDate = new Date(start)
        while (currentDate <= end) {
          const year = currentDate.getFullYear()

          const existingYear = finalResults.find(
            (yearData) => yearData.year === year
          )
          result.push({
            year: year.toString(),
            requested: existingYear ? existingYear.stages.requested || 0 : 0,
            expired: existingYear ? existingYear.stages.expired || 0 : 0,
            approved: existingYear ? existingYear.stages.approved || 0 : 0,
            transactionComplete: existingYear
              ? existingYear.stages['transaction complete'] || 0
              : 0,
          })

          currentDate.setFullYear(currentDate.getFullYear() + 1)
        }
      }

      return result
    } catch (error) {
      console.log(error)
      return {}
    }
  }
  async getPaymentId(userId: string): Promise<User | null> {
    try {
      return await userModel.findById(userId, {
        cautionDeposit: 1,
        email: 1,
        paymentId: 1,
      })
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async getLendedSingleTransaction(lendId: string): Promise<ILended | null> {
    try {
      const lended = await BookshelfModel.findOne(
        { 'lended._id': new ObjectId(lendId) },
        { 'lended.$': 1 }
      )
      const lendDoc = await lended?.populate('lended.0.requestId')

      if (lendDoc) {
        return lendDoc.lended[0]
      }

      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }
  async getBook(bookId: string): Promise<IShelf | null> {
    try {
      const book = await BookshelfModel.findOne(
        { 'shelf._id': new ObjectId(bookId) },
        { 'shelf.$': 1 }
      )
      if (book) {
        return book.shelf[0]
      }
      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }
  async reduceCautionDeposit(
    userId: string,
    amount: number,
    note: string,
    lendId: string
  ): Promise<boolean> {
    try {
      const user = await userModel.findByIdAndUpdate(userId, {
        $inc: { cautionDeposit: -Number(amount) },
      })
      const deduction = await deductionModel.findOneAndUpdate(
        {
          userId: new ObjectId(userId),
        },
        { $push: { deductions: { amount: Number(amount), note: note } } },
        { upsert: true, new: true }
      )

      await BookshelfModel.findOneAndUpdate(
        { 'lended._id': new ObjectId(lendId) },
        { $set: { 'lended.$.hasMadeRefund': true } }
      )
      if (deduction && user) {
        return true
      }

      return false
    } catch (error) {
      console.log(error)
      return false
    }
  }
}

export default AdminRepository
