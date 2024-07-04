import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReport extends Document {
  reportedBy: mongoose.Types.ObjectId;
  targetType: "Post" | "User" | "Transaction";
  targetId: mongoose.Types.ObjectId;
  reason: string;
  reportedOn: Date;
  status: "Pending" | "Reviewed" | "Resolved" | "Removed";
  resolution?: string;
  isRemoved: boolean;
}

const reportSchema: Schema<IReport> = new Schema({
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  targetType: {
    type: String,
    enum: ["Post", "User", "Transaction"],
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "targetType",
  },
  isRemoved: {
    type: Boolean,
    default: false,
  },
  reason: {
    type: String,
    required: true,
  },
  reportedOn: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Pending", "Reviewed", "Resolved", "Removed"],
    default: "Pending",
  },

  resolution: {
    type: String,
  },
});

const reportModel: Model<IReport> = mongoose.model("Report", reportSchema);

export default reportModel;
