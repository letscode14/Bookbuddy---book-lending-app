import mongoose from 'mongoose'

interface User {
  _id?: string
  userName: string
  name: string
  email: string
  password: string
  age?: number

  isSubscribed?: boolean
  createdAt: Date
  updateAt: Date
  followers: { userId: mongoose.Types.ObjectId; followedOn: Date }[]
  following: { userId: mongoose.Types.ObjectId; followedOn: Date }[]
  gender: string | boolean
  profileUrl?: string
  privacy: boolean
  about: string
  contact: string
  lendscore: null | mongoose.Types.ObjectId
  isBlocked: boolean
  isDeleted: boolean
  role: string
}

export default User
