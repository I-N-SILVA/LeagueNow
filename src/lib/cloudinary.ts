import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  resource_type: string
  created_at: string
  bytes: number
}

export async function uploadToCloudinary(
  file: string | Buffer,
  options: {
    folder?: string
    public_id?: string
    resource_type?: 'image' | 'video' | 'raw' | 'auto'
    transformation?: unknown[]
    eager?: unknown[]
  } = {}
): Promise<CloudinaryUploadResult> {
  try {
    // Convert Buffer to base64 data URI if needed
    const fileToUpload = Buffer.isBuffer(file) 
      ? `data:image/upload;base64,${file.toString('base64')}`
      : file

    const result = await cloudinary.uploader.upload(fileToUpload, {
      folder: options.folder || 'leagueflow',
      resource_type: options.resource_type || 'auto',
      public_id: options.public_id,
      transformation: options.transformation,
      eager: options.eager,
      eager_async: true,
    })

    return result as CloudinaryUploadResult
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload file to Cloudinary')
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw new Error('Failed to delete file from Cloudinary')
  }
}

export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    crop?: string
    quality?: string | number
    format?: string
  } = {}
): string {
  return cloudinary.url(publicId, {
    width: options.width,
    height: options.height,
    crop: options.crop || 'fill',
    quality: options.quality || 'auto:good',
    format: options.format || 'auto',
    fetch_format: 'auto',
    dpr: 'auto',
  })
}

export function getVideoThumbnail(
  publicId: string,
  options: {
    width?: number
    height?: number
    quality?: string | number
  } = {}
): string {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    width: options.width || 400,
    height: options.height || 300,
    crop: 'fill',
    quality: options.quality || 'auto:good',
    format: 'jpg',
    start_offset: 'auto',
  })
}