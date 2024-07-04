import { Document, Schema } from "mongoose";

export interface IShelf extends Document {
  addedOn: Date;
  author: string;
  bookName: string;
  description: string;
  ID: string;
  limit: String;
  isDeleted: boolean;
  isRemoved: boolean;
  imageUrl: {
    publicId: string;
    secure_url: string;
  };
  status: "Available" | "Lended" | "Returning";
  location: string;
}

export interface IBorrowed extends Document {
  bookId: string;
  from: Schema.Types.ObjectId;
  isReturned: boolean;
  remainingDays: Date;
}

export interface ILended extends Document {
  bookId: string;
  earnedScore: string;
  isReturned: boolean;
  lendedTo: Schema.Types.ObjectId;
  remainingDays: Date;
}

export interface IBookShelf extends Document {
  userId: Schema.Types.ObjectId;
  shelf: IShelf[];
  borrowed: IBorrowed[];
  lended: ILended[];
  isRestricted: boolean;
}
