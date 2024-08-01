import { Document, Types, Schema } from 'mongoose'

export interface INotification extends Document {
  _id: string
  type: 'Post'
  content: string
  createdAt: Date
  read: boolean
  ownerId: Schema.Types.ObjectId | null
  contentId: Schema.Types.ObjectId | null
  actionBy: Schema.Types.ObjectId | null
  isDeleted: boolean
}
