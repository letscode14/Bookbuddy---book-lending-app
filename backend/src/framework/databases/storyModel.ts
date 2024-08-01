import mongoose, { Schema, Model } from 'mongoose'
import IStory from '../../entity/storyEntity'

const storySchema: Schema<IStory> = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  stories: {
    type: [
      {
        imageUrl: {
          type: Object,
          required: true,
        },
        addedOn: {
          type: Date,
          default: () => new Date().getTime(),
        },
        views: {
          type: Map,
          of: Boolean,
          default: {},
        },
      },
    ],
    default: [],
  },
})

const storyModel: Model<IStory> = mongoose.model('Story', storySchema)
export default storyModel
