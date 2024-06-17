import mongoose from "mongoose";
import { Document } from "mongoose";

interface User {
  _id?: string;
  userName: string;
  name: string;
  email: string;
  password: string;
  age?: number;
  reportCount: number;
  isSubscribed?: boolean;
  createdAt: Date;
  updateAt: Date;
  followers: { userId: mongoose.Types.ObjectId; followedOn: Date }[];
  following: { userId: mongoose.Types.ObjectId; followedOn: Date }[];
  gender: "Male" | "Female" | "Not added";
  profileUrl?: string;
  privacy: "Public" | "Private";
  about: string;
  contact: string;
  badge: string;
  isBlocked: boolean;
  isDeleted: boolean;
}

export default User;
