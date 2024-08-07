import mongoose, { Document, Schema } from 'mongoose'

export interface IBadge extends Document {
  _id: string
  name: string
  ID: string
  createdOn: Date | string
  minScore: number
  iconUrl: {
    secureUrl: string
    publicId: string
  }
  updatedOn: Date | string
  limit: number
  isDeleted: boolean
}

export interface ILendscrore extends Document {
  _id: string
  badgeId: IBadge | Schema.Types.ObjectId
  lendScore: number
  userId: Schema.Types.ObjectId
  totalBooksBorrowed: number
  totalBooksLended: number
}
