import mongoose from 'mongoose'
import { Model, Schema, Types } from 'mongoose'
import IChat from '../../entity/chatEntity'

const chatSchema = new Schema<IChat>(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ],
    chatBackground: {
      publicId: {
        type: String,
        default: 'chat_default_r0plmt',
      },
      secureUrl: {
        type: String,
        default:
          'https://res.cloudinary.com/dcoy7olo9/image/upload/v1720547395/chat_defualt_r0plmt.jpg',
      },
    },
    sender: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: {
      messageId: {
        type: Schema.Types.ObjectId || null,
        ref: 'Message',
        default: null,
      },
      timeStamp: {
        type: Date,
        required: true,
        default: Date.now(),
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

const ChatModel: Model<IChat> = mongoose.model<IChat>('Chat', chatSchema)

export default ChatModel
