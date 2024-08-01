import IUserRepository from '../../usecases/interface/IUserRepository'
import User from '../../entity/userEntity'
import Post from '../../entity/postEntity'
import userModel, { IFollower, IUser } from '../databases/userModel'
import bcrypt from 'bcryptjs'
import postModel, { IComment, IPost, IReply } from '../databases/postModel'
import { ObjectId } from 'mongodb'
import { Request } from 'express'
import reportModel from '../databases/reportsModel'
import BookshelfModel from '../databases/bookShelfModel'
import {
  IBookShelf,
  IBorrowed,
  ILended,
  IShelf,
} from '../../entity/bookShelfEntity'
import { redis } from '../config/redis'
import { IBadge, ILendscrore } from '../../entity/badgeEntity'
import BadgeModel from '../databases/badgeModel'
import LendScoreModel from '../databases/lendScoreModel'
import IChat from '../../entity/chatEntity'
import ChatModel from '../databases/chatModel'
import IMessage from '../../entity/messageEntity'
import MessageModel from '../databases/messageModel'
import notificationModel from '../databases/notificationModel'
import RequestModel from '../databases/requestModel'
import storyModel from '../databases/storyModel'
import agenda from '../config/agenda'
import IStory, { IStories } from '../../entity/storyEntity'
import mongoose, { ClientSession, set } from 'mongoose'
import { INotification } from '../../entity/notificationEntity'
import IRequest from '../../entity/requestEntity'
import { getIO } from '../services/socketService'
import deductionModel from '../databases/deductionModel'

declare module 'express-session' {
  interface SessionData {
    suggestionQueue: any[]
  }
}

export default class UserRepository implements IUserRepository {
  async findByEmailAndUserId(id: string, email: string): Promise<User | null> {
    try {
      const user = (await userModel.findOne(
        { _id: new ObjectId(id), email: email },
        {
          _id: 1,
          email: 1,
          isGoogleSignUp: 1,
          cautionDeposit: 1,
          isSubscribed: 1,
          name: 1,
          contact: 1,
        }
      )) as User
      if (user) {
        return user
      } else return null
    } catch (error) {
      console.log(error)

      return null
    }
  }
  async BlockedUser(): Promise<User[] | null> {
    try {
      const cacheKey = 'blockedUsers'
      const cachedData = await redis.get(cacheKey)

      if (cachedData) {
        return JSON.parse(cachedData)
      }

      const blockedUsers = (await userModel
        .find({ isBlocked: true })
        .select('_id')
        .lean()) as User[]

      await redis.set(cacheKey, JSON.stringify(blockedUsers), 'EX', 86400)
      return blockedUsers
    } catch (error) {
      console.log(error)
      return null
    }
  }
  async findByEmail(email: string): Promise<User | null> {
    const user = (await userModel
      .findOne({ email })
      .select('-followers -following -reportCount -reportsMade')) as User

    if (user) {
      return user
    } else {
      return null
    }
  }

  async findUserById(id: string): Promise<User | null> {
    return await userModel.findById(id).select('-password')
  }
  async checkUsernameValid(username: string): Promise<User | null> {
    return await userModel.findOne({ userName: username })
  }

