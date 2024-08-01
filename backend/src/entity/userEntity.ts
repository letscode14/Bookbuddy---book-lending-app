import mongoose from 'mongoose'

interface User {
  _id: string
  userName: string
  name: string
  email: string
  password: string
  age?: number
  isGoogleSignUp: boolean
  isSubscribed?: boolean
  createdAt: Date
  updateAt: Date
  followers: { userId: mongoose.Types.ObjectId; followedOn: Date }[]
  following: { userId: mongoose.Types.ObjectId; followedOn: Date }[]
  gender: string | boolean
  profile?: string
  privacy: boolean
  about: string
  contact: string
  lendscore: null | mongoose.Types.ObjectId
  isBlocked: boolean
  isDeleted: boolean
  role: string
  cautionDeposit: number
  paymentId: string
}

export default User
