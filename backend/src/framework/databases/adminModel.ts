import mongoose, { Schema, Document, Model } from "mongoose";

interface IAdmin extends Document {
  email: string;
  password: string;
  role: string;
}

const adminSchema: Schema<IAdmin> = new mongoose.Schema({
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    default: "admin",
  },
});

const adminModel: Model<IAdmin> = mongoose.model("admin", adminSchema);

export default adminModel;
