import { Document, Schema } from 'mongoose'
import IRequest from './requestEntity'

export interface IShelf extends Document {
  _id: string
  addedOn: Date
  author: string
  bookName: string
  description: string
  ID: string
  limit: String
  isDeleted: boolean
  isRemoved: boolean
  imageUrl: {
    publicId: string
    secure_url: string
  }
  status: 'Available' | 'Lended' | 'Returning'
  location: { address: string; lat: number; lng: number }
  price: number
}

export interface IBorrowed extends Document {
  requestId: Schema.Types.ObjectId | IRequest
  from: Schema.Types.ObjectId
  isReturned: boolean
  remainingDays: Number
  reportsMade: [{ isRemoved: boolean; reason: string; reportedOn: Date }]
  keepingTime: Date
  borrowedOn: Date
}

export interface ILended extends Document {
  requestId: Schema.Types.ObjectId | IRequest
  earnedScore: string
  isReturned: boolean
  lendedTo: Schema.Types.ObjectId
  remainingDays: number
  reportsMade: [{ isRemoved: boolean; reason: string; reportedOn: Date }]
  keepingTime: Date
  lendedOn: Date
  hasMadeRefund: boolean
}

export interface IBookShelf extends Document {
  userId: Schema.Types.ObjectId
  shelf: IShelf[]
  borrowed: IBorrowed[]
  lended: ILended[]
  isRestricted: boolean
}