  async createUser(user: User): Promise<{} | null> {
    try {
      const { name, userName, password, email } = user

      const savedUser = (await userModel.create({
        name,
        email,
        password,
        userName,
      })) as User
      if (savedUser) {
        const {
          email,
          _id,
          role,
          profile,
          isDeleted,
          isSubscribed,
          isGoogleSignUp,
          name,
          userName,
        } = savedUser

        return {
          email,
          _id,
          role,
          profile,
          isDeleted,
          isSubscribed,
          isGoogleSignUp,
          name,
          userName,
        }
      }
      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async googleSignup(user: {
    email: string
    userName: string
    name: string
    profileUrl: string
  }): Promise<User | null> {
    try {
      const { name, userName, email, profileUrl } = user
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8)

      const savedUser = await userModel.create({
        name,
        userName,
        email,
        profile: { profileUrl: profileUrl, publicId: '' },
        password: generatedPassword,
        isGoogleSignUp: true,
      })

      return savedUser.toObject() as User
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async loginUser(hashPass: string, password: string): Promise<boolean> {
    return bcrypt.compare(password, hashPass)
  }

  async addPost(
    id: string,
    description: string,
    images: [{ secure_url: string; publicId: string }],
    req: Request
  ): Promise<Post | unknown> {
    try {
      let bookshelf
      if (req.body?.addToBookshelf) {
        const {
          author,
          ShelfDescription,
          bookName,
          limit,
          location,
          address,
          lng,
          lat,
          price,
        } = req.body
        console.log(location)

        bookshelf = await BookshelfModel.findOneAndUpdate(
          { userId: new ObjectId(id) },
          {
            $push: {
              shelf: {
                author: author,
                bookName: bookName,
                description: ShelfDescription,
                imageUrl: images[0],
                limit: limit,
                location: {
                  address: address,
                  lat: lat,
                  lng: lng,
                },
                price: Number(price),
              },
            },
          },
          { upsert: true, new: true }
        )
      }

      const lastAddedBookId = bookshelf?.shelf[bookshelf.shelf.length - 1]
        ?._id as string
      const savedPost = await postModel.create({
        userId: new ObjectId(id),
        description,
        imageUrls: images,
        isAddedToBookShelf: req.body?.addToBookshelf
          ? new ObjectId(lastAddedBookId)
          : null,
      })

      if (savedPost) {
        return savedPost
      }

      return null
    } catch (error) {
      console.log(error)
    }
  }

  async getPost(id: string): Promise<[] | null> {
    try {
      const post = (await postModel.find({
        userId: new ObjectId(id),
        isDeleted: false,
        isRemoved: false,
      })) as []
      if (post) return post
      else return null
    } catch (error) {
      console.log(error)
      return null
    }
  }
  async getUser(id: string, req: Request): Promise<{} | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null
      }
      const user = await userModel
        .findById(id)
        .populate({
          path: 'lendscore',
          select: 'lendScore badgeId',
          populate: {
            path: 'badgeId',
            select: 'name iconUrl',
            model: 'Badge',
          },
        })
        .select('-password -reportsMade -reportCount')

      if (user) {
        const followersLength = user.followers.length
        const followingLength = user.following.length

        const followingMap: { [key: string]: boolean } = {}
        const followersMap: { [key: string]: boolean } = {}

        user.following.forEach((following) => {
          followingMap[following.userId.toString()] = true
        })

        user.followers.forEach((follower) => {
          followersMap[follower.userId.toString()] = true
        })
        const userObject = user.toObject()

        delete (userObject as any).following
        delete (userObject as any).followers
        const postLength = await postModel.countDocuments({
          isRemoved: false,
          isDeleted: false,
          userId: new ObjectId(id),
        })

        return {
          user: userObject,
          followersLength,
          followingLength,
          followingMap,
          followersMap,
          postLength,
        }
      }
      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async getSuggestion(req: Request): Promise<User[] | null> {
    try {
      const id = req.query.id as string
      const limit = 2

      let queue: User[] = req.session.suggestionQueue || []

      await userModel.findByIdAndUpdate(id, {
        $set: { updateAt: new Date() },
      })

      async function refillQueue() {
        const user = await userModel
          .findById(id)
          .populate('following.userId', 'userName')
          .select('-password')
        if (!user) {
          return []
        }

        const followersIds = user.following.map((following) => following.userId)

        if (followersIds.length === 0) {
          return await userModel
            .find(
              {
                _id: { $ne: new ObjectId(id) },
              },
              {
                _id: 1,
                createdAt: 1,
                isSubscribed: 1,
                profile: 1,
                userName: 1,
                name: 1,
              }
            )
            .sort({ createdAt: -1 })
        }

        const followingOfFollowers = await userModel.find({
          _id: { $in: followersIds },
        })

        const secondDegreeFollowerIds = new Set<string>()
        followingOfFollowers.forEach((follower) => {
          follower.following.forEach((f) => {
            if (!followersIds.includes(f.userId)) {
              secondDegreeFollowerIds.add(f.userId.toString())
            }
          })
        })

        secondDegreeFollowerIds.delete(id)
        if (secondDegreeFollowerIds.size === 0) {
          const followersId = user.followers.map((doc) => doc.userId)

          return await userModel.find(
            {
              _id: { $in: followersId },
            },
            {
              _id: 1,
              createdAt: 1,
              isSubscribed: 1,
              profile: 1,
              userName: 1,
              name: 1,
            }
          )
        }

        return await userModel
          .find({
            _id: { $in: Array.from(secondDegreeFollowerIds) },
          })
          .select('isSubscribed userName profile name _id')
          .populate('followers.userId', 'userName isSubscribed')
          .select('-password -followers -following')
      }

      if (queue.length === 0) {
        queue = (await refillQueue()) as User[]

        req.session.suggestionQueue = queue
      }

      const responseUsers: User[] = []
      for (let i = 0; i < limit && queue.length > 0; i++) {
        responseUsers.push(queue.pop() as User)
      }

      req.session.suggestionQueue = queue

      return responseUsers
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async followUser(req: Request): Promise<boolean> {
    try {
      const { userId, target } = req.body

      if (!userId || !target) {
        return false
      }

      const user = await userModel.findByIdAndUpdate(userId, {
        $addToSet: { following: { userId: new ObjectId(target) } },
      })

      await userModel.findByIdAndUpdate(target, {
        $addToSet: { followers: { userId: new ObjectId(userId) } },
      })
      const message = `${user?.userName} has started following you`
      await this.createNotification(target, message, 'User', userId, userId)

      return true
    } catch (error) {
      console.log(error)
      return false
    }
  }

  async unFollowUser(req: Request): Promise<boolean> {
    const { userId, target } = req.body
    if (!userId || !target) {
      return false
    }

    try {
      await userModel.findByIdAndUpdate(userId, {
        $pull: { following: { userId: new ObjectId(target) } },
      })

      await userModel.findByIdAndUpdate(target, {
        $pull: { followers: { userId: new ObjectId(userId) } },
      })

      return true
    } catch (error) {
      console.log(error)
      return false
    }
  }

  async fetchPostData(
    req: Request,
    id: string
  ): Promise<{ post: []; hasMore: boolean } | null> {
    try {
      const { pageNo } = req.query
      const limit: number = 2

      const skip: number = (Number(pageNo) - 1) * limit

      if (!id) {
        throw new Error('User ID is required')
      }
      const user = (await userModel
        .findById(id, { followers: 1, _id: 1, following: 1 })
        .populate('followers.userId', '_id')
        .populate('following.userId', '_id')
        .exec()) as User

      const followerIds = user.followers.map((follower) => follower.userId._id)

      const followingIds = user.following.map(
        (following) => following.userId._id
      )
      const userIds = [...new Set([...followingIds, user._id])]
      const totalCount = await postModel.countDocuments({
        userId: { $in: userIds },
        isDeleted: false,
        isRemoved: false,
      })

      const posts = await postModel
        .find({ userId: { $in: userIds }, isDeleted: false, isRemoved: false })
        .populate('userId', 'userName email profile isSubscribed')
        .populate('likes', 'userName')
        .populate('comments.author', 'userName  profile isSubscribed')
        .populate('comments.replies.author', 'userName profile isSubscribed')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .exec()

      const totalPage = Math.ceil(totalCount / limit)

      return posts.length > 0
        ? {
            post: posts as [],
            hasMore: Number(pageNo) == totalPage ? false : true,
          }
        : null
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async likePost(req: Request): Promise<{} | null> {
    try {
      const { postId, userId } = req.body

      const result = await postModel.findByIdAndUpdate(
        postId,

        {
          $addToSet: { likes: userId },
        },
        { new: true }
      )

      if (result) {
        await result.populate({
          path: 'likes',
          select: 'userName profile',
        })

        const postOwner = result.userId
        const imageUrl =
          result.imageUrls.length > 0 ? result.imageUrls[0].secure_url : null
        const latestLike =
          result.likes.length > 0 ? result.likes[result.likes.length - 1] : null

        const userName = result.likes[result.likes.length - 1] as {
          _id: string
          userName: string
        }
        const message = `${userName.userName} has like you post`
        if (postOwner.toString() !== userId) {
          const notification = await this.createNotification(
            postOwner.toString(),
            message,
            'Post',
            userId,
            postId
          )

          return { notification }
        } else {
          return { notification: {} }
        }
      }

      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }
  async unlikePost(req: Request): Promise<boolean> {
    try {
      const { postId, userId } = req.body

      const result = await postModel.findByIdAndUpdate(
        postId,
        {
          $pull: { likes: userId },
        },
        { new: true }
      )
      if (result) {
        return true
      }
      return false
    } catch (error) {
      console.log(error)
      return false
    }
  }

  async updateUserDetails(
    req: Request,
    cloudRes: { secure_url: string; public_id: string }
  ): Promise<boolean | null> {
    try {
      const {
        age,
        contact,
        newAdded,
        email,
        gender,
        name,
        privacy,
        userName,
        userId,
        profileUrl,
        publicId,
      } = req.body
      const defualt =
        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'

      let profile
      if (newAdded == 'true') {
        profile = {
          profileUrl: cloudRes.secure_url,
          publicId: cloudRes.public_id,
        }
      } else if (profileUrl == '') {
        profile = {
          profileUrl: defualt,
          publicId: '',
        }
      } else {
        profile = {
          profileUrl: profileUrl,
          publicId: publicId,
        }
      }

      const updatedUser = await userModel
        .findByIdAndUpdate(
          userId,
          {
            age,
            contact,
            userName,
            email,
            gender,
            name,
            privacy: privacy == 'public' ? false : true,
            profile,
          },
          { new: true }
        )
        .select('-password -followers -following')

      if (updatedUser) {
        redis.set(`user:${updatedUser._id}`, JSON.stringify(updatedUser))

        return true
      }
      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async getPostDetails(req: Request): Promise<Post | null> {
    try {
      const { postId } = req.query
      const post = await postModel
        .findOne({ _id: new ObjectId(postId?.toString()), isRemoved: false })
        .populate<{ likes: User[] }>('likes', 'userName')
        .populate('userId', 'profile userName')
        .populate('comments.author', 'profile userName')
        .populate('comments.replies.author', 'profile userName')
        .lean<Post>()
      if (post) {
        return post
      }
      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }
  async addComment(req: Request): Promise<IComment | null> {
    try {
      const { postId, userId, comment } = req.body
      const post = (await postModel.findByIdAndUpdate(
        postId,
        {
          $push: {
            comments: { author: new ObjectId(userId), content: comment },
          },
        },
        { new: true }
      )) as IPost | null

      if (post) {
        await post.populate('comments.author', 'userName profile isSubscribed')
        const newComment = post.comments[post.comments.length - 1]

        const user = post.comments[0].toObject()

        const message = `${user.author.userName} commented on your post .${comment}`
        await this.createNotification(
          post.userId.toString(),
          message,
          'Post',
          userId,
          postId
        )
        return newComment
      } else {
        return null
      }
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async addReply(req: Request): Promise<IReply | null> {
    try {
      const { userId, commentId, content, postId, authorId } = req.body

      const post = await postModel
        .findOneAndUpdate(
          {
            _id: postId,
            'comments._id': commentId,
          },
          {
            $push: {
              'comments.$.replies': {
                content: content,
                author: new ObjectId(userId),
              },
            },
          },
          { new: true }
        )
        .populate('comments.replies.author', 'userName profile isSubscribed')

      if (post) {
        const updatedComment = post.comments.find((comment) => {
          if (comment._id == commentId) {
            return comment
          }
        })

        const newReply = updatedComment?.replies[
          updatedComment.replies.length - 1
        ] as IReply
        if (newReply && newReply.author && 'userName' in newReply.author) {
          const message = `${newReply.author.userName} has commented on the Post .${content}`
          if (post.userId !== userId) {
            await this.createNotification(
              post.userId.toString(),
              message,
              'Post',
              userId,
              postId
            )
          }

          const Replymessage = `${newReply.author.userName} replied to your comment .${newReply.content}`
          await this.createNotification(
            authorId,
            Replymessage,
            'Post',
            userId,
            postId
          )
        }

        return newReply
      }
      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }
  async getF(req: Request): Promise<User | null> {
    try {
      const { userId, query, pageNo, currentUser } = req.query
      const limit = 1
      const skip = (Number(pageNo) - 1) * limit

      const data = await userModel.findById(currentUser, {
        _id: 1,
        followers: 1,
        following: 1,
      })

      const followersMapCurrent: { [key: string]: boolean } = {}
      data?.followers.map((followers: IFollower) => {
        followersMapCurrent[followers.userId.toString()] = true
      })
      const followingMap: { [key: string]: boolean } = {}

      data?.following.map((following: IFollower) => {
        followingMap[following.userId.toString()] = true
      })

      let response
      if (query == 'followers') {
        const followers = await userModel.aggregate([
          { $match: { _id: new ObjectId(userId as string) } },
          {
            $unwind: '$followers',
          },

          {
            $lookup: {
              from: 'users',
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    profile: 1,
                    name: 1,
                    userName: 1,
                  },
                },
              ],
              localField: 'followers.userId',
              foreignField: '_id',
              as: 'followers.userId',
            },
          },
          { $unwind: '$followers.userId' },
          {
            $group: {
              _id: '$_id',
              followers: { $push: '$followers' },
            },
          },

          {
            $project: {
              totalCount: { $size: '$followers' },
              followers: {
                $slice: ['$followers', skip, limit],
              },
            },
          },
        ])

        response = followers[0]
        response.totalCount = Math.ceil(response?.totalCount / limit)
        response.followingMapCurrent = followingMap
        response.followersMapCurrent = followersMapCurrent
      } else {
        const followers = await userModel.aggregate([
          { $match: { _id: new ObjectId(userId as string) } },
          {
            $unwind: '$following',
          },

          {
            $lookup: {
              from: 'users',
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    profile: 1,
                    name: 1,
                    userName: 1,
                  },
                },
              ],
              localField: 'following.userId',
              foreignField: '_id',
              as: 'following.userId',
            },
          },
          { $unwind: '$following.userId' },
          {
            $group: {
              _id: '$_id',
              following: { $push: '$following' },
            },
          },

          {
            $project: {
              totalCount: { $size: '$following' },
              following: {
                $slice: ['$following', skip, limit],
              },
            },
          },
        ])

        response = followers[0]

        response.totalCount = Math.ceil(response.totalCount / limit)
        response.followingMapCurrent = followingMap
        response.followersMapCurrent = followersMapCurrent
      }

      if (response) {
        return response
      }
      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }
  async postReport(
    req: Request,
    images: [{ secure_url: string; publicId: string }] | []
  ): Promise<boolean | null> {
    try {
      const { culprit, type, contentId, reportedBy, reason, bookAmount } =
        req.body

      if (!culprit || !type || !contentId || !reportedBy || !reason) {
        return null
      }

      const report = await reportModel.findOne({
        reportedBy: new ObjectId(reportedBy),
        targetId: new ObjectId(contentId),
        targetType: type,
        status: { $in: ['Pending', 'Reviewed'] },
        isRemoved: false,
      })

      if (report) {
        return null
      }

      if (type == 'Post') {
        await postModel.updateOne(
          { _id: contentId },
          { $inc: { reportCount: 1 } }
        )
      }

      const reported = await reportModel.create({
        reportedBy,
        targetType: type,
        targetId: contentId,
        reason,
        damageImages: images,
        bookAmount: bookAmount ? bookAmount : null,
      })

      if (type === 'Lended') {
        await BookshelfModel.findOneAndUpdate(
          { userId: new ObjectId(reportedBy), 'lended._id': contentId },
          { $push: { 'lended.$.reportsMade': reported._id } },
          { new: true }
        )
      }
      if (type == 'Borrowed') {
        await BookshelfModel.findOneAndUpdate(
          { userId: new ObjectId(reportedBy), 'borrowed._id': contentId },
          { $push: { 'borrowed.$.reportsMade': reported._id } },
          { new: true }
        )
      }

      if (reported) {
        await userModel.findByIdAndUpdate(culprit, {
          $push: { reportCount: reported._id },
        })

        await userModel.findByIdAndUpdate(reportedBy, {
          $push: { reportsMade: reported._id },
        })
      }

      if (reported) {
        return true
      }

      return false
    } catch (error) {
      console.log(error)
      return false
    }
  }
  async getBookshelf(userId: string): Promise<IBookShelf | null> {
    try {
      const bookshelf = await BookshelfModel.aggregate([
        {
          $match: {
            userId: new ObjectId(userId),
          },
        },
        {
          $project: {
            shelf: {
              $filter: {
                input: '$shelf',
                as: 'item',
                cond: {
                  $and: [
                    { $eq: ['$$item.isRemoved', false] },
                    { $eq: ['$$item.isDeleted', false] },
                  ],
                },
              },
            },
            userId: 1,
          },
        },
      ])

      if (bookshelf.length) {
        return bookshelf[0]
      }
      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async getOneBook(bookId: string, userId: string): Promise<IShelf | null> {
    try {
      const userObjectId = new ObjectId(userId)
      const bookObjectId = new ObjectId(bookId)

      const result = await BookshelfModel.aggregate([
        {
          $match: {
            userId: userObjectId,
            'shelf._id': bookObjectId,
          },
        },
        {
          $project: {
            shelf: {
              $filter: {
                input: '$shelf',
                as: 'item',
                cond: { $eq: ['$$item._id', bookObjectId] },
              },
            },
          },
        },
      ])
      if (result[0].shelf) return result[0].shelf[0]
      else return null
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async editBook(req: Request): Promise<boolean> {
    try {
      const {
        bookName,
        author,
        description,
        location,
        limit,
        ID,
        userId,
        _id,
      } = req.body

      const editedShelf = await BookshelfModel.findOneAndUpdate(
        {
          userId: new ObjectId(userId),
          'shelf._id': new ObjectId(_id),
        },
        {
          $set: {
            'shelf.$.bookName': bookName,
            'shelf.$.author': author,
            'shelf.$.location': location,
            'shelf.$.description': description,
            'shelf.$.limit': limit,
          },
        },
        { new: true }
      )

      if (editedShelf) {
        return true
      }

      return false
    } catch (error) {
      console.log(error)
      return false
    }
  }
  async removeBook(req: Request): Promise<boolean> {
    try {
      const { shelfId, userId } = req.body

      const updatedBookshelf = await BookshelfModel.findOneAndUpdate(
        {
          userId: new ObjectId(userId),
          'shelf._id': new ObjectId(shelfId),
        },
        {
          $set: { 'shelf.$.isDeleted': true },
        },
        { new: true }
      )

      const updatedPost = await postModel.findOneAndUpdate(
        {
          isAddedToBookShelf: new ObjectId(shelfId),
          userId: new ObjectId(userId),
        },
        { $set: { isAddedToBookShelf: null } },
        { new: true }
      )

      if (updatedBookshelf && updatedPost) {
        return true
      }

      return false
    } catch (error) {
      console.log(error)

      return false
    }
  }

  async checkIsSubscribed(userId: string): Promise<boolean | null> {
    try {
      const user = await userModel.findOne({
        _id: new ObjectId(userId),
        isSubscribed: true,
      })

      if (user) {
        return true
      }

      return false
    } catch (error) {
      return false
    }
  }
  async makeUserSubscribed(
    userId: string,
    paymentId: string
  ): Promise<{ badge: string; lendScore: ILendscrore } | null> {
    try {
      const badge = await BadgeModel.findOne({ minScore: { $gte: 10 } })
      if (badge) {
        const lendScore = await LendScoreModel.create({
          badgeId: new ObjectId(badge._id),
          userId: new ObjectId(userId),
          lendScore: 10,
        })
        await lendScore.populate('badgeId', 'iconUrl name')

        await userModel.findByIdAndUpdate(userId, {
          $set: {
            isSubscribed: true,
            lendscore: new ObjectId(lendScore._id),
            cautionDeposit: 1000,
            paymentId: paymentId,
          },
        })
        return {
          badge: badge.iconUrl.secureUrl,
          lendScore: lendScore,
        }
      }
      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async getChat(senderId: string, userId: string): Promise<IChat | null> {
    try {
      const chat = await ChatModel.findOne({
        participants: { $all: [senderId, userId] },
        sender: { $in: [senderId] },
        isDeleted: false,
      })

        .populate('participants', 'userName profile name isSubscribed')

      if (chat) {
        await MessageModel.updateMany(
          { chatId: new ObjectId(chat._id), senderId: new ObjectId(userId) },

          { $set: { status: true } }
        )
        return chat
      } else {
        const partChat = await ChatModel.findOne({
          participants: { $all: [senderId, userId] },
        })
        if (partChat) {
          const updatedChat = await ChatModel.findOneAndUpdate(
            {
              participants: { $all: [senderId, userId] },
            },
            { $push: { sender: new ObjectId(senderId) } },
            { new: true }
          ).populate('participants', 'userName profile name isSubscribed')
          return updatedChat
        } else {
          const newChat = await ChatModel.create({
            participants: [new ObjectId(senderId), new ObjectId(userId)],
            sender: [new ObjectId(senderId)],
            isDeleted: false,
          })
          await MessageModel.updateMany(
            {
              chatId: new ObjectId(newChat._id),
              senderId: new ObjectId(userId),
            },

            { $set: { status: true } }
          )

          await newChat.populate(
            'participants',
            'userName profile name isSubscribed'
          )

          return newChat
        }
      }
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async getAllChat(
    req: Request
  ): Promise<{ chats: IChat[]; messageMap: {} } | null> {
    try {
      const { pageNo } = req.query
      const { userId } = req.params

      const limit = 12
      const skip = (Number(pageNo) - 1) * limit

      const chats = await ChatModel.find({
        participants: { $in: [new ObjectId(userId)] },
        sender: { $in: [new ObjectId(userId)] },
        isDeleted: false,
      })
        .sort({ 'lastMessage.timeStamp': -1 })
        .limit(limit)
        .skip(skip)
        .populate('participants', 'userName profile name isSubscribed')
        .populate('lastMessage.messageId', 'content senderId type')

      if (chats) {
        const chatIds = await Promise.all(
          chats.map(async (c: IChat) => {
            if ((c.lastMessage.messageId as any)?.type == 'request') {
              await (c.lastMessage.messageId as any).populate('content')
            }
            return c._id
          })
        )

        const unReadMesg = await MessageModel.find({
          chatId: { $in: chatIds },
          senderId: { $ne: new ObjectId(userId) },
          status: false,
        })
        type Message = { mCount: number; content: string }

        const messageMap: { [key: string]: Message } = {}

        chats.forEach((chat: IChat) => {
          const unReadMessages = unReadMesg.filter(
            (m: IMessage) =>
              m.chatId !== undefined &&
              m.chatId.toString() == chat._id.toString()
          )

          if (unReadMessages[unReadMessages.length - 1]?.type == 'request') {
            messageMap[chat._id.toString()] = {
              mCount: unReadMessages.length || 0,
              content: 'Request',
            }
          } else {
            messageMap[chat._id.toString()] = {
              mCount: unReadMessages.length || 0,
              content: unReadMessages[unReadMessages.length - 1]?.content || '',
            }
          }
        })

        return {
          chats,
          messageMap,
        }
      }

      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }
  async createMessage(
    req: Request
  ): Promise<{ message: IMessage; isNewChat: boolean } | null> {
    try {
      const { senderId, chatId, content, isRequestForBook } = req.body
      console.log('body', req.body)

      let newChatfromUser = false
      const chat = await ChatModel.findById(chatId)

      if (chat) {
        const receiver = chat?.participants.find(
          (participant) => participant.toString() !== senderId
        )

        if (chat.sender.length == 1 && chat.lastMessage.messageId == null) {
          if (receiver) {
            newChatfromUser = true
            await ChatModel.findByIdAndUpdate(chatId, {
              $push: { sender: receiver },
            })
          }
        }
      }

      const message = await MessageModel.create({
        type: isRequestForBook ? 'request' : 'message',
        chatId: new ObjectId(chatId),
        senderId: new ObjectId(senderId),
        content: isRequestForBook ? new ObjectId(content) : content,
      })
      if (message) {
        await ChatModel.findByIdAndUpdate(chatId, {
          $set: {
            updatedAt: new Date().getTime(),
            lastMessage: {
              messageId: new ObjectId(message._id),
              timeStamp: new Date().getTime(),
            },
          },
        })
      }

      if (message) {
        await message.populate('chatId', 'participants senderId')

        await message.populate('senderId', 'userName profile')
        if (isRequestForBook) {
          await message.populate('content')
          await message.populate({
            path: 'content',
            populate: {
              path: 'madeBy',
              select: 'userName',
            },
          })
        }
        return { message, isNewChat: newChatfromUser }
      }

      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }
  async getAllMessages(
    chatId: string,
    pageNo: string
  ): Promise<{
    messages: IMessage[]
    hasMore: boolean
    messageMap: {}
  } | null> {
    try {
      const limit = 25
      const skip = (Number(pageNo) - 1) * limit

      const messages = await MessageModel.find({
        chatId,
        isDeleted: false,
      })
        .populate('senderId', 'userName profile')

        .sort({ timeStamp: -1 })
        .limit(limit)
        .skip(skip)
      if (messages) {
        await Promise.all(
          messages.map(async (m) => {
            if (m.type === 'request') {
              await m.populate('content')
              await m.populate({
                path: 'content',
                populate: {
                  path: 'madeBy',
                  select: 'userName',
                },
              })
            }
          })
        )
        const totalCount = await MessageModel.countDocuments({
          chatId,
          isDeleted: false,
        })

        const messageMap = messages.reduce<{ [key: string]: boolean }>(
          (acc, m: IMessage) => {
            acc[m._id] = false

            return acc
          },
          {}
        )

        const totalPage = Math.ceil(totalCount / limit)
        return {
          messageMap,
          messages,
          hasMore: Number(pageNo) == totalPage ? false : true,
        }
      }

      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async createNotification(
    userId: string,
    message: string,
    type: string,
    actionBy: string,
    contentId: string
  ): Promise<INotification | null> {
    try {
      const oldNotification = await notificationModel.findOne({
        type: type,
        content: message,
        ownerId: new ObjectId(userId),
        contentId: new ObjectId(contentId),
        actionBy: new ObjectId(actionBy),
      })

      if (oldNotification) {
        const notification = await notificationModel.findOneAndUpdate(
          {
            type: type,
            content: message,
            ownerId: new ObjectId(userId),
            contentId: new ObjectId(contentId),
            actionBy: new ObjectId(actionBy),
          },
          { $set: { createdAt: new Date() } },
          { new: true }
        )

        if (notification) {
          const modelName =
            notification.type === 'Post'
              ? 'Post'
              : notification.type == 'User'
                ? 'User'
                : notification.type == 'Request'
                  ? 'Requests'
                  : ''
          const selectFields =
            notification.type == 'Post'
              ? 'imageUrls'
              : notification.type == 'User'
                ? 'userName profile'
                : notification.type == 'Request'
                  ? ''
                  : ''
          await notification.populate({
            path: 'contentId',
            model: modelName,
            select: selectFields,
          })
          await notification.populate({
            path: 'actionBy',
            model: 'User',
            select: 'userName profile',
          })
          return notification
        }
        return null
      } else {
        const notification = await notificationModel.create({
          type: type,
          content: message,
          ownerId: new ObjectId(userId),
          contentId: new ObjectId(contentId),
          actionBy: new ObjectId(actionBy),
        })
        if (notification) {
          const modelName =
            notification.type === 'Post'
              ? 'Post'
              : notification.type == 'User'
                ? 'User'
                : notification.type == 'Request'
                  ? 'Requests'
                  : ''
          const selectFields =
            notification.type == 'Post'
              ? 'imageUrls'
              : notification.type == 'User'
                ? 'userName profile'
                : notification.type == 'Request'
                  ? ''
                  : ''
          await notification.populate({
            path: 'contentId',
            model: modelName,
            select: selectFields,
          })
          await notification.populate({
            path: 'actionBy',
            model: 'User',
            select: 'userName profile',
          })
          return notification
        }
        return null
      }
    } catch (error) {
      console.log(error)
      return null
    }
  }
  async makeMsgRead(messageId: string): Promise<boolean> {
    try {
      console.log(messageId)

      const updatedMsg = await MessageModel.findByIdAndUpdate(
        messageId,
        {
          $set: { status: true },
        },
        { new: true }
      )
      if (updatedMsg) {
        return true
      }
      return false
    } catch (error) {
      console.log(error)
      return false
    }
  }

  async makeRequest(req: Request): Promise<
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
  > {
    try {
      const { userId, bookId, ownerId } = req.query as {
        userId: string
        bookId: string
        ownerId: string
      }

      const user = (await userModel
        .findOne({
          _id: new ObjectId(userId?.toString()),
        })
        .populate('lendscore')
        .select(
          '-password -following -followers -reportsMade -reportCount'
        )) as User

      if (user.isSubscribed == false) {
        return {
          status: false,
          message: 'You have to subscribe to do this action',
        }
      }

      if (user.isSubscribed && user.cautionDeposit < 50) {
        return {
          status: false,
          message:
            'Your caution deposit have exceeded please do the payment for further actions',
        }
      }
      const bookshelf = await BookshelfModel.findOne({
        userId: new ObjectId(ownerId?.toString()),
        'shelf._id': new ObjectId(bookId?.toString()),
      })

      let book

      if (bookshelf?.isRestricted) {
        return {
          status: false,
          message: 'You restricted to  access bookshelf features ',
        }
      }

      if (bookshelf) {
        book = bookshelf.shelf.find((s: IShelf) => s._id == bookId) as IShelf
        if (book?.status !== 'Available') {
          return {
            status: false,
            message: 'Book is not available at this time',
          }
        }
      }

      const request = await RequestModel.findOne({
        'book._id': new ObjectId(bookId?.toString()),
        stage: { $in: ['collect', 'approved', 'times up', 'requested'] },
        isPending: true,
      })

      if (request) {
        return {
          status: false,
          message: 'You already have a request on this book',
        }
      }

      const newRequest = await RequestModel.create({
        madeBy: new ObjectId(userId?.toString()),
        book: book,
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      })
      console.log('new request', newRequest)

      const runAt = new Date(Date.now() + 30 * 1000)

      await agenda.schedule(runAt, 'requestExpiry', {
        requestId: newRequest._id.toString(),
      })
      if (newRequest) {
        const message = `${user.userName} has requested for book`
        const notification = await this.createNotification(
          ownerId,
          message,
          'Requests',
          userId,
          newRequest._id
        )
        const io = getIO()
        if (io) {
          io.to(ownerId).emit('newnotification', {
            notification,
          })
        }

        const chat = await ChatModel.findOne({
          participants: { $all: [ownerId, userId] },
          sender: { $in: [userId, ownerId] },
          isDeleted: false,
        })

        if (chat) {
          return {
            status: true,
            book: book ? book : null,
            requestedUser: {
              userName: user?.userName,
              profileUrl: user?.profile as string,
              requestId: newRequest._id.toString(),
              chatId: chat._id.toString(),
            },
          }
        } else {
          const newChat = await ChatModel.create({
            participants: [new ObjectId(userId), new ObjectId(ownerId)],
            sender: [new ObjectId(userId), new ObjectId(ownerId)],
            isDeleted: false,
          })

          return {
            status: true,
            book: book ? book : null,
            requestedUser: {
              userName: user?.userName,
              profileUrl: user?.profile as string,
              requestId: newRequest._id.toString(),
              chatId: newChat._id.toString(),
            },
          }
        }
      }

      return {
        status: false,
        message: 'Unexpected error occured',
      }
    } catch (error) {
      console.log(error)
      return {
        status: false,
        message: 'internal server error',
      }
    }
  }
  async declineRequest(req: Request): Promise<IMessage | null> {
    const { senderId, requestId, messageId, chatId } = req.body

    try {
      const request = await RequestModel.findByIdAndUpdate(requestId, {
        $set: { stage: 'declined', isCancelled: true, isPending: false },
      })

      const newMessage = (await MessageModel.create({
        type: 'request',
        chatId: new ObjectId(chatId),
        senderId: new ObjectId(senderId),
        content: new ObjectId(requestId),
      })) as IMessage

      if (newMessage) {
        await newMessage.populate('chatId', 'participants senderId')

        await newMessage.populate('senderId', 'userName profile')
        await newMessage.populate('content')
        await newMessage.populate({
          path: 'content',
          populate: {
            path: 'madeBy',
            select: 'userName',
          },
        })

        await ChatModel.findByIdAndUpdate(chatId, {
          $set: {
            'lastMessage.messageId': new ObjectId(newMessage?._id),
            'lastMessage.timeStamp': new Date().getTime(),
          },
        })
        const { userName } = newMessage.senderId as { userName: string }
        const message = `${userName} has declined your request`
        if (request) {
          const notification = await this.createNotification(
            request?.madeBy.toString(),
            message,
            'Requests',
            senderId,
            request._id.toString()
          )
          const io = getIO()
          if (io) {
            io.to(request.madeBy.toString()).emit('newnotification', {
              notification,
            })
          }
        }

        await agenda.cancel({ 'data.requestId': requestId })
        return newMessage
      }
      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async addStory(
    userId: string,
    imageUrls: { secure_url: string; public_id: string }
  ): Promise<{} | null> {
    try {
      const story = await storyModel
        .findOneAndUpdate(
          {
            userId: new ObjectId(userId),
          },
          {
            $push: {
              stories: { imageUrl: imageUrls },
            },
          },
          { new: true, upsert: true }
        )
        .lean()

      if (story && story.stories.length > 0) {
        const latestStory = story.stories[story.stories.length - 1]
        const runAt = new Date(Date.now() + 2 * 60 * 60 * 1000)
        await agenda.schedule(runAt, 'removeStory', {
          userId: userId,
          storyId: latestStory._id,
        })
        return latestStory
      } else {
        return null
      }
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async removeStory(userId: string, id: string): Promise<boolean> {
    try {
      console.log('remove story called')

      const stories = await storyModel.findOneAndUpdate(
        {
          userId: new ObjectId(userId),
        },
        {
          $pull: { stories: { _id: new ObjectId(id) } },
        }
      )
      if (stories) {
        return true
      }
      return false
    } catch (error) {
      console.log(error)
      return false
    }
  }

  async getStories(
    req: Request
  ): Promise<{ stories: IStory[]; hasMore: boolean } | null> {
    try {
      const { userId, pageNo } = req.query
      const limit: number = 6
      const skip: number = (Number(pageNo) - 1) * limit
      const user = (await userModel
        .findById(userId)
        .populate('following.userId', '_id')
        .exec()) as User

      const followingIds = user.following.map(
        (following) => following.userId._id
      )
      const u = new ObjectId(user._id)

      const stories = await storyModel
        .find({
          userId: { $in: [...followingIds] },
          stories: { $ne: [] },
        })
        .sort({ 'stories.addedOn': -1 })
        .populate('userId', 'userName profile')
        .limit(limit)
        .skip(skip)
        .exec()
      let ownStorie = await storyModel
        .findOne({
          userId: u,
        })
        .populate('userId', 'userName profile')

      if (!ownStorie) {
        ownStorie = await storyModel
          .findOneAndUpdate(
            {
              userId: u,
            },
            {},
            { new: true }
          )
          .populate('userId', 'userName profile')
      }
      const updatedStories = [ownStorie, ...stories] as IStory[]

      const totalCount = await storyModel.countDocuments({
        userId: { $in: [u, ...followingIds] },
        stories: { $ne: [] },
      })

      const totalPage = Math.ceil(totalCount / limit)

      if (stories) {
        return {
          stories: updatedStories,
          hasMore: Number(pageNo) == totalPage ? false : true,
        }
      }
      return null
    } catch (error) {
      console.log(error)

      return null
    }
  }

  async makeStoryViewed(storyId: string, userId: string): Promise<boolean> {
    try {
      const uStory = await storyModel.findOneAndUpdate(
        {
          'stories._id': new ObjectId(storyId),
        },
        {
          $set: {
            [`stories.$.views.${userId}`]: true,
          },
        },
        {
          new: true,
        }
      )
      if (uStory) {
        return true
      }

      return false
    } catch (error) {
      console.log(error)
      return false
    }
  }
  async makeRequestExpirey(requestId: string): Promise<boolean> {
    try {
      const updatedRequets = await RequestModel.findByIdAndUpdate(requestId, {
        $set: { stage: 'expired', isCancelled: true, isPending: false },
      })

      if (updatedRequets) {
        return true
      }
      return false
    } catch (error) {
      console.log(error)
      return false
    }
  }

  async acceptRequest(
    req: Request
  ): Promise<{ message: IMessage | string; status: boolean }> {
    try {
      function calculateKeepingTime(limitDays: number) {
        const currentDate = new Date()
        const futureDate = new Date(currentDate)
        futureDate.setDate(currentDate.getDate() + limitDays)

        return futureDate
      }
      const { requestId, userId, requestedUser, messageId, chatId } = req.body

      const reqUser = await userModel
        .findById(requestedUser)
        .select('-password -following -followers -reportsMade -reportCount')

      if (!reqUser?.isSubscribed) {
        return {
          status: false,
          message: 'This user is not verified',
        }
      }
      if (reqUser?.isSubscribed && reqUser.cautionDeposit < 50) {
        return {
          status: false,
          message: 'This user is restricted',
        }
      }

      const request = await RequestModel.findById(requestId)
      if (request?.stage !== 'requested') {
        return {
          status: false,
          message: 'This request is not valid',
        }
      }

      const requestUserBookshelf = await BookshelfModel.findOne({
        userId: new ObjectId(requestedUser),
      })
      if (requestUserBookshelf) {
        if (requestUserBookshelf && requestUserBookshelf.isRestricted) {
          return {
            status: false,
            message: 'This user is restricted to have transactions',
          }
        }
      }

      const { limit, _id } = request.book as IShelf
      console.log(limit)

      const bookshelf = await BookshelfModel.findOne({
        userId: new ObjectId(userId),
        'shelf._id': new ObjectId(_id),
      })

      const b = bookshelf?.shelf.find(
        (book: IShelf) => book && book._id.toString() == _id
      )
      if (b?.isDeleted) {
        return {
          status: false,
          message: 'This book is deleted  by you',
        }
      }
      if (b?.isRemoved) {
        return {
          status: false,
          message:
            'This book has removed by our team please contact admin for futher ',
        }
      }

      const lendScore = await LendScoreModel.findOne({
        userId: new ObjectId(userId),
      }).populate('badgeId')

      if (lendScore) {
        const { limit } = lendScore?.badgeId as IBadge
        if (lendScore?.totalBooksLended >= limit) {
          return {
            status: false,
            message: 'You have reached  your lending limit',
          }
        }
      }

      const keepingTime = calculateKeepingTime(Number(limit))
      const session: ClientSession = await mongoose.startSession()
      try {
        session.startTransaction()

        const borrowed = await BookshelfModel.findOneAndUpdate(
          { userId: new ObjectId(requestedUser) },
          {
            $push: {
              borrowed: {
                requestId: new ObjectId(requestId),
                from: new ObjectId(userId),
                keepingTime: keepingTime,
                remainingDays: limit,
              },
            },
          },
          { upsert: true, session, new: true }
        )

        const lendeded = await BookshelfModel.findOneAndUpdate(
          { userId: new ObjectId(userId) },
          {
            $push: {
              lended: {
                requestId: new ObjectId(requestId),
                lendedTo: new ObjectId(requestedUser),
                earnedScore: 10,
                keepingTime: keepingTime,
                remainingDays: limit,
              },
            },
          },
          { upsert: true, session, new: true }
        )
        await BookshelfModel.findOneAndUpdate(
          { userId: new ObjectId(userId), 'shelf._id': new ObjectId(_id) },

          {
            $set: {
              'shelf.$.status': 'Lended',
            },
          },
          { upsert: true, session }
        )

        await LendScoreModel.findOneAndUpdate(
          { userId: new ObjectId(userId) },
          { $inc: { totalBooksLended: 1, lendScore: 10 } },
          { session, new: true }
        )

        await LendScoreModel.findOneAndUpdate(
          { userId: new ObjectId(requestedUser) },
          { $inc: { totalBooksBorrowed: 1 } },
          { session }
        )

        await RequestModel.findByIdAndUpdate(
          requestId,
          { $set: { stage: 'approved', isAccepted: true } },
          { session }
        )

        const createdMessages = await MessageModel.create(
          [
            {
              type: 'request',
              chatId: new ObjectId(chatId),
              senderId: new ObjectId(userId),
              content: new ObjectId(requestId),
            },
          ],
          { session }
        )

        const newMessage = createdMessages[0]

        if (newMessage) {
          await newMessage.populate('chatId', 'participants senderId')

          await newMessage.populate('senderId', 'userName profile')

          await newMessage.populate('content')
          await newMessage.populate({
            path: 'content',
            populate: {
              path: 'madeBy',
              select: 'userName',
            },
          })

          await ChatModel.findByIdAndUpdate(
            chatId,
            {
              $set: {
                'lastMessage.messageId': new ObjectId(newMessage._id),
                'lastMessage.timeStamp': new Date().getTime(),
              },
            },
            { session }
          )
        }
        const borrowId = borrowed.borrowed[borrowed.borrowed.length - 1]._id
        const lendedId = lendeded.lended[lendeded.lended.length - 1]._id

        await session.commitTransaction()
        const { userName } = newMessage.senderId as { userName: string }
        const message = `${userName} has accepted the request for book`
        const notification = await this.createNotification(
          requestedUser,
          message,
          'Requests',
          userId,
          requestId
        )
        const io = getIO()
        if (io) {
          io.to(requestedUser).emit('newnotification', {
            notification,
          })
        }
        await agenda.every('*/20 * * * * *', 'updateRemainingDays', {
          borrowId: borrowId && borrowId.toString(),
          lendedId: lendedId && lendedId.toString(),
        })
        await agenda.cancel({ 'data.requestId': requestId })
        return { status: true, message: newMessage }
      } catch (error) {
        console.error(error)
        await session.abortTransaction()
        throw error
      } finally {
        await session.endSession()
      }
    } catch (error) {
      console.log(error)
      return {
        status: false,
        message: "can't process the request right now",
      }
    }
  }

  async getLendedBooks(
    userId: string,
    pageNo: number
  ): Promise<{ hasMore: boolean; lended: ILended[] } | null> {
    try {
      const limit = 8
      const startIndex = (pageNo - 1) * limit
      const result = await BookshelfModel.aggregate([
        { $match: { userId: new ObjectId(userId) } },

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
          $project: {
            _id: 1,
            userId: 1,
            'lended._id': 1,
            'lended.requestId': 1,
            'lended.earnedScore': 1,
            'lended.isReturned': 1,
            'lended.remainingDays': 1,
            'lended.keepingTime': 1,
            'lended.lUser._id': 1,
            'lended.lUser.userName': 1,
            'lended.lUser.profile': 1,
            'lended.requestDetails': 1,
            'lended.lendedOn': 1,
            'lended.hasMadeRefund': 1,
          },
        },

        { $skip: startIndex },
        { $limit: limit },

        {
          $group: {
            _id: '$_id',
            userId: { $first: '$userId' },
            lended: { $push: '$lended' },
          },
        },

        {
          $project: {
            _id: 0,
            userId: 1,
            lended: 1,
          },
        },
      ])

      const totalCountResult = await BookshelfModel.aggregate([
        { $match: { userId: new ObjectId(userId) } },
        { $unwind: '$lended' },
        { $count: 'totalCount' },
      ])

      if (result.length > 0) {
        const totalCount =
          totalCountResult.length > 0 ? totalCountResult[0].totalCount : 0
        return {
          lended: result[0].lended,
          hasMore: Math.ceil(totalCount / limit) == pageNo ? false : true,
        }
      }
      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async getBorrowedBooks(
    userId: string,
    pageNo: number
  ): Promise<{ hasMore: boolean; borrowed: IBorrowed[] } | null> {
    try {
      const limit = 8
      const startIndex = (pageNo - 1) * limit
      const result = await BookshelfModel.aggregate([
        { $match: { userId: new ObjectId(userId) } },

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
          $project: {
            _id: 1,
            userId: 1,
            'borrowed._id': 1,
            'borrowed.requestId': 1,
            'borrowed.from': 1,
            'borrowed.isReturned': 1,
            'borrowed.remainingDays': 1,
            'borrowed.keepingTime': 1,
            'borrowed.lUser._id': 1,
            'borrowed.lUser.userName': 1,
            'borrowed.lUser.profile': 1,
            'borrowed.requestDetails': 1,
            'borrowed.borrowedOn': 1,
          },
        },

        { $skip: startIndex },
        { $limit: limit },

        {
          $group: {
            _id: '$_id',
            userId: { $first: '$userId' },
            borrowed: { $push: '$borrowed' },
          },
        },

        {
          $project: {
            _id: 0,
            userId: 1,
            borrowed: 1,
          },
        },
      ])

      const totalCountResult = await BookshelfModel.aggregate([
        { $match: { userId: new ObjectId(userId) } },
        { $unwind: '$borrowed' },
        { $count: 'totalCount' },
      ])

      if (result.length > 0) {
        const totalCount =
          totalCountResult.length > 0 ? totalCountResult[0].totalCount : 0
        return {
          borrowed: result[0].borrowed,
          hasMore: Math.ceil(totalCount / limit) == pageNo ? false : true,
        }
      }
      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async updateRemainingDays(
    borrowId: string,
    lendedId: string
  ): Promise<{ status: string; message: IMessage | string }> {
    try {
      await BookshelfModel.updateOne(
        {
          'lended._id': new ObjectId(lendedId),
        },
        { $inc: { 'lended.$.remainingDays': -1 } }
      )

      await BookshelfModel.updateOne(
        {
          'borrowed._id': new ObjectId(borrowId),
        },
        { $inc: { 'borrowed.$.remainingDays': -1 } }
      )

      const lendedDoc = await BookshelfModel.findOne(
        { 'lended._id': new ObjectId(lendedId) },
        { 'lended.$': 1, userId: 1 }
      )

      if (lendedDoc && lendedDoc.lended && lendedDoc.lended.length > 0) {
        const lended = lendedDoc.lended[0]
        if (lended.remainingDays === 2) {
          const message = `Two days remaining for the book you lended`
          const notification = await this.createNotification(
            lended.lendedTo.toString(),
            message,
            'Requests',
            lendedDoc.userId.toString(),
            lended.requestId.toString()
          )
          const io = getIO()
          if (io)
            io.to(lended.lendedTo.toString()).emit('newnotification', {
              notification,
            })
          console.log(
            `Lended document with ID ${lendedId} has only 2 days remaining.`
          )
        } else if (lended.remainingDays <= 0) {
          await agenda.cancel({
            'data.lendedId': lendedId,
            'data.borrowId': borrowId,
          })
          const request = await RequestModel.findByIdAndUpdate(
            lended.requestId,
            { $set: { isPending: false } }
          )

          const newRequest = await RequestModel.create({
            madeBy: new ObjectId(request?.madeBy),
            book: request?.book,
            expiresAt: request?.expiresAt,
            stage: 'times up',
            isAccepted: true,
            isCancelled: false,
          })

          const user = await BookshelfModel.findOneAndUpdate(
            { 'lended._id': new ObjectId(lendedId) },
            { $set: { 'lended.$.requestId': new ObjectId(newRequest._id) } },
            { new: true, projection: { userId: 1 } }
          )

          await BookshelfModel.updateOne(
            {
              'borrowed._id': new ObjectId(borrowId),
            },
            { $set: { 'borrowed.$.requestId': new ObjectId(newRequest._id) } }
          )
          const chatId = await ChatModel.findOne({
            participants: {
              $all: [
                new ObjectId(user?.userId.toString()),
                new ObjectId(request?.madeBy.toString()),
              ],
            },
          })
          const newMessage = await MessageModel.create({
            type: 'request',
            chatId: new ObjectId(chatId?._id),
            senderId: new ObjectId(user?.userId.toString()),
            content: new ObjectId(newRequest?._id),
          })
          if (newMessage) {
            await newMessage.populate('chatId', 'participants senderId')

            await newMessage.populate('senderId', 'userName profile')
            await newMessage.populate('content')
            await newMessage.populate({
              path: 'content',
              populate: {
                path: 'madeBy',
                select: 'userName',
              },
            })

            await ChatModel.findByIdAndUpdate(chatId, {
              $set: {
                'lastMessage.messageId': new ObjectId(newMessage?._id),
                'lastMessage.timeStamp': new Date().getTime(),
              },
            })
            const message = `Time to give back the book`
            const notification = await this.createNotification(
              newRequest.madeBy.toString(),
              message,
              'Requests',
              user?.userId ? user?.userId.toString() : '',
              newRequest._id
            )
            const io = getIO()
            if (io) {
              io.to(newRequest.madeBy.toString()).emit(
                'message recieved',
                newMessage
              )
              io.to(newRequest.madeBy.toString()).emit('newnotification', {
                notification,
              })
            }

            console.log(
              `Lended document with ID ${lendedId} has reached zero days. Time up.`
            )
          }
        }
      }

      return {
        status: 'false',
        message: '',
      }
    } catch (error) {
      console.log(error)
      return {
        status: 'error',
        message: '',
      }
    }
  }
  async getNotifications(
    userId: string,
    pageNo: number,
    unRead: boolean
  ): Promise<{ hasMore: boolean; notifications: INotification[] } | null> {
    try {
      const limit = 10
      const skip = (Number(pageNo) - 1) * limit
      if (unRead) {
        const notification = await notificationModel
          .find({
            ownerId: new ObjectId(userId),
            read: false,
          })
          .sort({
            createdAt: -1,
          })

        if (notification) {
          return { hasMore: false, notifications: notification }
        }
      } else {
        await notificationModel.updateMany(
          { ownerId: new ObjectId(userId) },
          { read: true }
        )
        const totalCount = await notificationModel.countDocuments({
          ownerId: new ObjectId(userId),
        })
        const noti = await notificationModel
          .find({
            ownerId: new ObjectId(userId),
          })
          .populate({
            path: 'actionBy',
            model: 'User',
            select: 'userName profile',
          })
          .limit(limit)
          .skip(skip)
          .sort({ createdAt: -1 })

        for (const notification of noti) {
          const selectFields =
            notification.type === 'Post'
              ? 'imageUrls'
              : notification.type == 'User'
                ? 'name userName profile'
                : notification.type == 'Requests'
                  ? ''
                  : 'text'
          const model =
            notification.type == 'Post'
              ? 'Post'
              : notification.type == 'User'
                ? 'User'
                : notification.type == 'Requests'
                  ? 'Requests'
                  : ''
          await notification.populate({
            path: 'contentId',
            model: model,
            select: selectFields,
          })
        }
        const totalPage = Math.ceil(totalCount / limit)

        return {
          notifications: noti,
          hasMore: Number(pageNo) == totalPage ? false : true,
        }
      }

      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async giveBookBack(req: Request): Promise<IMessage | null> {
    try {
      const { userId, requestId, sendTo, borrowId } = req.body
      const request = await RequestModel.findByIdAndUpdate(
        requestId,
        {
          $set: { isPending: false },
        },
        { new: true }
      )

      const newCollectRequest = await RequestModel.create({
        madeBy: new ObjectId(request?.madeBy),
        book: request?.book,
        expiresAt: request?.expiresAt,
        stage: 'collect',
        isAccepted: true,
        isCancelled: false,
      })
      await BookshelfModel.findOneAndUpdate(
        {
          userId: new ObjectId(userId),
          'borrowed._id': new ObjectId(borrowId),
        },
        { $set: { 'borrowed.$.requestId': newCollectRequest._id } }
      )
      await BookshelfModel.findOneAndUpdate(
        {
          userId: new ObjectId(sendTo),
          'lended.requestId': new ObjectId(requestId),
        },
        { $set: { 'lended.$.requestId': newCollectRequest._id } }
      )
      const chatId = await ChatModel.findOne({
        participants: { $all: [new ObjectId(userId), new ObjectId(sendTo)] },
      })
      const newMessage = await MessageModel.create({
        type: 'request',
        chatId: new ObjectId(chatId?._id),
        senderId: new ObjectId(userId),
        content: new ObjectId(newCollectRequest?._id),
      })
      if (newMessage) {
        await newMessage.populate('chatId', 'participants senderId')

        await newMessage.populate('senderId', 'userName profile')
        await newMessage.populate('content')
        await newMessage.populate({
          path: 'content',
          populate: {
            path: 'madeBy',
            select: 'userName',
          },
        })

        await ChatModel.findByIdAndUpdate(chatId, {
          $set: {
            'lastMessage.messageId': new ObjectId(newMessage?._id),
            'lastMessage.timeStamp': new Date().getTime(),
          },
        })
        return newMessage
      }
      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }
  async collectBook(req: Request): Promise<IMessage | null> {
    try {
      const { requestId, userId, requestedUser, messageId, chatId } = req.body
      console.log(req.body)
      console.log(requestId)

      const request = (await RequestModel.findByIdAndUpdate(requestId, {
        stage: 'transaction complete',
        isPending: false,
      })) as IRequest
      if (request) {
        const session: ClientSession = await mongoose.startSession()
        try {
          session.startTransaction()
          const ownerBookShelf = await BookshelfModel.findOneAndUpdate(
            {
              'lended.requestId': new ObjectId(requestId),
              'shelf._id': new ObjectId(request.book._id),
            },
            {
              $set: {
                'shelf.$.status': 'Available',
              },
            },
            { session, new: true }
          )
          await BookshelfModel.findOneAndUpdate(
            {
              'lended.requestId': new ObjectId(requestId),
            },
            {
              $set: {
                'lended.$.isReturned': true,
              },
            },
            { session, new: true }
          )

          const requestedUserShelf = await BookshelfModel.findOneAndUpdate(
            {
              userId: new ObjectId(requestedUser),
              'borrowed.requestId': new ObjectId(request._id),
            },
            { $set: { 'borrowed.$.isReturned': true } },
            { session }
          )
          const createdMessages = await MessageModel.create(
            [
              {
                type: 'request',
                chatId: new ObjectId(chatId),
                senderId: new ObjectId(userId),
                content: new ObjectId(request._id),
              },
            ],
            { session }
          )
          const newMessage = createdMessages[0]

          if (newMessage) {
            await newMessage.populate('chatId', 'participants senderId')

            await newMessage.populate('senderId', 'userName profile')

            await newMessage.populate('content')
            await newMessage.populate({
              path: 'content',
              populate: {
                path: 'madeBy',
                select: 'userName',
              },
            })

            await ChatModel.findByIdAndUpdate(
              chatId,
              {
                $set: {
                  'lastMessage.messageId': new ObjectId(newMessage._id),
                  'lastMessage.timeStamp': new Date().getTime(),
                },
              },
              { session }
            )
          }
          await session.commitTransaction()
          return newMessage
        } catch (error) {
          console.log(error)
          await session.abortTransaction()
        } finally {
          await session.endSession()
        }
      }

      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }
  async searchUsers(
    query: string,
    pageNo: number,
    user: string
  ): Promise<{ users: User[]; hasMore: boolean } | null> {
    if (!query || pageNo < 1) {
      return null
    }

    try {
      const limit = 1
      const skip = (pageNo - 1) * limit

      const pipeline = [
        {
          $search: {
            index: 'default',
            text: {
              query: query,
              path: ['userName', 'name'],
              fuzzy: {
                maxEdits: 2,
                prefixLength: 1,
              },
            },
          },
        },
        {
          $match: {
            _id: { $ne: new ObjectId(user) },
          },
        },
        {
          $facet: {
            users: [
              { $skip: skip },
              { $limit: limit },
              {
                $project: {
                  userName: 1,
                  name: 1,
                  profile: 1,
                  _id: 1,
                  isSubscribed: 1,
                },
              },
            ],
            totalCount: [{ $count: 'count' }],
          },
        },
        {
          $project: {
            users: 1,
            hasMore: {
              $gt: [{ $arrayElemAt: ['$totalCount.count', 0] }, limit + skip],
            },
          },
        },
      ]

      const result = await userModel.aggregate(pipeline)

      if (result.length === 0) {
        return { users: [], hasMore: false }
      }

      const { users, hasMore } = result[0]

      return {
        users: users,
        hasMore: hasMore,
      }
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async exploreBooks(
    userId: string
  ): Promise<{ books: IShelf[]; hasMore: boolean } | null> {
    try {
      const user = await userModel.findById(userId, {
        following: 1,
        followers: 1,
      })
      if (user) {
        const followingUserIds = user.following.map((followingUser) =>
          followingUser.userId.toString()
        )
        const followerUserIds = user.followers.map((followerUser) =>
          followerUser.userId.toString()
        )
        const allUserIds = [
          ...new Set([...followingUserIds, ...followerUserIds]),
        ].map((id) => new ObjectId(id))

        const bookshelf = await BookshelfModel.aggregate([
          { $match: { userId: { $in: allUserIds } } },
          { $unwind: '$shelf' },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'shelf.userData',
            },
          },
          { $unwind: '$shelf.userData' },
          {
            $project: {
              _id: 1,
              'shelf._id': 1,
              'shelf.author': 1,
              'shelf.bookName': 1,
              'shelf.description': 1,
              'shelf.imageUrl': 1,
              'shelf.limit': 1,
              'shelf.isDeleted': 1,
              'shelf.status': 1,
              'shelf.location': 1,
              'shelf.addedOn': 1,
              'shelf.ID': 1,
              'shelf.isRemoved': 1,
              'shelf.userData': {
                _id: '$shelf.userData._id',
                userName: '$shelf.userData.userName',
                profile: '$shelf.userData.profile',
              },
            },
          },
        ])

        if (bookshelf) {
          return { books: bookshelf, hasMore: false }
        }
      }
      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async checkOldPassword(
    password: string,
    userId: string
  ): Promise<User | null> {
    try {
      const user = (await userModel.findById(userId, {
        password: 1,
        email: 1,
        isGoogleSignUp: 1,
      })) as User

      if (user) {
        const isValid = await bcrypt.compare(password, user.password)
        if (isValid) {
          return user
        }
      }
      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async changePassWord(password: string, email: string): Promise<User | null> {
    try {
      const hashedPassword = await bcrypt.hash(password, 10)
      const user = (await userModel.findOneAndUpdate(
        { email: email },
        { $set: { password: hashedPassword } },
        { new: true, projection: { username: 1, _id: 0 } }
      )) as User
      if (user) {
        return user
      }
      return null
    } catch (error) {
      console.log(error)
      return null
    }
  }
  async getDeposit(req: Request): Promise<{
    cautionDeposit: number
    recentDeduction: [{ amount: number; note: string; date: string }] | []
  }> {
    try {
      const { userId } = req.query as { userId: string }
      const user = await userModel.findById(userId, { cautionDeposit: 1 })

      const deductions = await deductionModel.findOne({
        userId: new ObjectId(userId),
      })

      if (user) {
        return {
          cautionDeposit: user.cautionDeposit,
          recentDeduction: deductions?.deductions ? deductions.deductions : [],
        }
      }
      return { cautionDeposit: 0, recentDeduction: [] }
    } catch (error) {
      return { cautionDeposit: 0, recentDeduction: [] }
    }
  }

  async updateCautionDeposit(userId: string, amount: number): Promise<boolean> {
    try {
      const user = await userModel.findByIdAndUpdate(userId, {
        $inc: { cautionDeposit: amount },
      })
      if (user) {
        return true
      } else {
        return false
      }
    } catch (error) {
      console.log(error)
      return false
    }
  }
}
