import mongoose from "mongoose";

interface Post {
  _id?: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  description: string;
  imageUrls: [{ publicId: mongoose.Types.ObjectId; secure_url: string }];
  updatedAt: Date;
  isAddedToBookShelf: boolean;
  likes: [];
  comments: [];
}
export default Post;
