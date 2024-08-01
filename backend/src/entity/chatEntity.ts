import mongoose, { ObjectId } from 'mongoose'

interface IChat extends Document {
  _id: mongoose.Types.ObjectId
  participants: ObjectId[]
  sender: ObjectId[]
  lastMessage: { messageId: ObjectId | null; timeStamp: Date }
  chatBackground: { publicId: string; secureUrl: string }
  isDeleted: boolean
}

export default IChat
