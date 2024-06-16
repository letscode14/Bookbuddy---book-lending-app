import mongoose from "mongoose";

export const connecDB = async () => {
  try {
    const uri = process.env.MONGO_URI as string;
    await mongoose.connect(uri);
    console.log("Database connected");
  } catch (error) {
    console.log("Error in connecting the database", error);
  }
};
