import cloudinary from 'cloudinary';
import { Readable } from 'stream';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadOptions {
  file: string | Buffer;
  folder?: string;
  publicId?: string;
  resourceType?: 'image' | 'video';
}

/**
 * Upload a file (image or video) to Cloudinary and return the URL.
 * @param options - Options for uploading the file
 * @returns A promise that resolves to the file URL
 */
const uploadToCloudinary = async (options: UploadOptions): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: cloudinary.UploadApiOptions = {
      folder: options.folder,
      public_id: options.publicId,
      resource_type: options.resourceType || 'image',
    };

    if (typeof options.file === 'string') {
      cloudinary.v2.uploader.upload(options.file, uploadOptions, (error, result) => {
        if (error) {
          return reject(new Error(`Failed to upload file: ${error.message}`));
        }
        resolve(result ? result.secure_url : '');
      });
    } else {
      const readableStream = new Readable();
      readableStream.push(options.file);
      readableStream.push(null);

      cloudinary.v2.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) {
          return reject(new Error(`Failed to upload file: ${error.message}`));
        }
        resolve(result ? result.secure_url : '');
      }).end(readableStream.read());
    }
  });
};

export default uploadToCloudinary;
