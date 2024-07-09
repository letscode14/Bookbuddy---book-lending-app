import mongoose, { Document, Model, Schema } from 'mongoose'
import shortid from 'shortid'

import { IBadge } from '../../entity/badgeEntity'
const BadgeSchema: Schema<IBadge> = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  ID: {
    type: String,
    required: true,
    default: () => `BADGE${shortid.generate()}`,
  },

  createdOn: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  minScore: {
    type: Number,
    required: true,
  },
  iconUrl: {
    type: {
      secureUrl: String,
      publicId: String,
    },
    required: true,
  },
  updatedOn: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  borrowLimit: {
    type: Number,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
})
const BadgeModel: Model<IBadge> = mongoose.model<IBadge>('Badge', BadgeSchema)

export default BadgeModel
