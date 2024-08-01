import mongoose, { Document, Model, Schema } from 'mongoose'
import IRequest from '../../entity/requestEntity'

const requestSchema = new Schema<IRequest>({
  madeBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  requestedOn: {
    type: Date,
    required: true,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isAccepted: { type: Boolean, default: false },
  book: { type: Object, required: true },
  isCancelled: { type: Boolean, default: false },
  stage: {
    type: String,
    default: 'requested',
    enum: [
      'requested',
      'approved',
      'times up',

      'declined',
      'expired',
      'collect',
      'transaction complete',
    ],
  },
  isPending: {
    type: Boolean,
    require: true,
    default: true,
  },
})

const RequestModel: Model<IRequest> = mongoose.model('Requests', requestSchema)
export default RequestModel
