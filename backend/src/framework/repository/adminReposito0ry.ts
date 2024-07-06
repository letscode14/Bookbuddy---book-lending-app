import IAdminRepository from '../../usecases/interface/IAdminRepository'
import adminModel from '../databases/adminModel'
import Admin from '../../entity/adminEntity'
import bcrypt from 'bcryptjs'
import { Request } from 'express'
import { redis } from '../config/redis'
import User from '../../entity/userEntity'
import userModel from '../databases/userModel'

import Post from '../../entity/postEntity'
import postModel from '../databases/postModel'
import reportModel, { IReport } from '../databases/reportsModel'
import mongoose, { PipelineStage } from 'mongoose'
import { ObjectId } from 'mongodb'

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
            .limit(limit)
            .skip(skip)) as User[]
          totalCount = await userModel.countDocuments()
          totalPages = Math.ceil(totalCount / limit)
          console.log(totalCount)

          console.log(totalPages)

          return { users, totalPages }

          break
        case 'Blocked':
          users = (await userModel
            .find({ isBlocked: true })
            .select('-password')
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
      console.log(action)

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
  async getPostReports(req: Request): Promise<IReport[] | null> {
    try {
      const targetId = req.query.targetId as string

      const reports = await reportModel
        .find({
          targetId: new ObjectId(targetId),
          isRemoved: false,
        })
        .populate('reportedBy', 'userName email')

      if (reports) {
        return reports
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
      const removeReport = await reportModel
        .findByIdAndUpdate(
          rId,
          {
            $set: { isRemoved: true, status: 'Removed' },
          },
          { new: true }
        )
        .populate('targetId', 'userId')
      console.log(removeReport)

      if (removeReport) {
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

      return false
    } catch (error) {
      console.log(error)
      return false
    }
  }
}

export default AdminRepository
