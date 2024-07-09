import { UploadApiResponse } from 'cloudinary'

interface iCloudinary {
  cloudinaryUpload(
    file: [] | {}
  ): Promise<UploadApiResponse | UploadApiResponse[]>
  removeImage(publicId: string): Promise<boolean>
}

export default iCloudinary
