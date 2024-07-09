import mongoose, { Document, Model, Schema, Types } from 'mongoose'
import { ILendscrore } from '../../entity/badgeEntity'
const LendScoreSchema: Schema<ILendscrore> = new mongoose.Schema({
  badgeId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Badge',
  },
  lendScore: {
    type: Number,
    default: 0,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  totalBooksBorrowed: {
    type: Number,
    required: true,
    default: 0,
  },
  totalBooksLended: {
    type: Number,
    required: true,
    default: 0,
  },
})

const LendScoreModel: Model<ILendscrore> = mongoose.model<ILendscrore>(
  'Lendscore',
  LendScoreSchema
)

export default LendScoreModel
