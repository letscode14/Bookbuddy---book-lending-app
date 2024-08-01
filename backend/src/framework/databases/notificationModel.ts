import mongoose, { Types, Schema, Model } from 'mongoose'
import { INotification } from '../../entity/notificationEntity'

const notificationSchema = new Schema<INotification>({
  type: {
    type: String,
    enum: ['Post', 'User', 'Requests'],
    required: true,
  },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date().getTime() },
  read: { type: Boolean, default: false },
  contentId: { type: Schema.Types.ObjectId, required: true, refPath: 'type' },
  actionBy: {
    type: Schema.Types.ObjectId || null,
    required: true,
    refPath: 'User',
  },
  isDeleted: { type: Boolean, required: true, default: false },
})

const notificationModel: Model<INotification> = mongoose.model<INotification>(
  'notification',
  notificationSchema
)

export default notificationModel
