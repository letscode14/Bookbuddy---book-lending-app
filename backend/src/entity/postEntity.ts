import mongoose from 'mongoose'

interface Post {
  _id?: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  createdAt: Date
  description: string
  imageUrls: [{ publicId: mongoose.Types.ObjectId; secure_url: string }]
  updatedAt: Date
  isAddedToBookShelf: null | mongoose.Types.ObjectId
  likes: []
  comments: []
  ID: string

  reportCount: number
}
export default Post
