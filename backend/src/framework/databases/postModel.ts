import mongoose, { Document, Model, Schema } from "mongoose";

interface ImageUrl {
  publicId: string;
  secure_url: string;
}

export interface IReply extends Document {
  content: string;
  author: mongoose.Schema.Types.ObjectId;
  likes: mongoose.Schema.Types.ObjectId[];
  createdAt: Date;
}

export interface IComment extends Document {
  content: string;
  author: mongoose.Schema.Types.ObjectId;
  likes: mongoose.Schema.Types.ObjectId[];
  replies: IReply[];
  createdAt: Date;
}

export interface IPost extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  description: string;
  imageUrls: ImageUrl[];
  updatedAt: Date;
  isAddedToBookShelf: null | mongoose.Schema.Types.ObjectId;
  comments: IComment[];
  likes: [];
  isDeleted: boolean;
  isRemoved: boolean;
}

const ReplySchema: Schema<IReply> = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  likes: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
  createdAt: { type: Date, default: Date.now },
});

const CommentSchema: Schema<IComment> = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  likes: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
  replies: { type: [ReplySchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

const postSchema: Schema<IPost> = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    required: true,
    default: "Not Added",
  },

  imageUrls: [
    {
      publicId: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
  ],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  isAddedToBookShelf: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: "BookShelf",
  },

  comments: {
    type: [CommentSchema],
    default: [],
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isRemoved: {
    type: Boolean,
    default: false,
  },
});

const postModel: Model<IPost> = mongoose.model("Post", postSchema);

export default postModel;
