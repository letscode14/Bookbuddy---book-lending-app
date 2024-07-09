import { UploadApiResponse, v2 as cloudinary } from 'cloudinary'
import { config } from 'dotenv'
import iCloudinary from '../../usecases/interface/ICloudinaryService'
config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

class Cloudinary implements iCloudinary {
  async cloudinaryUpload(
    file: [] | {}
  ): Promise<UploadApiResponse | UploadApiResponse[]> {
    if (Array.isArray(file)) {
      const uploadPromises = file.map((image) => {
        return cloudinary.uploader.upload(image.filepath, {
          folder: 'Bookbuddy',
        })
      })
      const cloudRes = await Promise.all(uploadPromises)

      return cloudRes
    } else {
      if ('filepath' in file) {
        const cloudRes = await cloudinary.uploader.upload(
          file.filepath as string,
          { folder: 'Bookbuddy' }
        )
        return cloudRes
      } else {
        throw new Error('Invalid file object')
      }
    }
  }
  async removeImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId)
      if (result) {
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting image:', error)
      return false
    }
  }
}

export default Cloudinary
