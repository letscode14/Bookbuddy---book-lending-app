import { ObjectId, Document } from 'mongoose'
import User from './userEntity'

interface IMessage extends Document {
  _id: string
  chatId: ObjectId
  senderId: ObjectId | User
  content: string
  timeStamp: Date
  status: boolean
  type: string
  readAt: Date
  isDeleted: boolean
}

export default IMessage
