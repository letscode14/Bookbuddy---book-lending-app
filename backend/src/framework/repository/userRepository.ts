import IUserRepository from "../../usecases/interface/IUserRepository";
import User from "../../entity/userEntity";
import Post from "../../entity/postEntity";
import userModel, { IFollower } from "../databases/userModel";
import bcrypt from "bcryptjs";
import postModel, { IComment, IPost, IReply } from "../databases/postModel";
import { ObjectId } from "mongodb";
import { Request, response } from "express";
import reportModel from "../databases/reportsModel";
import BookshelfModel from "../databases/bookShelfModel";
import { IBookShelf, IShelf } from "../../entity/bookShelfEntity";

class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return await userModel.findOne({ email }).select("+password");
  }
  async checkUsernameValid(username: string): Promise<User | null> {
    return await userModel.findOne({ userName: username });
  }

  async createUser(
    user: User
  ): Promise<{ email: string; _id: unknown; role: string } | null> {
    try {
      const { name, userName, password, email } = user;

      const savedUser = await userModel.create({
        name,
        email,
        password,
        userName,
      });
      if (savedUser) {
        const { email, _id, role } = savedUser;
        return { email, _id, role };
      }
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async googleSignup(user: User): Promise<User | null> {
    try {
      const { name, userName, email, profileUrl } = user;
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);

      const savedUser = await userModel.create({
        name,
        userName,
        email,
        profileUrl,
        password: generatedPassword,
        isGoogleSignUp: true,
      });

      return savedUser.toObject() as User;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async loginUser(hashPass: string, password: string): Promise<boolean> {
    return bcrypt.compare(password, hashPass);
  }

  async addPost(
    id: string,
    description: string,
    images: [{ secure_url: string; publicId: string }],
    req: Request
  ): Promise<Post | unknown> {
    try {
      let bookshelf;
      if (req.body?.addToBookshelf) {
        const { author, ShelfDescription, bookName, limit, location } =
          req.body;

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
                location: location,
              },
            },
          },
          { upsert: true, new: true }
        );
      }
      const lastAddedBookId = bookshelf?.shelf[bookshelf.shelf.length - 1]
        ?._id as string;
      const savedPost = await postModel.create({
        userId: new ObjectId(id),
        description,
        imageUrls: images,
        isAddedToBookShelf: req.body?.addToBookshelf
          ? new ObjectId(lastAddedBookId)
          : false,
      });

      if (savedPost) {
        return savedPost;
      }

      return null;
    } catch (error) {
      console.log(error);
    }
  }

  async getPost(id: string): Promise<[] | null> {
    try {
      const post = (await postModel.find({
        userId: new ObjectId(id),
        isDeleted: false,
        isRemoved: false,
      })) as [];
      if (post) return post;
      else return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async getUser(id: string): Promise<{} | null> {
    try {
      const user = await userModel.findById(id).select("-password");
      if (user) {
        return user;
      }
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getSuggestion(req: Request): Promise<User[] | null> {
    try {
      const now = new Date();

      const id = req.query.id as string;
      const user = await userModel
        .findById(id)
        .populate("following.userId", "userName")
        .select("-password");
      if (!user) {
        return null;
      }

      const followersIds = user.following.map((following) => following.userId);

      if (followersIds.length == 0) {
        let suggestionForNewUser = (await userModel.find({
          _id: { $ne: new ObjectId(id) },
        })) as User[];

        shuffleArray(suggestionForNewUser as []);

        suggestionForNewUser = suggestionForNewUser.slice(0, 6);

        return suggestionForNewUser;
      }
      function shuffleArray(array: []) {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
      }

      const followingOfFollowers = await userModel.find({
        _id: { $in: followersIds },
      });

      const secondDegreeFollowerIds = new Set();
      followingOfFollowers.forEach((follower) => {
        follower.following.forEach((f) => {
          if (!followersIds.includes(f.userId)) {
            secondDegreeFollowerIds.add(f.userId.toString());
          }
        });
      });

      secondDegreeFollowerIds.delete(id);
      if (secondDegreeFollowerIds.size == 0) {
        const followersId = user.followers.map((doc) => doc.userId);

        const suggestions = (await userModel
          .find({
            _id: { $in: followersId },
          })
          .populate("followers.userId", "userName")
          .select("-password")) as User[];

        return suggestions;
      }

      const suggestions = (await userModel
        .find({
          _id: { $in: Array.from(secondDegreeFollowerIds) },
        })
        .populate("followers.userId", "userName")
        .select("-password")) as User[];

      if (suggestions) {
        return suggestions;
      }
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async followUser(req: Request): Promise<boolean> {
    try {
      const { userId, target } = req.body;

      if (!userId || !target) {
        return false;
      }

      await userModel.findByIdAndUpdate(userId, {
        $addToSet: { following: { userId: new ObjectId(target) } },
      });

      await userModel.findByIdAndUpdate(target, {
        $addToSet: { followers: { userId: new ObjectId(userId) } },
      });

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async unFollowUser(req: Request): Promise<boolean> {
    const { userId, target } = req.body;
    if (!userId || !target) {
      return false;
    }

    console.log(req.body);

    try {
      await userModel.findByIdAndUpdate(userId, {
        $pull: { following: { userId: new ObjectId(target) } },
      });

      await userModel.findByIdAndUpdate(target, {
        $pull: { followers: { userId: new ObjectId(userId) } },
      });

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async fetchPostData(id: string): Promise<[] | null> {
    try {
      if (!id) {
        throw new Error("User ID is required");
      }
      const user = (await userModel
        .findById(id)
        .populate("followers.userId", "_id")
        .populate("following.userId", "_id")
        .exec()) as User;

      const followerIds = user.followers.map((follower) => follower.userId._id);
      const followingIds = user.following.map(
        (following) => following.userId._id
      );
      const userIds = [...new Set([...followerIds, ...followingIds, user._id])];
      const posts = await postModel
        .find({ userId: { $in: userIds }, isDeleted: false, isRemoved: false })
        .populate("userId", "userName email profileUrl")
        .populate("likes", "userName")
        .populate("comments.author", "userName  profileUrl")
        .populate("comments.replies.author", "userName profileUrl")
        .sort({ createdAt: -1 })
        .exec();

      return posts.length > 0 ? (posts as []) : null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async likePost(req: Request): Promise<boolean> {
    try {
      const { postId, userId } = req.body;
      const result = await postModel.findByIdAndUpdate(
        postId,
        {
          $addToSet: { likes: userId },
        },
        { new: true }
      );
      if (result) {
        return true;
      }

      return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  async unlikePost(req: Request): Promise<boolean> {
    try {
      const { postId, userId } = req.body;
      console.log(req.body);

      const result = await postModel.findByIdAndUpdate(
        postId,
        {
          $pull: { likes: userId },
        },
        { new: true }
      );
      if (result) {
        return true;
      }
      return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async updateUserDetails(
    req: Request,
    cloudRes: { secure_url: string }
  ): Promise<boolean | null> {
    try {
      const { age, contact, email, gender, name, privacy, userName, userId } =
        req.body;
      const profileUrl = cloudRes.secure_url
        ? cloudRes.secure_url
        : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
      const updatedUser = await userModel.findByIdAndUpdate(userId, {
        age,
        contact,
        email,
        gender,
        name,
        privacy: privacy == "public" ? false : true,
        profileUrl,
      });
      if (updatedUser) {
        return true;
      }
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getPostDetails(req: Request): Promise<Post | null> {
    try {
      const { postId } = req.query;
      const post = await postModel
        .findById(postId)
        .populate<{ likes: User[] }>("likes", "userName")
        .populate("userId", "profileUrl userName")
        .populate("comments.author", "profileUrl userName")
        .populate("comments.replies.author", "profileUrl userName")
        .lean<Post>();
      if (post) {
        return post;
      }
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async addComment(req: Request): Promise<IComment | null> {
    try {
      const { postId, userId, comment } = req.body;
      const post = (await postModel.findByIdAndUpdate(
        postId,
        {
          $push: {
            comments: { author: new ObjectId(userId), content: comment },
          },
        },
        { new: true }
      )) as IPost | null;

      if (post) {
        await post.populate("comments.author", "userName profileUrl");
        const newComment = post.comments[post.comments.length - 1];
        return newComment;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async addReply(req: Request): Promise<IReply | null> {
    try {
      const { userId, commentId, content, postId } = req.body;

      const post = await postModel
        .findOneAndUpdate(
          {
            _id: postId,
            "comments._id": commentId,
          },
          {
            $push: {
              "comments.$.replies": {
                content: content,
                author: new ObjectId(userId),
              },
            },
          },
          { new: true }
        )
        .populate("comments.replies.author", "userName profileUrl");

      if (post) {
        const updatedComment = post.comments.find((comment) => {
          if (comment._id == commentId) {
            return comment;
          }
        });

        const newReply = updatedComment?.replies[
          updatedComment.replies.length - 1
        ] as IReply;

        return newReply;
      }
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async getF(req: Request): Promise<User | null> {
    try {
      const { userId, query } = req.query;

      let response;
      if (query == "followers") {
        response = (await userModel
          .findById(userId, { _id: 0, followers: 1 })
          .populate("followers.userId", "userName profileUrl name")) as User;
      } else {
        response = (await userModel
          .findById(userId, { following: 1 })
          .populate("following.userId", "userName profileUrl name")) as User;
      }

      if (response) {
        return response;
      }

      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async postReport(req: Request): Promise<boolean | null> {
    try {
      const { culprit, type, contentId, reportedBy, reason } = req.body;

      const report = await reportModel.find({
        reportedBy: reportedBy,
        targetId: contentId,
        status: { $in: ["Pending", "Reviewed"] },
      });

      if (report) {
        return null;
      }

      const reported = await reportModel.create({
        reportedBy,
        targetType: type,
        targetId: contentId,
        reason,
      });
      if (reported) {
        await userModel.findByIdAndUpdate(culprit, {
          $push: { reportCount: reported._id },
        });

        await userModel.findByIdAndUpdate(reportedBy, {
          $push: { reportsMade: reported._id },
        });
      }

      if (reported) {
        return true;
      }

      return false;
    } catch (error) {
      console.log(error);
      return false;
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
                input: "$shelf",
                as: "item",
                cond: {
                  $and: [
                    { $eq: ["$$item.isRemoved", false] },
                    { $eq: ["$$item.isDeleted", false] },
                  ],
                },
              },
            },
            userId: 1,
          },
        },
      ]);

      if (bookshelf.length) {
        return bookshelf[0];
      }
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getOneBook(bookId: string, userId: string): Promise<IShelf | null> {
    try {
      const userObjectId = new ObjectId(userId);
      const bookObjectId = new ObjectId(bookId);

      const result = await BookshelfModel.aggregate([
        {
          $match: {
            userId: userObjectId,
            "shelf._id": bookObjectId,
          },
        },
        {
          $project: {
            shelf: {
              $filter: {
                input: "$shelf",
                as: "item",
                cond: { $eq: ["$$item._id", bookObjectId] },
              },
            },
          },
        },
      ]);
      if (result[0].shelf) return result[0].shelf[0];
      else return null;
    } catch (error) {
      console.log(error);
      return null;
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
      } = req.body;

      const editedShelf = await BookshelfModel.findOneAndUpdate(
        {
          userId: new ObjectId(userId),
          "shelf._id": new ObjectId(_id),
        },
        {
          $set: {
            "shelf.$.bookName": bookName,
            "shelf.$.author": author,
            "shelf.$.location": location,
            "shelf.$.description": description,
            "shelf.$.limit": limit,
          },
        },
        { new: true }
      );

      if (editedShelf) {
        return true;
      }

      return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  async removeBook(req: Request): Promise<boolean> {
    try {
      const { shelfId, userId } = req.body;

      const updatedBookshelf = await BookshelfModel.findOneAndUpdate(
        {
          userId: new ObjectId(userId),
          "shelf._id": new ObjectId(shelfId),
        },
        {
          $set: { "shelf.$.isDeleted": true },
        },
        { new: true }
      );

      const updatedPost = await postModel.findOneAndUpdate(
        {
          isAddedToBookShelf: new ObjectId(shelfId),
          userId: new ObjectId(userId),
        },
        { $set: { isAddedToBookShelf: null } },
        { new: true }
      );

      if (updatedBookshelf && updatedPost) {
        return true;
      }

      return false;
    } catch (error) {
      console.log(error);

      return false;
    }
  }
}

export default UserRepository;
