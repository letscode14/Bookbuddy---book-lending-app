import mongoose, { Document, Model, Mongoose, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'
//
export interface IFollower {
  userId: mongoose.Types.ObjectId
  followedOn: Date
}

export interface IUser extends Document {
  _id: string
  userName: string
  name: string
  email: string
  password: string
  age: number
  reportCount: mongoose.Types.ObjectId[]
  reportsMade: mongoose.Types.ObjectId[]
  createdAt: Date
  updateAt: Date
  followers: IFollower[]
  following: IFollower[]
  gender: boolean | string
  profile?: { publicId: string; profileUrl: string }
  privacy: boolean
  about: string
  contact: string
  lendscore: null | mongoose.Types.ObjectId
  isBlocked: boolean

  isDeleted: boolean
  isSubscribed: boolean
  cautionDeposit: number
  role: string
  isGoogleSignUp: boolean
  location: {
    address: string
    lat: number
    lng: number
  }
  paymentId: string | null
}
const userSchema: Schema<IUser> = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },
  paymentId: {
    type: String || null,
    default: null,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    default: 0,
  },
  reportsMade: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Report',
      default: [],
    },
  ],

  reportCount: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Report',
      default: [],
    },
  ],
  cautionDeposit: {
    type: Number,
    default: 0,
  },
  isSubscribed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updateAt: {
    type: Date,
    default: Date.now(),
  },
  followers: {
    type: [
      {
        userId: {
          type: mongoose.Types.ObjectId,
          ref: 'User',
        },
        followedOn: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    default: [],
  },
  following: {
    type: [
      {
        userId: {
          type: mongoose.Types.ObjectId,
          ref: 'User',
        },
        followedOn: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    default: [],
  },
  gender: {
    type: String,
    default: '',
  },
  profile: {
    publicId: {
      type: String,
      default: '',
    },
    profileUrl: {
      type: String,
      default:
        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
    },
  },
  privacy: {
    type: Boolean,
    default: false,
  },
  about: {
    type: String,
    default: '',
  },
  contact: {
    type: String,
    default: '',
  },
  lendscore: {
    type: null || mongoose.Types.ObjectId,
    default: null,
    ref: 'Lendscore',
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,

    default: 'user',
  },
  isGoogleSignUp: {
    type: Boolean,
    default: false,
  },
  location: {
    type: {
      address: {
        type: String,
        required: true,
        default: '',
      },
      lat: {
        type: Number,
        required: true,
        default: 0,
      },
      lng: {
        type: Number,
        required: true,
        default: 0,
      },
    },
  },
})
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }
  this.password = await bcrypt.hash(this.password, 10)
  next()
})
userSchema.index({ userName: 'text', name: 'text' })

const userModel: Model<IUser> = mongoose.model('User', userSchema)

export default userModel
