import IMessage from '../../entity/messageEntity'
import mongoose, { Schema, Model } from 'mongoose'

const messageSchema = new Schema({
  chatId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Chat',
  },
  type: {
    type: String,
    required: true,
    default: 'message',
    enum: ['message', 'request'],
  },
  senderId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  content: {
    type: Schema.Types.Mixed,
    required: true,
    ref: 'Requests',
  },
  timeStamp: {
    type: Date,
    required: true,
    default: () => new Date().getTime(),
  },
  status: { type: Boolean, required: true, default: false },
  readAt: { type: Date, required: true, default: () => new Date().getTime() },
  isDeleted: { type: Boolean, required: true, default: false },
})

const MessageModel: Model<IMessage> = mongoose.model<IMessage>(
  'Message',
  messageSchema
)

export default MessageModel
