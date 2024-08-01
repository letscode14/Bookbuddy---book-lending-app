import { Document, Types } from 'mongoose'
import { IShelf } from './bookShelfEntity'

interface IRequest extends Document {
  _id: string
  madeBy: Types.ObjectId
  requestedOn: Date
  expiresAt: Date
  isAccepted: boolean
  book: IShelf
  isCancelled: boolean
  stage: string
  isPending: boolean
}

export default IRequest
