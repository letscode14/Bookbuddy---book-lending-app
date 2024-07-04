import mongoose, { Document, Model, Mongoose, Schema } from "mongoose";
import bcrypt from "bcryptjs";
//
export interface IFollower {
  userId: mongoose.Types.ObjectId;
  followedOn: Date;
}

interface IUser extends Document {
  userName: string;
  name: string;
  email: string;
  password: string;
  age: number;
  reportCount: mongoose.Types.ObjectId[];
  reportsMade: mongoose.Types.ObjectId[];
  createdAt: Date;
  updateAt: Date;
  followers: IFollower[];
  following: IFollower[];
  gender: boolean | string;
  profileUrl?: string;
  privacy: boolean;
  about: string;
  contact: string;
  badge: string | mongoose.Types.ObjectId;
  isBlocked: boolean;

  isDeleted: boolean;
  isSubscribed: boolean;
  role: string;
  isGoogleSignUp: boolean;
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
  reportsMade: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Report",
      default: [],
    },
  ],

  reportCount: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Report",
      default: [],
    },
  ],
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
          ref: "User",
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
          ref: "User",
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
    default: "",
  },
  profileUrl: {
    type: String,

    default:
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
  },
  privacy: {
    type: Boolean,
    default: false,
  },
  about: {
    type: String,
    default: "",
  },
  contact: {
    type: String,
    default: "",
  },
  badge: {
    type: String || mongoose.Types.ObjectId,
    default: "No Badge",
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,

    default: "user",
  },
  isGoogleSignUp: {
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
