import { Document, Types } from 'mongoose'

export interface IStories {
  _id: string
  imageUrl: { secure_url: string; public_id: string }
  addedOn: Date
  views: Map<string, boolean>
}

interface IStory extends Document {
  userId: Types.ObjectId
  stories: IStories[]
}

export default IStory
