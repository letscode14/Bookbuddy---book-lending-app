import mongoose, { Document, Model, Schema } from "mongoose";
import { config } from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
config();
//
interface IFollower {
  userId: mongoose.Types.ObjectId;
  followedOn: Date;
}

interface IUser extends Document {
  userName: string;
  name: string;
  email: string;
  password: string;
  age: number;
  reportCount: number;
  createdAt: Date;
  updateAt: Date;
  followers: IFollower[];
  following: IFollower[];
  gender: "Male" | "Female" | "Not added";
  profileUrl?: string;
  privacy: "Public" | "Private";
  about: string;
  contact: string;
  badge: string;
  isBlocked: boolean;
  isDeleted: boolean;
  isSubscribed: boolean;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    default: 0,
  },
  reportCount: {
    type: Number,
    default: 0,
  },
  isSubscribed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updateAt: {
    type: Date,
    default: Date.now(),
  },
  followers: {
    type: [
      {
        userId: {
          type: mongoose.Types.ObjectId,
        },
        followedOn: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    default: [],
  },
  following: {
    type: [
      {
        userId: {
          type: mongoose.Types.ObjectId,
        },
        followedOn: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    default: [],
  },
  gender: {
    type: String,
    default: "Not added",
    enum: ["Male", "Female", "Not added"],
  },
  profileUrl: {
    type: String,
    default: "Not Added",
  },
  privacy: {
    type: String,
    default: "Private",
    enum: ["Public", "Private"],
  },
  about: {
    type: String,
    default: "Not Added",
  },
  contact: {
    type: String,
    default: "Not Added",
  },
  badge: {
    type: String,
    default: "No badge",
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const userModel: Model<IUser> = mongoose.model("User", userSchema);

export default userModel;
