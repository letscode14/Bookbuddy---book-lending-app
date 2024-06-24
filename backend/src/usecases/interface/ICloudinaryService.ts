import { UploadApiResponse } from "cloudinary";

interface iCloudinary {
  cloudinaryUpload(
    file: [] | {}
  ): Promise<UploadApiResponse | UploadApiResponse[]>;
}

export default iCloudinary;
