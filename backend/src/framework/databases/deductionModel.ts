import mongoose, { Schema, Document, Model } from 'mongoose'

interface IDeduction extends Document {
  _id: string
  userId: Schema.Types.ObjectId
  deductions: [
    {
      amount: number
      note: string
      date: string
    },
  ]
}

const deductSchema: Schema<IDeduction> = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  deductions: {
    type: [
      {
        amount: {
          type: Number,
          required: true,
        },
        note: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    default: [],
  },
})
const deductionModel: Model<IDeduction> = mongoose.model(
  'Deduction',
  deductSchema
)
export default deductionModel
