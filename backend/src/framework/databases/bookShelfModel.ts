import mongoose, { Document, Model, Schema, Types } from 'mongoose'
import shortId from 'shortid'
import IRequest from '../../entity/requestEntity'

import {
  IBookShelf,
  IBorrowed,
  ILended,
  IShelf,
} from '../../entity/bookShelfEntity'

const ShelfSchema: Schema<IShelf> = new mongoose.Schema({
  addedOn: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: String,
    required: true,
  },
  bookName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  ID: {
    type: String,
    default: () => `BOOK${shortId.generate()}`,
  },
  imageUrl: {
    type: {
      publicId: { type: String, required: true },
      secure_url: { type: String, required: true },
    },
    requiured: true,
  },
  limit: {
    type: Number,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isRemoved: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['Available', 'Lended'],
    default: 'Available',
    required: true,
  },
  location: {
    type: {
      address: {
        type: String,
        required: true,
      },
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
  },
  price: {
    type: Number,
    required: true,
  },
})

const BorrowedSchema: Schema<IBorrowed> = new mongoose.Schema({
  requestId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Requests',
  },
  from: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  isReturned: {
    type: Boolean,
    required: true,
    default: false,
  },
  remainingDays: {
    type: Number,
    required: true,
  },
  reportsMade: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Report',
      default: [],
    },
  ],
  keepingTime: {
    type: Date,
    required: true,
  },
  borrowedOn: {
    type: Date,
    default: new Date().getTime(),
  },
})

const LendedSchema: Schema<ILended> = new mongoose.Schema({
  requestId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Requests',
  },
  earnedScore: {
    type: String,
    required: true,
  },
  isReturned: {
    type: Boolean,
    required: true,
    default: false,
  },
  lendedTo: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  remainingDays: {
    type: Number,
    required: true,
  },
  reportsMade: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Report',
      default: [],
    },
  ],
  keepingTime: {
    type: Date,
    required: true,
  },
  lendedOn: {
    type: Date,
    default: () => new Date().getTime(),
  },
  hasMadeRefund: {
    type: Boolean,
    default: false,
  },
})

const BookShelfSchema: Schema<IBookShelf> = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  shelf: {
    type: [ShelfSchema],
    default: [],
  },
  borrowed: {
    type: [BorrowedSchema],
    default: [],
  },
  lended: {
    type: [LendedSchema],
    default: [],
  },
  isRestricted: {
    type: Boolean,
    required: true,
    default: false,
  },
})

const BookshelfModel: Model<IBookShelf> = mongoose.model<IBookShelf>(
  'BookShelf',
  BookShelfSchema
)

export default BookshelfModel
